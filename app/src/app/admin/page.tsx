'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Player, Team, Round } from '@/lib/types'
import {
  calculateShambleHandicap,
  calculateScrambleHandicap,
  calculateNetScore,
} from '@/lib/handicap'

const ADMIN_PIN = '2026'
const SESSION_KEY = 'kilroy_admin'

type TeamDraft = {
  id?: string
  player1_id: string
  player2_id: string
  team_handicap: number
  gross_score: string
  net_score: number | null
}

function emptyTeam(): TeamDraft {
  return { player1_id: '', player2_id: '', team_handicap: 0, gross_score: '', net_score: null }
}

function calcTeamHandicap(
  p1: Player | undefined,
  p2: Player | undefined,
  format: Round['format']
): number {
  if (!p1 || !p2) return 0
  if (format === 'shamble') return calculateShambleHandicap(p1.handicap, p2.handicap)
  return calculateScrambleHandicap(p1.handicap, p2.handicap)
}

// --- PIN Gate ---

function PinGate({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      onSuccess()
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-golf-cream px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs text-center">
        <h1 className="mb-1 font-[family-name:var(--font-playfair)] text-xl font-bold tracking-widest text-golf-green">
          ADMIN ACCESS
        </h1>
        <p className="mb-6 text-xs text-golf-muted">Director of Sporting Integrity</p>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          placeholder="PIN"
          value={pin}
          onChange={(e) => {
            setError(false)
            setPin(e.target.value.slice(0, 4))
          }}
          className="w-full rounded-xl border border-golf-border bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-golf-dark outline-none focus:border-golf-green"
          autoFocus
        />
        {error && (
          <p className="mt-2 text-sm text-golf-red">Wrong PIN</p>
        )}
        <button
          type="submit"
          disabled={pin.length !== 4}
          className="mt-4 w-full rounded-xl bg-golf-green py-3.5 text-sm font-semibold tracking-wide text-white disabled:opacity-40"
        >
          Enter
        </button>
      </form>
    </div>
  )
}

