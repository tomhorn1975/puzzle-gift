export type PuzzleType = 'multiple_choice' | 'math'
export type ContentType = 'image' | 'file' | 'text'

export interface MultipleChoiceQuestion {
  id: string
  question: string
  options: string[]
  answer_index: number
}

export interface MathProblem {
  id: string
  expression: string
  answer: number
}

export interface MultipleChoicePuzzleConfig {
  type: 'multiple_choice'
  questions: MultipleChoiceQuestion[]
}

export interface MathPuzzleConfig {
  type: 'math'
  problems: MathProblem[]
}

export type PuzzleConfig = MultipleChoicePuzzleConfig | MathPuzzleConfig

// Sanitized types strip the answers — safe to send to client
export interface SanitizedMultipleChoiceQuestion {
  id: string
  question: string
  options: string[]
}

export interface SanitizedMathProblem {
  id: string
  expression: string
}

export interface SanitizedMultipleChoicePuzzleConfig {
  type: 'multiple_choice'
  questions: SanitizedMultipleChoiceQuestion[]
}

export interface SanitizedMathPuzzleConfig {
  type: 'math'
  problems: SanitizedMathProblem[]
}

export type SanitizedPuzzleConfig = SanitizedMultipleChoicePuzzleConfig | SanitizedMathPuzzleConfig

export interface Gift {
  id: string
  sender_id: string
  title: string
  personal_message: string | null
  content_type: ContentType
  file_path: string | null
  text_content: string | null
  puzzle_type: PuzzleType
  puzzle_config: PuzzleConfig
  max_attempts: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface GiftWithStats extends Omit<Gift, 'puzzle_config'> {
  solve_count: number
}

export interface GiftAccess {
  id: string
  gift_id: string
  solved_at: string
  ip_address: string | null
}

export type Database = {
  public: {
    Tables: {
      gifts: {
        Row: Gift
        Insert: Omit<Gift, 'created_at'>
        Update: Partial<Omit<Gift, 'id' | 'created_at' | 'sender_id'>>
      }
      gift_access: {
        Row: GiftAccess
        Insert: Omit<GiftAccess, 'id' | 'solved_at'>
        Update: never
      }
    }
  }
}
