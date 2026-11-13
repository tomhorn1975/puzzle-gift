export type { Database, Json } from './database.types'

export type PuzzleType = 'trivia' | 'math' | 'slide' | 'jigsaw'
export type ContentType = 'image' | 'file' | 'text' | 'gift_card'

export interface GiftCardBrand {
  id: string
  name: string
  emoji: string
  amounts: number[]
}

// ── Trivia ──────────────────────────────────────────────────────────────────
export interface TriviaQuestion {
  id: string
  question: string
  options: string[]
  answer_index: number
}
export interface TriviaConfig {
  type: 'trivia'
  category_id: number
  category_name: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: TriviaQuestion[]
}

// ── Math ─────────────────────────────────────────────────────────────────────
export interface StoredMathProblem {
  id: string
  expression: string
  answer: number
}
export interface MathConfig {
  type: 'math'
  difficulty: 'easy' | 'medium' | 'hard'
  problems: StoredMathProblem[]
}

// ── Slide ────────────────────────────────────────────────────────────────────
export interface SlideConfig {
  type: 'slide'
  grid_size: 3 | 4
  image_url: string
}

// ── Jigsaw ───────────────────────────────────────────────────────────────────
export interface JigsawConfig {
  type: 'jigsaw'
  grid_size: 3 | 4
  image_url: string
}

export type PuzzleConfig = TriviaConfig | MathConfig | SlideConfig | JigsawConfig

// ── Sanitized (safe for client — answers stripped) ────────────────────────────
export interface SanitizedTriviaQuestion {
  id: string
  question: string
  options: string[]
}
export interface SanitizedTriviaConfig {
  type: 'trivia'
  questions: SanitizedTriviaQuestion[]
}
export interface SanitizedMathProblem {
  id: string
  expression: string
}
export interface SanitizedMathConfig {
  type: 'math'
  problems: SanitizedMathProblem[]
}
// Slide/jigsaw have no answers to strip
export type SanitizedPuzzleConfig =
  | SanitizedTriviaConfig
  | SanitizedMathConfig
  | SlideConfig
  | JigsawConfig

// ── Legacy types (kept for reference, not used in new gifts) ─────────────────
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
export interface SanitizedMultipleChoiceQuestion {
  id: string
  question: string
  options: string[]
}
export interface SanitizedMathProblemLegacy {
  id: string
  expression: string
}
export interface SanitizedMultipleChoicePuzzleConfig {
  type: 'multiple_choice'
  questions: SanitizedMultipleChoiceQuestion[]
}
export interface SanitizedMathPuzzleConfig {
  type: 'math'
  problems: SanitizedMathProblemLegacy[]
}
