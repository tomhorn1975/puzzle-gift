import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GiftSolve } from '@/components/gift/GiftSolve'
import type {
  SanitizedPuzzleConfig,
  TriviaConfig, MathConfig, SlideConfig, JigsawConfig,
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
  // slide/jigsaw: image_url needed on client, no answers to strip
  return config as SlideConfig | JigsawConfig
}

export default async function GiftPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params
  const supabase = await createClient()

  const { data: gift } = await supabase
    .from('gifts')
    .select('id, title, personal_message, content_type, puzzle_type, puzzle_config, is_active, expires_at')
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

  const rawConfig = gift.puzzle_config as unknown as PuzzleConfig
  const sanitizedConfig = stripAnswers(rawConfig)

  return (
    <GiftSolve
      giftId={gift.id}
      title={gift.title}
      personalMessage={gift.personal_message}
      contentType={gift.content_type as ContentType}
      puzzleType={gift.puzzle_type as PuzzleType}
      puzzleConfig={sanitizedConfig}
    />
  )
}
