"use client";

import { useState } from "react";
import { Camera, Plus, Upload, X, Image as ImageIcon } from "lucide-react";

type Photo = {
  id: number;
  caption: string;
  player: string;
  day: number;
  color: string;
};

const MOCK_PHOTOS: Photo[] = [
  {
    id: 1,
    caption: "First tee vibes",
    player: "Mike K.",
    day: 1,
    color: "bg-golf-coral/30",
  },
  {
    id: 2,
    caption: "Someone find Mike's ball",
    player: "Jake R.",
    day: 1,
    color: "bg-golf-teal/20",
  },
  {
    id: 3,
    caption: "19th hole celebration",
    player: "Tommy B.",
    day: 1,
    color: "bg-golf-yellow/20",
  },
  {
    id: 4,
    caption: "Cart path only? More like cart path party",
    player: "Danny L.",
    day: 2,
    color: "bg-golf-coral/20",
  },
  {
    id: 5,
    caption: "The groom can actually putt",
    player: "Chris W.",
    day: 2,
    color: "bg-golf-teal/30",
  },
  {
    id: 6,
    caption: "Sunset on 18. What a weekend",
    player: "Mike K.",
    day: 3,
    color: "bg-golf-yellow/25",
  },
];

const DAYS = ["All", "Day 1", "Day 2", "Day 3"] as const;

const PLACEHOLDER_HEIGHTS = ["h-44", "h-56", "h-48", "h-60", "h-52", "h-40"];

export default function PhotosPage() {
  const [activeDay, setActiveDay] = useState<string>("All");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadDay, setUploadDay] = useState<number>(1);
  const [caption, setCaption] = useState("");

  const filtered =
    activeDay === "All"
      ? MOCK_PHOTOS
      : MOCK_PHOTOS.filter((p) => `Day ${p.day}` === activeDay);

  return (
    <div className="min-h-screen bg-golf-cream">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-golf-cream/95 backdrop-blur-sm border-b border-golf-border">
        <div className="px-4 pt-6 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-golf-yellow" />
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-golf-dark tracking-tight">
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
                  ? "bg-golf-green text-white"
                  : "bg-golf-card border border-golf-border text-golf-muted hover:bg-golf-cream"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      <div className="px-3 py-4">
        <div className="columns-2 gap-3 space-y-3">
          {filtered.map((photo, i) => (
            <div
              key={photo.id}
              className="break-inside-avoid rounded-xl overflow-hidden bg-golf-card border border-golf-border shadow-sm"
            >
              {/* Placeholder image */}
              <div
                className={`${photo.color} ${PLACEHOLDER_HEIGHTS[i % PLACEHOLDER_HEIGHTS.length]} w-full flex items-center justify-center`}
              >
                <Camera className="h-10 w-10 text-white/15" />
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm text-golf-dark font-medium leading-snug">
                  {photo.caption}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-golf-muted">
                    {photo.player}
                  </span>
                  <span className="text-[10px] text-golf-green/60 font-medium">
                    Day {photo.day}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
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
            onClick={() => setShowUpload(false)}
          />

          <div className="relative w-full max-w-lg rounded-t-2xl bg-white px-5 pt-4 pb-6 animate-slide-up">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-golf-border" />

            <button
              onClick={() => setShowUpload(false)}
              className="absolute right-4 top-4 p-1 text-golf-muted hover:text-golf-dark"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-golf-dark mb-3">
              Upload Photo
            </h2>

            {/* Drop zone */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-golf-border bg-golf-cream py-8 mb-3">
              <Upload className="h-7 w-7 text-golf-muted mb-2" />
              <p className="text-sm text-golf-muted">
                Tap to select a photo
              </p>
              <p className="text-xs text-golf-muted/60 mt-0.5">
                JPG, PNG up to 10MB
              </p>
            </div>

            {/* Caption */}
            <input
              type="text"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-lg bg-golf-cream border border-golf-border px-3 py-2.5 text-sm text-golf-dark placeholder:text-golf-muted focus:outline-none focus:border-golf-green/50 mb-3"
            />

            {/* Day selector */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  onClick={() => setUploadDay(d)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    uploadDay === d
                      ? "bg-golf-green text-white"
                      : "bg-golf-cream border border-golf-border text-golf-muted hover:bg-golf-cream/80"
                  }`}
                >
                  Day {d}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button className="w-full rounded-xl bg-golf-green py-3 text-sm font-semibold text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
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
