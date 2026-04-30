'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CircleDot, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Player as DbPlayer, DotEvent as DbDotEvent } from '@/lib/types';

// --- Dot Type Definitions ---

interface DotTypeDef {
  label: string;
  dbKey: string;
  value: number;
}

const POSITIVE_DOTS: DotTypeDef[] = [
  { label: 'Longest Drive', dbKey: 'longest_drive', value: 1 },
  { label: 'Closest to Pin', dbKey: 'closest_pin', value: 1 },
  { label: 'Bunker Up & Down', dbKey: 'bunker_save', value: 1 },
  { label: '15\'+ Putt', dbKey: 'long_putt', value: 1 },
  { label: 'Winning Group', dbKey: 'winning_group', value: 3 },
  { label: 'Best Vibes', dbKey: 'best_vibes', value: 3 },
  { label: 'Best Relative', dbKey: 'best_performer', value: 2 },
];

const NEGATIVE_DOTS: DotTypeDef[] = [
  { label: 'Lost Ball', dbKey: 'lost_ball', value: -1 },
  { label: 'Water Ball', dbKey: 'water_ball', value: -1 },
  { label: 'Practice Divot', dbKey: 'practice_divot', value: -1 },
];

// Map from db dot_type to display label
const DOT_TYPE_LABELS: Record<string, string> = {};
for (const d of [...POSITIVE_DOTS, ...NEGATIVE_DOTS]) {
  DOT_TYPE_LABELS[d.dbKey] = d.label;
}

// --- Helpers ---

function portraitPath(name: string): string {
  return `/players/${name.toLowerCase().replace(/\./g, '_').replace(/\s+/g, '_')}.jpg`;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// --- Derived UI types ---

interface PlayerDots {
  id: string;
  name: string;
  dots: number;
  portrait: string;
}

interface DotEventUI {
  id: string;
  playerName: string;
  dotType: string;
  value: number;
  timestamp: Date;
}

function buildPlayerDots(players: DbPlayer[], events: DbDotEvent[]): PlayerDots[] {
  const dotsMap = new Map<string, number>();
  for (const ev of events) {
    dotsMap.set(ev.player_id, (dotsMap.get(ev.player_id) ?? 0) + ev.value);
  }
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    dots: dotsMap.get(p.id) ?? 0,
    portrait: portraitPath(p.name),
  }));
}

function buildEventList(events: DbDotEvent[], playerMap: Map<string, DbPlayer>): DotEventUI[] {
  return events
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((ev) => ({
      id: ev.id,
      playerName: playerMap.get(ev.player_id)?.name ?? 'Unknown',
      dotType: DOT_TYPE_LABELS[ev.dot_type] ?? ev.dot_type,
      value: ev.value,
      timestamp: new Date(ev.created_at),
    }));
}

// --- Component ---