// --- Admin Panel ---

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [rounds, setRounds] = useState<Round[]>([])
  const [selectedRoundId, setSelectedRoundId] = useState<string>('')
  const [teamDrafts, setTeamDrafts] = useState<TeamDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'err' } | null>(null)

  // Check session on mount
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setAuthed(true)
    }
  }, [])

  // Fetch players + rounds
  useEffect(() => {
    if (!authed) return
    const supabase = createClient()

    async function load() {
      const [pRes, rRes] = await Promise.all([
        supabase.from('players').select('*').order('name'),
        supabase.from('rounds').select('*').order('day'),
      ])
      if (pRes.data) setPlayers(pRes.data)
      if (rRes.data) {
        setRounds(rRes.data)
        if (rRes.data.length > 0) setSelectedRoundId(rRes.data[0].id)
      }
      setLoading(false)
    }

    load()
  }, [authed])

  // Fetch teams when round changes
  const loadTeams = useCallback(async () => {
    if (!selectedRoundId) return
    const supabase = createClient()
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('round_id', selectedRoundId)

    if (data && data.length > 0) {
      setTeamDrafts(
        data.map((t: Team) => ({
          id: t.id,
          player1_id: t.player1_id,
          player2_id: t.player2_id,
          team_handicap: t.team_handicap,
          gross_score: t.gross_score?.toString() ?? '',
          net_score: t.net_score ?? null,
        }))
      )
    } else {
      // Start with 4 empty team slots
      setTeamDrafts([emptyTeam(), emptyTeam(), emptyTeam(), emptyTeam()])
    }
  }, [selectedRoundId])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  const selectedRound = rounds.find((r) => r.id === selectedRoundId)
  const playerMap = new Map(players.map((p) => [p.id, p]))

  // Which player IDs are already assigned in other team slots
  function usedPlayerIds(excludeIndex: number): Set<string> {
    const ids = new Set<string>()
    teamDrafts.forEach((t, i) => {
      if (i === excludeIndex) return
      if (t.player1_id) ids.add(t.player1_id)
      if (t.player2_id) ids.add(t.player2_id)
    })
    return ids
  }

  function updateTeam(index: number, patch: Partial<TeamDraft>) {
    setTeamDrafts((prev) => {
      const next = [...prev]
      const updated = { ...next[index], ...patch }

      // Recalculate handicap when players change
      if ('player1_id' in patch || 'player2_id' in patch) {
        const p1 = playerMap.get(updated.player1_id)
        const p2 = playerMap.get(updated.player2_id)
        updated.team_handicap = calcTeamHandicap(p1, p2, selectedRound?.format ?? 'shamble')
      }

      // Recalculate net when gross changes
      if ('gross_score' in patch) {
        const gross = parseInt(updated.gross_score)
        updated.net_score = isNaN(gross) ? null : calculateNetScore(gross, updated.team_handicap)
      }

      // Also recalc net if handicap changed and gross exists
      if ('player1_id' in patch || 'player2_id' in patch) {
        const gross = parseInt(updated.gross_score)
        updated.net_score = isNaN(gross) ? null : calculateNetScore(gross, updated.team_handicap)
      }

      next[index] = updated
      return next
    })
  }

  async function handleSave() {
    if (!selectedRoundId) return
    setSaving(true)
    setMessage(null)

    const supabase = createClient()

    // Filter out incomplete teams (must have both players)
    const validTeams = teamDrafts.filter((t) => t.player1_id && t.player2_id)

    if (validTeams.length === 0) {
      setMessage({ text: 'Add at least one complete team', type: 'err' })
      setSaving(false)
      return
    }

    // Delete existing teams for this round, then insert fresh
    await supabase.from('teams').delete().eq('round_id', selectedRoundId)

    const rows = validTeams.map((t) => ({
      ...(t.id ? { id: t.id } : {}),
      round_id: selectedRoundId,
      player1_id: t.player1_id,
      player2_id: t.player2_id,
      team_handicap: t.team_handicap,
      gross_score: t.gross_score ? parseInt(t.gross_score) : null,
      net_score: t.net_score,
    }))

    const { error } = await supabase.from('teams').insert(rows)

    if (error) {
      setMessage({ text: `Error: ${error.message}`, type: 'err' })
    } else {
      setMessage({ text: 'Saved', type: 'ok' })
      // Reload to get server-generated IDs
      await loadTeams()
    }
    setSaving(false)
  }

  if (!authed) return <PinGate onSuccess={() => setAuthed(true)} />

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-golf-muted">Loading...</p>
      </div>
    )
  }

  const formatLabels: Record<string, string> = {
    shamble: 'Shamble',
    scramble: 'Scramble',
    scramble_hybrid: 'Hybrid',
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-golf-green">
        <div className="mx-auto max-w-lg px-4 pt-5 pb-4">
          <h1 className="mb-1 text-center font-[family-name:var(--font-playfair)] text-xl font-bold tracking-widest text-white">
            ADMIN
          </h1>
          <p className="mb-4 text-center text-[10px] uppercase tracking-widest text-white/50">
            Director of Sporting Integrity
          </p>

          {/* Round Selector */}
          <div className="flex gap-1">
            {rounds.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoundId(r.id)}
                className={`flex-1 rounded px-3 py-2 text-xs font-semibold tracking-wide transition-colors ${
                  selectedRoundId === r.id
                    ? 'bg-golf-yellow text-golf-dark'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Day {r.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4 pb-12">
        {/* Round info */}
        {selectedRound && (
          <p className="mb-4 text-center text-xs text-golf-muted">
            {selectedRound.course_name} &middot; {formatLabels[selectedRound.format] ?? selectedRound.format}
          </p>
        )}

        {/* Teams */}
        <div className="flex flex-col gap-4">
          {teamDrafts.map((team, index) => {
            const used = usedPlayerIds(index)
            // For each dropdown, also exclude the other player in this same team
            const usedForP1 = new Set(used)
            if (team.player2_id) usedForP1.add(team.player2_id)
            const usedForP2 = new Set(used)
            if (team.player1_id) usedForP2.add(team.player1_id)

            return (
              <div
                key={index}
                className="rounded-xl border border-golf-border bg-golf-card p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-golf-green">
                    Team {index + 1}
                  </span>
                  <span className="text-xs text-golf-muted">
                    Hcp: {team.team_handicap}
                  </span>
                </div>

                {/* Player selects */}
                <div className="mb-3 flex flex-col gap-2">
                  <select
                    value={team.player1_id}
                    onChange={(e) => updateTeam(index, { player1_id: e.target.value })}
                    className="w-full rounded-lg border border-golf-border bg-white px-3 py-3 text-sm text-golf-dark outline-none focus:border-golf-green"
                  >
                    <option value="">Player 1...</option>
                    {players
                      .filter((p) => !usedForP1.has(p.id) || p.id === team.player1_id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.handicap})
                        </option>
                      ))}
                  </select>

                  <select
                    value={team.player2_id}
                    onChange={(e) => updateTeam(index, { player2_id: e.target.value })}
                    className="w-full rounded-lg border border-golf-border bg-white px-3 py-3 text-sm text-golf-dark outline-none focus:border-golf-green"
                  >
                    <option value="">Player 2...</option>
                    {players
                      .filter((p) => !usedForP2.has(p.id) || p.id === team.player2_id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.handicap})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Score entry */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-golf-muted">
                      Gross
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="--"
                      value={team.gross_score}
                      onChange={(e) => updateTeam(index, { gross_score: e.target.value })}
                      className="w-full rounded-lg border border-golf-border bg-white px-3 py-3 text-center text-lg font-bold tabular-nums text-golf-dark outline-none focus:border-golf-green"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-golf-muted">
                      Net
                    </label>
                    <div className="rounded-lg border border-golf-border bg-golf-cream px-3 py-3 text-center text-lg font-bold tabular-nums text-golf-dark">
                      {team.net_score !== null ? team.net_score : '--'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Status message */}
        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message.type === 'ok' ? 'text-golf-green' : 'text-golf-red'
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-golf-green py-4 text-sm font-semibold tracking-wide text-white active:bg-golf-green-dark disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
