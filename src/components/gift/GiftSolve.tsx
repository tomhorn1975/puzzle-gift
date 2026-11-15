'use client'

import { useState, useEffect } from 'react'
import { TriviaPuzzle } from '@/components/puzzles/TriviaPuzzle'
import { MathPuzzle } from '@/components/puzzles/MathPuzzle'
import { SlidePuzzle } from '@/components/puzzles/SlidePuzzle'
import { JigsawPuzzle } from '@/components/puzzles/JigsawPuzzle'
import { WordScramblePuzzle } from '@/components/puzzles/WordScramblePuzzle'
import { RiddlePuzzle } from '@/components/puzzles/RiddlePuzzle'
import { ContentReveal } from '@/components/gifts/ContentReveal'
import type { SanitizedPuzzleConfig, ContentType, PuzzleType } from '@/lib/types'

interface Task { id: string; text: string }

interface Props {
  giftId: string
  title: string
  personalMessage: string | null
  contentType: ContentType
  puzzleType?: PuzzleType | null
  puzzleConfig?: SanitizedPuzzleConfig | null
  unlockType?: 'puzzle' | 'task_list'
  tasks?: Task[]
  tasksSubmittedAt?: string | null
  tasksApprovedAt?: string | null
}

type SolveState = 'puzzle' | 'correct' | 'wrong'
type TaskState = 'pending' | 'submitted' | 'approved'

interface RevealedContent {
  type: 'text' | 'url' | 'assembled' | 'gift_card'
  value?: string
  url?: string
  image_url?: string
  message?: string | null
  brand_name?: string
  amount_cents?: number
  claim_link?: string
}

