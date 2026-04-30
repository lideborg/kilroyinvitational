'use client'

import { useState } from 'react'
import type { Player, Team, Round } from '@/lib/types'

// --- Mock Data ---

const mockPlayers: Player[] = [
  { id: 'p1', name: 'S.Kilroy', handicap: 12, created_at: '' },
  { id: 'p2', name: 'N.Cafritz', handicap: 14, created_at: '' },
  { id: 'p3', name: 'G.Miller', handicap: 10, created_at: '' },
  { id: 'p4', name: 'M.Mortazavi', handicap: 20, created_at: '' },
  { id: 'p5', name: 'D.Sibrizzi', handicap: 18, created_at: '' },
  { id: 'p6', name: 'Dan', handicap: 16, created_at: '' },
  { id: 'p7', name: 'Karmali', handicap: 22, created_at: '' },
  { id: 'p8', name: 'H.Lideborg', handicap: 24, created_at: '' },
]

const mockRounds: Round[] = [
  { id: 'r1', day: 1, format: 'shamble', course_name: 'Omni National', created_at: '' },
  { id: 'r2', day: 2, format: 'scramble', course_name: 'Omni International', created_at: '' },
  { id: 'r3', day: 3, format: 'scramble_hybrid', course_name: 'Celebration Golf Club', created_at: '' },
]

const mockTeams: Team[] = [
  // Day 1 — Shamble
  { id: 't1', round_id: 'r1', player1_id: 'p1', player2_id: 'p2', team_handicap: 11, gross_score: 74, net_score: 63 },
  { id: 't2', round_id: 'r1', player1_id: 'p3', player2_id: 'p4', team_handicap: 12, gross_score: 78, net_score: 66 },
  { id: 't3', round_id: 'r1', player1_id: 'p5', player2_id: 'p6', team_handicap: 11, gross_score: 80, net_score: 69 },
  { id: 't4', round_id: 'r1', player1_id: 'p7', player2_id: 'p8', team_handicap: 18, gross_score: 85, net_score: 67 },
  // Day 2 — Scramble
  { id: 't5', round_id: 'r2', player1_id: 'p1', player2_id: 'p4', team_handicap: 13, gross_score: 68, net_score: 55 },
  { id: 't6', round_id: 'r2', player1_id: 'p3', player2_id: 'p6', team_handicap: 9, gross_score: 66, net_score: 57 },
  { id: 't7', round_id: 'r2', player1_id: 'p5', player2_id: 'p8', team_handicap: 15, gross_score: 72, net_score: 57 },
  { id: 't8', round_id: 'r2', player1_id: 'p7', player2_id: 'p2', team_handicap: 15, gross_score: 75, net_score: 60 },
  // Day 3 — Hybrid
  { id: 't9', round_id: 'r3', player1_id: 'p1', player2_id: 'p6', team_handicap: 11, gross_score: 71, net_score: 60 },
  { id: 't10', round_id: 'r3', player1_id: 'p3', player2_id: 'p8', team_handicap: 13, gross_score: 76, net_score: 63 },
  { id: 't11', round_id: 'r3', player1_id: 'p5', player2_id: 'p2', team_handicap: 13, gross_score: 77, net_score: 64 },
  { id: 't12', round_id: 'r3', player1_id: 'p7', player2_id: 'p4', team_handicap: 17, gross_score: 82, net_score: 65 },
]

// --- Helpers ---

const playerMap = new Map(mockPlayers.map((p) => [p.id, p]))
const roundMap = new Map(mockRounds.map((r) => [r.id, r]))

type DayTab = 1 | 2 | 3 | 'overall'

const formatLabels: Record<Round['format'], string> = {
  shamble: 'Shamble',
  scramble: 'Scramble',
  scramble_hybrid: 'Hybrid',
}

type Standing = {
  rank: number
  player1Name: string
  player2Name: string
  netScore: number
  grossScore: number
  format: string
}

function getStandingsForDay(day: 1 | 2 | 3): Standing[] {
  const round = mockRounds.find((r) => r.day === day)
  if (!round) return []

  const dayTeams = mockTeams
    .filter((t) => t.round_id === round.id)
    .sort((a, b) => (a.net_score ?? 999) - (b.net_score ?? 999))

  return dayTeams.map((team, i) => ({
    rank: i + 1,
    player1Name: playerMap.get(team.player1_id)?.name ?? 'Unknown',
    player2Name: playerMap.get(team.player2_id)?.name ?? 'Unknown',
    netScore: team.net_score ?? 0,
    grossScore: team.gross_score ?? 0,
    format: formatLabels[round.format],
  }))
}