export default function DotsPage() {
  const [dbPlayers, setDbPlayers] = useState<DbPlayer[]>([]);
  const [dbEvents, setDbEvents] = useState<DbDotEvent[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [playersRes, eventsRes] = await Promise.all([
        supabase.from('players').select('*'),
        supabase.from('dot_events').select('*'),
      ]);

      if (playersRes.data) setDbPlayers(playersRes.data);
      if (eventsRes.data) setDbEvents(eventsRes.data);
      setLoading(false);
    }

    fetchData();

    // Subscribe to realtime changes on dot_events
    const channel = supabase
      .channel('dot_events_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dot_events' },
        (payload) => {
          const newEvent = payload.new as DbDotEvent;
          setDbEvents((prev) => {
            if (prev.some((e) => e.id === newEvent.id)) return prev;
            return [...prev, newEvent];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'dot_events' },
        (payload) => {
          const oldEvent = payload.old as { id: string };
          setDbEvents((prev) => prev.filter((e) => e.id !== oldEvent.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const playerMap = new Map(dbPlayers.map((p) => [p.id, p]));
  const playerDots = buildPlayerDots(dbPlayers, dbEvents);
  const sortedPlayers = [...playerDots].sort((a, b) => b.dots - a.dots);
  const eventList = buildEventList(dbEvents, playerMap);

  async function handleAddDot(dotType: DotTypeDef) {
    if (!selectedPlayer) return;

    const supabase = createClient();

    const { data, error } = await supabase
      .from('dot_events')
      .insert({
        player_id: selectedPlayer,
        dot_type: dotType.dbKey,
        value: dotType.value,
        description: dotType.label,
      })
      .select()
      .single();

    if (!error && data) {
      setDbEvents((prev) => {
        if (prev.some((e) => e.id === data.id)) return prev;
        return [...prev, data];
      });
    }

    setSelectedPlayer(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-golf-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-golf-green">
        <div className="px-4 py-4 flex items-center gap-2">
          <CircleDot size={18} className="text-golf-yellow" />
          <h1 className="text-lg font-bold tracking-wide text-white font-[family-name:var(--font-playfair)]">
            DOTS
          </h1>
        </div>
      </div>

      <div className="px-4 pb-8 space-y-6">
        {/* Standings */}
        <section className="mt-4">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-golf-muted mb-3">
            Standings
          </h2>
          <div className="space-y-1.5">
            {sortedPlayers.map((player, index) => {
              const isSelected = selectedPlayer === player.id;
              return (
                <button
                  key={player.id}
                  onClick={() =>
                    setSelectedPlayer(isSelected ? null : player.id)
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-golf-green/5 ring-1 ring-golf-green/20'
                      : 'bg-golf-card border border-golf-border shadow-sm hover:bg-white'
                  }`}
                >
                  {/* Rank */}
                  <span className="text-xs font-medium w-5 text-center text-golf-muted">
                    {index + 1}
                  </span>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 relative">
                    <Image
                      src={player.portrait}
                      alt={player.name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>

                  {/* Name */}
                  <span className="text-sm font-medium text-golf-dark flex-1 text-left">
                    {player.name}
                  </span>

                  {/* Dot Count */}
                  <div
                    className={`min-w-[2.5rem] text-right text-base font-bold tabular-nums ${
                      player.dots > 0
                        ? 'text-golf-green-light'
                        : player.dots < 0
                        ? 'text-golf-red'
                        : 'text-golf-muted'
                    }`}
                  >
                    {player.dots > 0 ? `+${player.dots}` : player.dots}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Quick Add */}
        <section>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-golf-muted mb-3">
            Quick Add
          </h2>

          {!selectedPlayer ? (
            <div className="bg-golf-card border border-golf-border rounded-lg p-6 text-center shadow-sm">
              <p className="text-sm text-golf-muted">
                Tap a player to add dots
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected player indicator */}
              <div className="bg-golf-card border border-golf-border rounded-lg px-4 py-2.5 flex items-center justify-between shadow-sm">
                <p className="text-sm text-golf-dark/60">
                  Adding for{' '}
                  <span className="font-semibold text-golf-dark">
                    {playerDots.find((p) => p.id === selectedPlayer)?.name}
                  </span>
                </p>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-xs text-golf-muted hover:text-golf-dark/60 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Earn dots */}
              <div>
                <p className="text-[10px] text-golf-green-light/60 font-medium uppercase tracking-[0.2em] mb-2">
                  Earn
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {POSITIVE_DOTS.map((dot) => (
                    <button
                      key={dot.label}
                      onClick={() => handleAddDot(dot)}
                      className="flex items-center justify-between bg-golf-card hover:bg-golf-green-light/10 active:bg-golf-green-light/15 border border-golf-border hover:border-golf-green-light/20 rounded-lg px-3 py-2.5 transition-all"
                    >
                      <span className="text-sm text-golf-dark/80">
                        {dot.label}
                      </span>
                      <span className="text-xs font-bold text-golf-green-light ml-2">
                        +{dot.value}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lose dots */}
              <div>
                <p className="text-[10px] text-golf-red/60 font-medium uppercase tracking-[0.2em] mb-2">
                  Lose
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {NEGATIVE_DOTS.map((dot) => (
                    <button
                      key={dot.label}
                      onClick={() => handleAddDot(dot)}
                      className="flex items-center justify-between bg-golf-card hover:bg-golf-red/10 active:bg-golf-red/15 border border-golf-border hover:border-golf-red/20 rounded-lg px-3 py-2.5 transition-all"
                    >
                      <span className="text-sm text-golf-dark/80">
                        {dot.label}
                      </span>
                      <span className="text-xs font-bold text-golf-red ml-2">
                        {dot.value}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-golf-muted mb-3">
            Activity
          </h2>
          <div className="bg-golf-card border border-golf-border rounded-xl shadow-sm divide-y divide-golf-border">
            {eventList.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-golf-dark/70 truncate">
                    <span className="font-medium text-golf-dark">{event.playerName}</span>{' '}
                    <span className="text-golf-muted">{event.dotType}</span>{' '}
                    <span
                      className={`font-bold ${
                        event.value > 0 ? 'text-golf-green-light' : 'text-golf-red'
                      }`}
                    >
                      {event.value > 0 ? `+${event.value}` : event.value}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-golf-muted shrink-0">
                  <Clock size={11} />
                  <span className="text-xs">{timeAgo(event.timestamp)}</span>
                </div>
              </div>
            ))}

            {eventList.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-golf-muted">
                No dots recorded yet
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
