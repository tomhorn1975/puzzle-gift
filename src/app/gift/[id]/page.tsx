import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GiftSolve } from '@/components/gift/GiftSolve'
import type {
  SanitizedPuzzleConfig,
  TriviaConfig, MathConfig, SlideConfig, JigsawConfig, RiddleConfig,
  PuzzleConfig, PuzzleType, ContentType,
} from '@/lib/types'

export const instant = false

function stripAnswers(config: PuzzleConfig): SanitizedPuzzleConfig {
  if (config.type === 'trivia') {
    return {
      type: 'trivia',
      questions: config.questions.map(({ answer_index: _a, ...q }) => q),
    }
  }
  if (config.type === 'math') {
    return {
      type: 'math',
      problems: config.problems.map(({ answer: _a, ...p }) => p),
    }
  }
  if (config.type === 'riddle') {
    return { type: 'riddle', question: (config as RiddleConfig).question }
  }
  // slide/jigsaw/word_scramble: no answers to strip
  return config as SlideConfig | JigsawConfig
}

export default async function GiftPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params
  const supabase = await createClient()

  const { data: gift } = await supabase
    .from('gifts')
    .select('id, title, personal_message, content_type, puzzle_type, puzzle_config, is_active, expires_at, unlock_type, tasks, tasks_submitted_at, tasks_approved_at')
    .eq('id', id)
    .single()

  if (!gift || !gift.is_active) notFound()

  if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-4xl mb-4">⏰</p>
          <h1 className="text-xl font-bold mb-2">This gift has expired</h1>
          <p className="text-muted-foreground text-sm">The sender&apos;s gift link is no longer active.</p>
        </div>
      </div>
    )
  }

  const g = gift as typeof gift & {
    unlock_type?: string
    tasks?: Array<{ id: string; text: string }>
    tasks_submitted_at?: string | null
    tasks_approved_at?: string | null
  }

  const rawConfig = g.puzzle_config as unknown as PuzzleConfig | null
  const sanitizedConfig = rawConfig ? stripAnswers(rawConfig) : null

  return (
    <GiftSolve
      giftId={g.id}
      title={g.title}
      personalMessage={g.personal_message}
      contentType={g.content_type as ContentType}
      puzzleType={(g.puzzle_type as PuzzleType) ?? undefined}
      puzzleConfig={sanitizedConfig ?? undefined}
      unlockType={(g.unlock_type as 'puzzle' | 'task_list') ?? 'puzzle'}
      tasks={g.tasks ?? undefined}
      tasksSubmittedAt={g.tasks_submitted_at ?? null}
      tasksApprovedAt={g.tasks_approved_at ?? null}
    />
  )
}
