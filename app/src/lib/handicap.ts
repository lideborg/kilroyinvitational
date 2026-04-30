/**
 * Calculate team handicap for a Shamble format round.
 *
 * Rules:
 * - Cap each individual handicap at 24
 * - Combine both, divide by 2
 * - Apply course adjustment if provided (default: use averaged value)
 * - Multiply by 0.6
 * - Round to nearest integer
 */
export function calculateShambleHandicap(
  handicap1: number,
  handicap2: number,
  courseAdjustment?: number
): number {
  const capped1 = Math.min(handicap1, 24)
  const capped2 = Math.min(handicap2, 24)

  let combined = (capped1 + capped2) / 2

  if (courseAdjustment !== undefined) {
    combined += courseAdjustment
  }

  return Math.round(combined * 0.6)
}

/**
 * Calculate team handicap for a Scramble format round.
 *
 * Rules:
 * - Take 85% of each handicap (rounded)
 * - Team handicap = 30% of lower + 20% of higher
 * - Round to nearest integer
 */
export function calculateScrambleHandicap(
  handicap1: number,
  handicap2: number
): number {
  const adjusted1 = Math.round(handicap1 * 0.85)
  const adjusted2 = Math.round(handicap2 * 0.85)

  const lower = Math.min(adjusted1, adjusted2)
  const higher = Math.max(adjusted1, adjusted2)

  return Math.round(lower * 0.3 + higher * 0.2)
}

/**
 * Calculate net score from gross score and team handicap.
 */
export function calculateNetScore(
  grossScore: number,
  teamHandicap: number
): number {
  return grossScore - teamHandicap
}
