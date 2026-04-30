'use client';

import { useState } from 'react';
import { Target, Clock } from 'lucide-react';

// --- Types ---

interface DotEvent {
  id: string;
  playerId: string;
  playerName: string;
  dotType: string;
  value: number;
  timestamp: Date;
}

interface Player {
  id: string;
  name: string;
  dots: number;
  trend: number;
  avatar: string;
}

// --- Mock Data ---

const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'S.Kilroy', dots: 7, trend: 2, avatar: 'SK' },
  { id: '2', name: 'N.Cafritz', dots: 5, trend: 1, avatar: 'NC' },
  { id: '3', name: 'G.Miller', dots: 4, trend: 0, avatar: 'GM' },
  { id: '4', name: 'M.Mortazavi', dots: 3, trend: -1, avatar: 'MM' },
  { id: '5', name: 'D.Sibrizzi', dots: 2, trend: 1, avatar: 'DS' },
  { id: '6', name: 'Dan', dots: 1, trend: -2, avatar: 'D' },
  { id: '7', name: 'Karmali', dots: 0, trend: 0, avatar: 'K' },
  { id: '8', name: 'H.Lideborg', dots: -1, trend: -1, avatar: 'HL' },
];

const INITIAL_EVENTS: DotEvent[] = [
  {
    id: 'e1',
    playerId: '1',
    playerName: 'S.Kilroy',
    dotType: 'Longest Drive',
    value: 1,
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 'e2',
    playerId: '2',
    playerName: 'N.Cafritz',
    dotType: 'Closest to Pin',
    value: 1,
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: 'e3',
    playerId: '8',
    playerName: 'H.Lideborg',
    dotType: 'Water Ball',
    value: -1,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'e4',
    playerId: '1',
    playerName: 'S.Kilroy',
    dotType: 'Bunker Up & Down',
    value: 1,
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
  },
  {
    id: 'e5',
    playerId: '5',
    playerName: 'D.Sibrizzi',
    dotType: '15\'+ Putt Made',
    value: 1,
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
  },
  {
    id: 'e6',
    playerId: '6',
    playerName: 'Dan',
    dotType: 'Lost Ball',
    value: -1,
    timestamp: new Date(Date.now() - 48 * 60 * 1000),
  },
];

// --- Dot Type Definitions ---

interface DotType {
  label: string;
  value: number;
}

const POSITIVE_DOTS: DotType[] = [
  { label: 'Longest Drive', value: 1 },
  { label: 'Closest to Pin', value: 1 },
  { label: 'Bunker Up & Down', value: 1 },
  { label: '15\'+ Putt', value: 1 },
  { label: 'Winning Group', value: 3 },
  { label: 'Best Vibes', value: 3 },
  { label: 'Best Relative', value: 2 },
];

const NEGATIVE_DOTS: DotType[] = [
  { label: 'Lost Ball', value: -1 },
  { label: 'Water Ball', value: -1 },
  { label: 'Practice Divot', value: -1 },
];

// --- Helpers ---

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// --- Component ---

export default function DotsPage() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [events, setEvents] = useState<DotEvent[]>(INITIAL_EVENTS);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const sortedPlayers = [...players].sort((a, b) => b.dots - a.dots);

  function handleAddDot(dotType: DotType) {
    if (!selectedPlayer) return;

    const player = players.find((p) => p.id === selectedPlayer);
    if (!player) return;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === selectedPlayer
          ? { ...p, dots: p.dots + dotType.value, trend: p.trend + dotType.value }
          : p
      )
    );

    const newEvent: DotEvent = {
      id: `e${Date.now()}`,
      playerId: selectedPlayer,
      playerName: player.name,
      dotType: dotType.label,
      value: dotType.value,
      timestamp: new Date(),
    };
    setEvents((prev) => [newEvent, ...prev]);

    setSelectedPlayer(null);
  }

  return (
    <div className="min-h-screen bg-golf-cream">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-golf-cream/95 backdrop-blur-md border-b border-golf-border">
        <div className="px-4 py-3 flex items-center gap-2">
          <Target size={18} className="text-golf-green" />
          <h1 className="text-lg font-bold tracking-wide text-golf-dark font-[family-name:var(--font-playfair)]">
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
                      : 'bg-golf-card border border-golf-border shadow-sm hover:bg-golf-cream'
                  }`}
                >
                  {/* Rank */}
                  <span className="text-xs font-medium w-5 text-center text-golf-muted">
                    {index + 1}
                  </span>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-golf-cream flex items-center justify-center text-xs font-medium text-golf-muted shrink-0">
                    {player.avatar}
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
                    {players.find((p) => p.id === selectedPlayer)?.name}
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
            {events.slice(0, 10).map((event) => (
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

            {events.length === 0 && (
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
