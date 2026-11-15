export type { Database, Json } from './database.types'

export type PuzzleType = 'trivia' | 'math' | 'slide' | 'jigsaw' | 'word_scramble' | 'riddle'
export type ContentType = 'image' | 'file' | 'text' | 'gift_card' | 'amazon_prize'
export type UnlockType = 'puzzle' | 'task_list'
export interface Task { id: string; text: string }

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

// ── Word Scramble ─────────────────────────────────────────────────────────────
export interface WordScrambleConfig {
  type: 'word_scramble'
  word: string
  scrambled: string
  hint?: string
}

// ── Riddle ────────────────────────────────────────────────────────────────────
export interface RiddleConfig {
  type: 'riddle'
  question: string
  answer: string
}
export interface SanitizedRiddleConfig {
  type: 'riddle'
  question: string
}

export type PuzzleConfig = TriviaConfig | MathConfig | SlideConfig | JigsawConfig | WordScrambleConfig | RiddleConfig

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
// Slide/jigsaw/word_scramble have no answers to strip; riddle does
export type SanitizedPuzzleConfig =
  | SanitizedTriviaConfig
  | SanitizedMathConfig
  | SlideConfig
  | JigsawConfig
  | WordScrambleConfig
  | SanitizedRiddleConfig

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
