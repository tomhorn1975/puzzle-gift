import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GiftSolve } from '@/components/gift/GiftSolve'
import type { SanitizedPuzzleConfig, MultipleChoicePuzzleConfig, MathPuzzleConfig } from '@/lib/types'

function stripAnswers(config: MultipleChoicePuzzleConfig | MathPuzzleConfig): SanitizedPuzzleConfig {
  if (config.type === 'multiple_choice') {
    return {
      type: 'multiple_choice',
      questions: config.questions.map(({ answer_index: _a, ...q }) => q),
    }
  }
  return {
    type: 'math',
    problems: config.problems.map(({ answer: _a, ...p }) => p),
  }
}

export default async function GiftPage({ params }: { params: Promise<{ id: string }> }) {
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

  const sanitizedConfig = stripAnswers(gift.puzzle_config as unknown as MultipleChoicePuzzleConfig | MathPuzzleConfig)

  return (
    <GiftSolve
      giftId={gift.id}
      title={gift.title}
      personalMessage={gift.personal_message}
      contentType={gift.content_type as 'text' | 'image' | 'file'}
      puzzleType={gift.puzzle_type as 'multiple_choice' | 'math'}
      puzzleConfig={sanitizedConfig}
    />
  )
}