function getOverallStandings(): Standing[] {
  const pairScores = new Map<string, { net: number; gross: number; p1: string; p2: string; formats: Set<string> }>()

  for (const team of mockTeams) {
    const round = roundMap.get(team.round_id)
    if (!round) continue
    const p1 = playerMap.get(team.player1_id)?.name ?? 'Unknown'
    const p2 = playerMap.get(team.player2_id)?.name ?? 'Unknown'
    const key = [team.player1_id, team.player2_id].sort().join('-')
    const existing = pairScores.get(key)
    if (existing) {
      existing.net += team.net_score ?? 0
      existing.gross += team.gross_score ?? 0
      existing.formats.add(formatLabels[round.format])
    } else {
      pairScores.set(key, {
        net: team.net_score ?? 0,
        gross: team.gross_score ?? 0,
        p1,
        p2,
        formats: new Set([formatLabels[round.format]]),
      })
    }
  }

  return Array.from(pairScores.values())
    .sort((a, b) => a.net - b.net)
    .map((entry, i) => ({
      rank: i + 1,
      player1Name: entry.p1,
      player2Name: entry.p2,
      netScore: entry.net,
      grossScore: entry.gross,
      format: Array.from(entry.formats).join(' / '),
    }))
}

// --- Component ---

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<DayTab>(1)

  const standings =
    activeTab === 'overall'
      ? getOverallStandings()
      : getStandingsForDay(activeTab)

  const tabs: { label: string; value: DayTab }[] = [
    { label: 'Day 1', value: 1 },
    { label: 'Day 2', value: 2 },
    { label: 'Day 3', value: 3 },
    { label: 'Overall', value: 'overall' },
  ]

  const activeRound =
    activeTab !== 'overall'
      ? mockRounds.find((r) => r.day === activeTab)
      : null

  return (
    <div className="min-h-screen bg-golf-cream">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-golf-cream/95 backdrop-blur-sm border-b border-golf-border">
        <div className="mx-auto max-w-lg px-4 pt-6 pb-4">
          <h1 className="mb-4 text-center font-[family-name:var(--font-playfair)] text-2xl font-bold tracking-widest text-golf-dark">
            LEADERBOARD
          </h1>

          {/* Day Selector */}
          <div className="flex gap-1 rounded-xl bg-golf-card border border-golf-border p-1">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition-colors ${
                  activeTab === tab.value
                    ? 'bg-golf-green text-white shadow-sm'
                    : 'text-golf-muted hover:text-golf-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pb-8">
        {/* Course & Format Subtitle */}
        {activeRound && (
          <p className="mb-4 text-center text-xs tracking-wide text-golf-muted">
            {activeRound.course_name} &middot; {formatLabels[activeRound.format]}
          </p>
        )}
        {activeTab === 'overall' && (
          <p className="mb-4 text-center text-xs tracking-wide text-golf-muted">
            Combined scores across all rounds
          </p>
        )}

        {/* Standings */}
        <div className="flex flex-col gap-2">
          {standings.map((entry) => (
            <div
              key={`${entry.rank}-${entry.player1Name}`}
              className={`rounded-xl border bg-golf-card p-4 shadow-sm ${
                entry.rank === 1
                  ? 'border-golf-green/30 border-l-3'
                  : 'border-golf-border'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <span
                  className={`w-6 flex-shrink-0 text-center text-lg font-bold tabular-nums ${
                    entry.rank === 1
                      ? 'text-golf-green'
                      : entry.rank <= 3
                        ? 'text-golf-dark/60'
                        : 'text-golf-muted'
                  }`}
                >
                  {entry.rank}
                </span>

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-golf-dark">
                    {entry.player1Name}
                    <span className="mx-1.5 text-golf-muted">&amp;</span>
                    {entry.player2Name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-golf-green">
                      {entry.format}
                    </span>
                    <span className="text-[10px] text-golf-muted">
                      Gross {entry.grossScore}
                    </span>
                  </div>
                </div>

                {/* Net Score */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <span
                    className={`text-xl font-bold tabular-nums ${
                      entry.rank === 1 ? 'text-golf-green' : 'text-golf-dark'
                    }`}
                  >
                    {entry.netScore}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-golf-muted">
                    Net
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
