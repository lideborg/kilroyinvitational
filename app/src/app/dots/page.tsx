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
  { id: '1', name: 'Mike', dots: 7, trend: 2, avatar: 'M' },
  { id: '2', name: 'Kilroy', dots: 5, trend: 1, avatar: 'K' },
  { id: '3', name: 'Danny', dots: 4, trend: 0, avatar: 'D' },
  { id: '4', name: 'Jake', dots: 3, trend: -1, avatar: 'J' },
  { id: '5', name: 'Sully', dots: 2, trend: 1, avatar: 'S' },
  { id: '6', name: 'Hamp', dots: 1, trend: -2, avatar: 'H' },
  { id: '7', name: 'Trev', dots: 0, trend: 0, avatar: 'T' },
  { id: '8', name: 'Chase', dots: -1, trend: -1, avatar: 'C' },
];

const INITIAL_EVENTS: DotEvent[] = [
  {
    id: 'e1',
    playerId: '1',
    playerName: 'Mike',
    dotType: 'Longest Drive',
    value: 1,
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 'e2',
    playerId: '2',
    playerName: 'Kilroy',
    dotType: 'Closest to Pin',
    value: 1,
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: 'e3',
    playerId: '8',
    playerName: 'Chase',
    dotType: 'Water Ball',
    value: -1,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'e4',
    playerId: '1',
    playerName: 'Mike',
    dotType: 'Bunker Up & Down',
    value: 1,
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
  },
  {
    id: 'e5',
    playerId: '5',
    playerName: 'Sully',
    dotType: '15\'+ Putt Made',
    value: 1,
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
  },
  {
    id: 'e6',
    playerId: '6',
    playerName: 'Hamp',
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
    <div className="min-h-screen bg-golf-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-golf-dark/90 backdrop-blur-md border-b border-white/5">
        <div className="px-4 py-3 flex items-center gap-2">
          <Target size={18} className="text-golf-teal" />
          <h1 className="text-lg font-bold tracking-wide text-golf-cream font-[family-name:var(--font-playfair)]">
            DOTS
          </h1>
        </div>
      </div>

      <div className="px-4 pb-8 space-y-6">
        {/* Standings */}
        <section className="mt-4">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-golf-cream/40 mb-3">
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
                      ? 'bg-golf-teal/10 ring-1 ring-golf-teal/30'
                      : 'bg-golf-card hover:bg-golf-card/80'
                  }`}
                >
                  {/* Rank */}
                  <span className="text-xs font-medium w-5 text-center text-golf-cream/30">
                    {index + 1}
                  </span>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-medium text-golf-cream/50 shrink-0">
                    {player.avatar}
                  </div>

                  {/* Name */}
                  <span className="text-sm font-medium text-golf-cream flex-1 text-left">
                    {player.name}
                  </span>

                  {/* Dot Count */}
                  <div
                    className={`min-w-[2.5rem] text-right text-base font-bold tabular-nums ${
                      player.dots > 0
                        ? 'text-golf-teal'
                        : player.dots < 0
                        ? 'text-golf-coral'
                        : 'text-golf-cream/30'
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
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-golf-cream/40 mb-3">
            Quick Add
          </h2>

          {!selectedPlayer ? (
            <div className="bg-golf-card rounded-lg p-6 text-center">
              <p className="text-sm text-golf-cream/30">
                Tap a player to add dots
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected player indicator */}
              <div className="bg-golf-card rounded-lg px-4 py-2.5 flex items-center justify-between">
                <p className="text-sm text-golf-cream/60">
                  Adding for{' '}
                  <span className="font-semibold text-golf-cream">
                    {players.find((p) => p.id === selectedPlayer)?.name}
                  </span>
                </p>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-xs text-golf-cream/30 hover:text-golf-cream/60 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Earn dots */}
              <div>
                <p className="text-[10px] text-golf-teal/60 font-medium uppercase tracking-[0.2em] mb-2">
                  Earn
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {POSITIVE_DOTS.map((dot) => (
                    <button
                      key={dot.label}
                      onClick={() => handleAddDot(dot)}
                      className="flex items-center justify-between bg-golf-card hover:bg-golf-teal/10 active:bg-golf-teal/15 border border-white/5 hover:border-golf-teal/20 rounded-lg px-3 py-2.5 transition-all"
                    >
                      <span className="text-sm text-golf-cream/80">
                        {dot.label}
                      </span>
                      <span className="text-xs font-bold text-golf-teal ml-2">
                        +{dot.value}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lose dots */}
              <div>
                <p className="text-[10px] text-golf-coral/60 font-medium uppercase tracking-[0.2em] mb-2">
                  Lose
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {NEGATIVE_DOTS.map((dot) => (
                    <button
                      key={dot.label}
                      onClick={() => handleAddDot(dot)}
                      className="flex items-center justify-between bg-golf-card hover:bg-golf-coral/10 active:bg-golf-coral/15 border border-white/5 hover:border-golf-coral/20 rounded-lg px-3 py-2.5 transition-all"
                    >
                      <span className="text-sm text-golf-cream/80">
                        {dot.label}
                      </span>
                      <span className="text-xs font-bold text-golf-coral ml-2">
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
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-golf-cream/40 mb-3">
            Activity
          </h2>
          <div className="bg-golf-card rounded-lg divide-y divide-white/5">
            {events.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-golf-cream/70 truncate">
                    <span className="font-medium text-golf-cream">{event.playerName}</span>{' '}
                    <span className="text-golf-cream/40">{event.dotType}</span>{' '}
                    <span
                      className={`font-bold ${
                        event.value > 0 ? 'text-golf-teal' : 'text-golf-coral'
                      }`}
                    >
                      {event.value > 0 ? `+${event.value}` : event.value}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-golf-cream/20 shrink-0">
                  <Clock size={11} />
                  <span className="text-xs">{timeAgo(event.timestamp)}</span>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-golf-cream/20">
                No dots recorded yet
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