export function GiftSolve({
  giftId, title, personalMessage, contentType,
  puzzleType, puzzleConfig,
  unlockType = 'puzzle', tasks, tasksSubmittedAt, tasksApprovedAt,
}: Props) {
  const [state, setState]               = useState<SolveState>('puzzle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [revealed, setRevealed]         = useState<RevealedContent | null>(null)
  const [loading, setLoading]           = useState(false)

  const [taskState, setTaskState] = useState<TaskState>(() => {
    if (tasksApprovedAt) return 'approved'
    if (tasksSubmittedAt) return 'submitted'
    return 'pending'
  })
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set())
  const [taskLoading, setTaskLoading]   = useState(false)

  // On mount: if already approved, fetch content immediately
  useEffect(() => {
    if (unlockType !== 'task_list' || !tasksApprovedAt) return
    fetch(`/api/gift/${giftId}/tasks/reveal`, { method: 'POST' })
      .then(r => r.json())
      .then(data => { if (data.success) { setRevealed(data.content); setState('correct') } })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll for approval while waiting
  useEffect(() => {
    if (unlockType !== 'task_list' || taskState !== 'submitted') return
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/gift/${giftId}/tasks/status`)
        const data = await res.json()
        if (data.approved) {
          clearInterval(poll)
          const revealRes = await fetch(`/api/gift/${giftId}/tasks/reveal`, { method: 'POST' })
          const revealData = await revealRes.json()
          if (revealData.success) {
            setRevealed(revealData.content)
            setState('correct')
            setTaskState('approved')
          }
        }
      } catch { /* ignore */ }
    }, 5000)
    return () => clearInterval(poll)
  }, [unlockType, taskState, giftId])

  async function handleTaskSubmit() {
    setTaskLoading(true)
    try {
      await fetch(`/api/gift/${giftId}/tasks/submit`, { method: 'POST' })
      setTaskState('submitted')
    } catch { /* ignore */ }
    setTaskLoading(false)
  }

  async function callSolveApi(body: object) {
    const res = await fetch(`/api/gift/${giftId}/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  async function handleTextAnswerSubmit(answer: string) {
    setLoading(true)
    setErrorMessage(null)
    try {
      const data = await callSolveApi({ answer })
      if (data.success) {
        setRevealed(data.content)
        setState('correct')
      } else {
        setState('wrong')
        setErrorMessage(data.message ?? 'Wrong answer — try again!')
      }
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setState('wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleAnswerSubmit(answers: Record<string, number>) {
    setLoading(true)
    setErrorMessage(null)
    try {
      const data = await callSolveApi({ answers })
      if (data.success) {
        setRevealed(data.content)
        setState('correct')
      } else {
        setState('wrong')
        setErrorMessage(data.message ?? 'Wrong answers — try again!')
      }
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setState('wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handlePuzzleSolved() {
    setLoading(true)
    try {
      const data = await callSolveApi({ solved: true })
      if (data.success) {
        setRevealed(data.content)
        setState('correct')
      }
    } catch {
      setState('correct')
    } finally {
      setLoading(false)
    }
  }

  function handleRetry() {
    setState('puzzle')
    setErrorMessage(null)
  }

  const isImagePuzzle = puzzleType === 'slide' || puzzleType === 'jigsaw'

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-6 bg-background">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white mb-4"
            style={{ background: 'linear-gradient(135deg, oklch(0.52 0.27 292), oklch(0.65 0.26 345))' }}
          >
            🎁 You have a gift!
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl">{title}</h1>
          {personalMessage && !isImagePuzzle && (
            <p className="mt-3 text-muted-foreground italic text-base max-w-sm mx-auto">&ldquo;{personalMessage}&rdquo;</p>
          )}
        </div>

        {state === 'correct' && revealed ? (
          <ContentReveal content={revealed} contentType={contentType} />
        ) : unlockType === 'task_list' ? (
          <div className="space-y-5">
            {taskState === 'pending' && (
              <>
                <div className="text-center">
                  <p className="text-sm font-semibold text-muted-foreground">✅ Complete all tasks to unlock your gift</p>
                </div>
                <div className="space-y-3">
                  {(tasks ?? []).map(task => (
                    <label
                      key={task.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                        checkedTasks.has(task.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-violet-600 shrink-0"
                        checked={checkedTasks.has(task.id)}
                        onChange={() => {
                          const next = new Set(checkedTasks)
                          if (next.has(task.id)) next.delete(task.id)
                          else next.add(task.id)
                          setCheckedTasks(next)
                        }}
                      />
                      <span className={`text-sm font-medium ${checkedTasks.has(task.id) ? 'line-through text-muted-foreground' : ''}`}>
                        {task.text}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleTaskSubmit}
                  disabled={taskLoading || checkedTasks.size < (tasks ?? []).length}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, oklch(0.52 0.27 292), oklch(0.65 0.26 345))' }}
                >
                  {taskLoading ? 'Submitting…' : "I've done everything! 🎉"}
                </button>
                {checkedTasks.size < (tasks ?? []).length && (
                  <p className="text-center text-xs text-muted-foreground">
                    Check off all {(tasks ?? []).length} task{(tasks ?? []).length === 1 ? '' : 's'} to continue
                  </p>
                )}
              </>
            )}

            {taskState === 'submitted' && (
              <div className="text-center space-y-4 py-8">
                <div className="text-5xl animate-bounce">⏳</div>
                <h2 className="font-heading font-bold text-xl">Waiting for approval</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Your sender has been notified. Once they verify your tasks, your gift will be revealed automatically.
                </p>
                <p className="text-xs text-muted-foreground">Checking every 5 seconds…</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {!isImagePuzzle && (
              <div className="text-center">
                <p className={`text-sm font-semibold ${state === 'wrong' ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {state === 'wrong' ? '🔐 Not quite right — give it another shot!' : '🔒 Solve the puzzle to unlock your gift'}
                </p>
                {errorMessage && state === 'wrong' && (
                  <p className="text-sm text-destructive mt-1">{errorMessage}</p>
                )}
              </div>
            )}

            {isImagePuzzle && (
              <div className="text-center mb-2">
                <p className="text-sm font-semibold text-muted-foreground">
                  {loading ? 'Unlocking…' : '🔒 Solve the puzzle to reveal your gift'}
                </p>
              </div>
            )}

            {puzzleConfig?.type === 'trivia' && (
              <TriviaPuzzle
                config={puzzleConfig}
                onSubmit={handleAnswerSubmit}
                onRetry={handleRetry}
                loading={loading}
                showRetry={state === 'wrong'}
              />
            )}

            {puzzleConfig?.type === 'math' && (
              <MathPuzzle
                config={puzzleConfig}
                onSubmit={handleAnswerSubmit}
                onRetry={handleRetry}
                loading={loading}
                showRetry={state === 'wrong'}
              />
            )}

            {puzzleConfig?.type === 'slide' && (
              <SlidePuzzle
                imageUrl={puzzleConfig.image_url}
                gridSize={puzzleConfig.grid_size}
                onSolve={handlePuzzleSolved}
              />
            )}

            {puzzleConfig?.type === 'jigsaw' && (
              <JigsawPuzzle
                imageUrl={puzzleConfig.image_url}
                gridSize={puzzleConfig.grid_size}
                onSolve={handlePuzzleSolved}
              />
            )}

            {puzzleConfig?.type === 'word_scramble' && (
              <WordScramblePuzzle
                config={puzzleConfig}
                onSubmit={handleTextAnswerSubmit}
                onRetry={handleRetry}
                loading={loading}
                showRetry={state === 'wrong'}
              />
            )}

            {puzzleConfig?.type === 'riddle' && (
              <RiddlePuzzle
                config={puzzleConfig}
                onSubmit={handleTextAnswerSubmit}
                onRetry={handleRetry}
                loading={loading}
                showRetry={state === 'wrong'}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
