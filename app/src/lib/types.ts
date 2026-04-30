export type Player = {
  id: string
  name: string
  handicap: number
  avatar_url?: string
  created_at: string
}

export type Round = {
  id: string
  day: 1 | 2 | 3
  format: 'shamble' | 'scramble' | 'scramble_hybrid'
  course_name?: string
  created_at: string
}

export type Team = {
  id: string
  round_id: string
  player1_id: string
  player2_id: string
  team_handicap: number
  gross_score?: number
  net_score?: number
}

export type DotEvent = {
  id: string
  player_id: string
  round_id?: string
  dot_type: DotType
  value: number // +1 or -1
  description?: string
  created_at: string
}

export type DotType =
  | 'longest_drive'
  | 'closest_pin'
  | 'bunker_save'
  | 'long_putt'
  | 'winning_group'
  | 'best_vibes'
  | 'best_performer'
  | 'lost_ball'
  | 'water_ball'
  | 'practice_divot'

export type Photo = {
  id: string
  player_id: string
  url: string
  caption?: string
  day?: number
  created_at: string
}
