export type { Database, Json } from './database.types'

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

// Sanitized versions strip answers — safe to send to the client
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
