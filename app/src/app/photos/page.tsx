"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

// NOTE: You must create a "photos" bucket in Supabase Storage with public access.
// Go to Supabase Dashboard > Storage > New Bucket > name: "photos", public: true

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

type Photo = {
  id: number;
  url: string;
  caption: string;
  player_id: string;
  player_name: string;
  day: number;
  created_at: string;
};

type Player = {
  id: string;
  name: string;
};

type PendingPhoto = {
  file: File;
  preview: string;
  caption: string;
  captionLoading: boolean;
};

const DAYS = ["All", "Day 1", "Day 2", "Day 3"] as const;

const PLACEHOLDER_HEIGHTS = [
  "h-44",
  "h-56",
  "h-48",
  "h-60",
  "h-52",
  "h-40",
  "h-52",
  "h-44",
  "h-56",
  "h-48",
];

export default function PhotosPage() {
  const [activeDay, setActiveDay] = useState<string>("All");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadDay, setUploadDay] = useState<number>(1);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("photos")
      .select("id, url, caption, day, created_at, player_id, players(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching photos:", error);
      return;
    }

    const mapped: Photo[] = (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as number,
      url: row.url as string,
      caption: row.caption as string,
      player_id: row.player_id as string,
      player_name: (row.players as Record<string, unknown>)?.name as string || "Unknown",
      day: row.day as number,
      created_at: row.created_at as string,
    }));

    setPhotos(mapped);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();

      // Fetch players
      const { data: playerData } = await supabase
        .from("players")
        .select("id, name")
        .order("name");

      if (playerData) {
        setPlayers(playerData);
      }

      await fetchPhotos();
      setLoading(false);
    }
    init();
  }, [fetchPhotos]);

  const filtered =
    activeDay === "All"
      ? photos
      : photos.filter((p) => `Day ${p.day}` === activeDay);

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function generateCaption(base64: string): Promise<string> {
    try {
      const res = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      if (!res.ok) throw new Error("Caption request failed");
      const data = await res.json();
      return data.caption || "No caption";
    } catch {
      return "Caption unavailable";
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Create pending entries with loading state
    const newPending: PendingPhoto[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      captionLoading: true,
    }));

    const prevLength = pendingPhotos.length;
    setPendingPhotos((prev) => [...prev, ...newPending]);

    // Generate captions in parallel
    for (let i = 0; i < files.length; i++) {
      const idx = prevLength + i;
      fileToBase64(files[i]).then((base64) =>
        generateCaption(base64).then((caption) =>
          setPendingPhotos((prev) =>
            prev.map((p, j) =>
              j === idx ? { ...p, caption, captionLoading: false } : p
            )
          )
        )
      );
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removePendingPhoto(index: number) {
    setPendingPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function updateCaption(index: number, caption: string) {
    setPendingPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, caption } : p))
    );
  }

  async function handleUpload() {
    if (!selectedPlayer || pendingPhotos.length === 0) return;

    setUploading(true);
    const supabase = createClient();

    try {
      for (const pending of pendingPhotos) {
        const ext = pending.file.name.split(".").pop() || "jpg";
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(filename, pending.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        // Construct public URL
        const url = `${SUPABASE_URL}/storage/v1/object/public/photos/${filename}`;

        // Insert record
        const { error: insertError } = await supabase.from("photos").insert({
          player_id: selectedPlayer,
          url,
          caption: pending.caption,
          day: uploadDay,
        });

        if (insertError) {
          console.error("Insert error:", insertError);
        }
      }

      // Cleanup previews
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPendingPhotos([]);
      setShowUpload(false);
      setSelectedPlayer("");
      setUploadDay(1);

      // Refresh photos
      await fetchPhotos();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  function closeModal() {
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPendingPhotos([]);
    setShowUpload(false);
    setSelectedPlayer("");
    setUploadDay(1);
  }

  const canSubmit =
    selectedPlayer &&
    pendingPhotos.length > 0 &&
    !pendingPhotos.some((p) => p.captionLoading);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-golf-green">
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-golf-yellow" />
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white tracking-tight">
              PHOTO DUMP
            </h1>
          </div>
        </div>

        {/* Day filter tabs */}
        <div className="flex gap-2 px-4 pb-3">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeDay === day
                  ? "bg-golf-yellow text-golf-dark"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      <div className="px-3 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-golf-muted">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p className="text-sm">Loading photos...</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 space-y-3">
            {filtered.map((photo, i) => (
              <div
                key={photo.id}
                className="break-inside-avoid rounded-xl overflow-hidden bg-golf-card border border-golf-border shadow-sm"
              >
                {/* Photo image */}
                <div
                  className={`${PLACEHOLDER_HEIGHTS[i % PLACEHOLDER_HEIGHTS.length]} w-full relative bg-golf-green/10`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm text-golf-dark font-medium leading-snug">
                    {photo.caption}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-golf-muted">
                      {photo.player_name}
                    </span>
                    <span className="text-[10px] text-golf-green/60 font-medium">
                      Day {photo.day}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-golf-muted">
            <ImageIcon className="h-12 w-12 mb-3" />
            <p className="text-sm">No photos yet for this day</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-golf-green shadow-lg shadow-golf-green/25 active:scale-95 transition-transform"
      >
        <Plus className="h-7 w-7 text-white" />
      </button>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-lg rounded-t-2xl bg-white px-5 pt-4 pb-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-golf-border" />

            <button
              onClick={closeModal}
              className="absolute right-4 top-4 p-1 text-golf-muted hover:text-golf-dark z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-golf-dark mb-3">
              Upload Photos
            </h2>

            {/* Player select */}
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full rounded-lg bg-white border border-golf-border px-3 py-2.5 text-sm text-golf-dark focus:outline-none focus:border-golf-green/50 mb-3 appearance-none"
            >
              <option value="">Select your name...</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Drop zone / file picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-golf-border bg-white py-6 mb-3 active:bg-golf-border/30 transition-colors"
            >
              <Upload className="h-7 w-7 text-golf-muted mb-2" />
              <p className="text-sm text-golf-muted">
                Tap to select photos
              </p>
              <p className="text-xs text-golf-muted/60 mt-0.5">
                JPG, PNG up to 10MB each
              </p>
            </button>

            {/* Pending photo thumbnails with captions */}
            {pendingPhotos.length > 0 && (
              <div className="space-y-3 mb-3">
                {pendingPhotos.map((pending, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-lg border border-golf-border bg-white p-2"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-golf-green/10">
                      <img
                        src={pending.preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => removePendingPhoto(i)}
                        className="absolute top-0.5 right-0.5 rounded-full bg-black/50 p-0.5"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center">
                      {pending.captionLoading ? (
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-golf-yellow animate-pulse" />
                          <span className="text-xs text-golf-muted">
                            Generating caption...
                          </span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={pending.caption}
                          onChange={(e) => updateCaption(i, e.target.value)}
                          placeholder="Caption..."
                          className="w-full rounded-md bg-white border border-golf-border px-2 py-1.5 text-sm text-golf-dark placeholder:text-golf-muted focus:outline-none focus:border-golf-green/50"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Day selector */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  onClick={() => setUploadDay(d)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    uploadDay === d
                      ? "bg-golf-green text-white"
                      : "bg-white border border-golf-border text-golf-muted hover:bg-white/80"
                  }`}
                >
                  Day {d}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button
              onClick={handleUpload}
              disabled={!canSubmit || uploading}
              className="w-full rounded-xl bg-golf-green py-3 text-sm font-semibold text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload{pendingPhotos.length > 0 ? ` (${pendingPhotos.length})` : ""}
                </>
              )}
            </button>

            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
