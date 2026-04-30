'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Shuffle, ChevronDown, ChevronUp } from 'lucide-react'
import {
  calculateShambleHandicap,
  calculateScrambleHandicap,
} from '@/lib/handicap'
import { createClient } from '@/lib/supabase'

// --- Mock Data (fallback) ---

type MockPlayer = {
  name: string
  handicap: number
}

const FALLBACK_PLAYERS: MockPlayer[] = [
  { name: 'S.Kilroy', handicap: 12 },
  { name: 'N.Cafritz', handicap: 14 },
  { name: 'G.Miller', handicap: 10 },
  { name: 'M.Mortazavi', handicap: 20 },
  { name: 'D.Sibrizzi', handicap: 18 },
  { name: 'Dan', handicap: 16 },
  { name: 'Karmali', handicap: 22 },
  { name: 'H.Lideborg', handicap: 24 },
]

type Pairing = [MockPlayer, MockPlayer]

type DayConfig = {
  day: number
  title: string
  format: string
  description: string
  handicapFn: (h1: number, h2: number) => number
}

const DAYS: DayConfig[] = [
  {
    day: 1,
    title: 'DAY 1 — BEST BALL SHAMBLE',
    format: 'Shamble',
    description:
      'All players tee off, pick the best drive, then play your own ball in. Random draw pairings.',
    handicapFn: calculateShambleHandicap,
  },
  {
    day: 2,
    title: 'DAY 2 — SCRAMBLE',
    format: 'Scramble',
    description:
      'Pick the best shot every time. Balanced remix — 1 stronger + 1 weaker player per team.',
    handicapFn: calculateScrambleHandicap,
  },
  {
    day: 3,
    title: 'DAY 3 — SCRAMBLE HYBRID',
    format: 'Scramble Hybrid',
    description:
      'Scramble off the tee, alternate shot from there. New pairings, no repeat partners.',
    handicapFn: calculateScrambleHandicap,
  },
]

// Current day of the tournament (1-indexed). In a real app, derive from date.
const CURRENT_DAY = 1

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function makePairings(players: MockPlayer[]): Pairing[] {
  const pairs: Pairing[] = []
  for (let i = 0; i < players.length; i += 2) {
    pairs.push([players[i], players[i + 1]])
  }
  return pairs
}

function makeBalancedPairings(players: MockPlayer[]): Pairing[] {
  const sorted = [...players].sort((a, b) => a.handicap - b.handicap)
  const pairs: Pairing[] = []
  for (let i = 0; i < sorted.length / 2; i++) {
    pairs.push([sorted[i], sorted[sorted.length - 1 - i]])
  }
  return shuffle(pairs)
}

function generateInitialPairings(playerList: MockPlayer[]): {
  day1: Pairing[]
  day2: Pairing[]
  day3: Pairing[]
} {
  return {
    day1: makePairings(shuffle(playerList)),
    day2: makeBalancedPairings(playerList),
    day3: makePairings(shuffle(playerList)),
  }
}

// --- Components ---

function TeamCard({
  pair,
  teamIndex,
  handicapFn,
}: {
  pair: Pairing
  teamIndex: number
  handicapFn: (h1: number, h2: number) => number
}) {
  const teamHcp = handicapFn(pair[0].handicap, pair[1].handicap)

  return (
    <div className="rounded-lg bg-golf-card border border-golf-border px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] tracking-widest text-golf-muted uppercase">
          Team {teamIndex + 1}
        </span>
        <span className="text-[11px] text-golf-yellow">
          Team HCP {teamHcp}
        </span>
      </div>
      <div className="space-y-1">
        {pair.map((player) => (
          <div key={player.name} className="flex items-center justify-between">
            <span className="text-sm text-golf-dark">{player.name}</span>
            <span className="text-xs text-golf-muted">{player.handicap}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DayCard({
  config,
  pairings,
  isCurrent,
  isExpanded,
  onToggle,
  onRandomize,
}: {
  config: DayConfig
  pairings: Pairing[]
  isCurrent: boolean
  isExpanded: boolean
  onToggle: () => void
  onRandomize?: () => void
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden shadow-sm ${
        isCurrent
          ? 'border-l-2 border-l-golf-green border-t border-r border-b border-golf-border'
          : 'border border-golf-border'
      } bg-golf-card`}
    >
      {/* Day header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-semibold tracking-wider text-golf-green uppercase">
            {config.title}
          </h2>
          {isExpanded && (
            <p className="mt-1.5 text-xs text-golf-muted leading-relaxed max-w-md">
              {config.description}
            </p>
          )}
        </div>
        <div className="ml-3 text-golf-muted">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-3">
          {onRandomize && (
            <button
              onClick={onRandomize}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-golf-green/40 text-golf-green text-[11px] font-medium tracking-wide uppercase transition-colors hover:bg-golf-green/5 active:scale-95 cursor-pointer"
            >
              <Shuffle className="h-3 w-3" />
              Randomize
            </button>
          )}

          <div className="space-y-2">
            {pairings.map((pair, idx) => (
              <TeamCard
                key={`${pair[0].name}-${pair[1].name}`}
                pair={pair}
                teamIndex={idx}
                handicapFn={config.handicapFn}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Page ---

export default function PairingsPage() {
  const [players, setPlayers] = useState<MockPlayer[]>(FALLBACK_PLAYERS)
  const [allPairings, setAllPairings] = useState(() => generateInitialPairings(FALLBACK_PLAYERS))
  const [expandedDay, setExpandedDay] = useState<number>(CURRENT_DAY)

  useEffect(() => {
    const supabase = createClient()

    async function fetchPlayers() {
      const { data } = await supabase.from('players').select('name, handicap')
      if (data && data.length > 0) {
        const fetched: MockPlayer[] = data.map((p) => ({
          name: p.name,
          handicap: p.handicap,
        }))
        setPlayers(fetched)
        setAllPairings(generateInitialPairings(fetched))
      }
    }

    fetchPlayers()
  }, [])

  const randomizeDay1 = useCallback(() => {
    setAllPairings((prev) => ({
      ...prev,
      day1: makePairings(shuffle(players)),
    }))
  }, [players])

  const pairingsByDay: Record<number, Pairing[]> = {
    1: allPairings.day1,
    2: allPairings.day2,
    3: allPairings.day3,
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-golf-green">
        <div className="mx-auto max-w-lg flex items-center gap-3 px-5 py-4">
          <Users className="h-5 w-5 text-golf-yellow" />
          <h1 className="text-sm font-semibold tracking-widest text-white uppercase">
            Pairings
          </h1>
        </div>
      </header>

      {/* Day Cards */}
      <div className="mx-auto max-w-lg px-4 py-6 space-y-3">
        {DAYS.map((config) => (
          <DayCard
            key={config.day}
            config={config}
            pairings={pairingsByDay[config.day]}
            isCurrent={config.day === CURRENT_DAY}
            isExpanded={expandedDay === config.day}
            onToggle={() =>
              setExpandedDay((prev) =>
                prev === config.day ? 0 : config.day
              )
            }
            onRandomize={config.day === 1 ? randomizeDay1 : undefined}
          />
        ))}

        <p className="text-center text-[11px] text-golf-muted pt-2 pb-4">
          No repeat partners across the weekend.
        </p>
      </div>
    </div>
  )
}
