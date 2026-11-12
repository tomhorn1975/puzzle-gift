'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MultipleChoiceQuestion, MathProblem, PuzzleType, ContentType } from '@/lib/types'

interface Props {
  userId: string
}

function newMCQuestion(): MultipleChoiceQuestion {
  return { id: crypto.randomUUID(), question: '', options: ['', '', '', ''], answer_index: 0 }
}

function newMathProblem(): MathProblem {
  return { id: crypto.randomUUID(), expression: '', answer: 0 }
}

export function GiftForm({ userId }: Props) {
  const supabase = createClient()

  // Gift details
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  // Content
  const [contentType, setContentType] = useState<ContentType>('text')
  const [textContent, setTextContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Puzzle
  const [puzzleType, setPuzzleType] = useState<PuzzleType>('multiple_choice')
  const [mcQuestions, setMcQuestions] = useState<MultipleChoiceQuestion[]>([newMCQuestion()])
  const [mathProblems, setMathProblems] = useState<MathProblem[]>([newMathProblem()])

  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // --- Multiple Choice helpers ---
  function updateQuestion(idx: number, patch: Partial<MultipleChoiceQuestion>) {
    setMcQuestions(qs => qs.map((q, i) => i === idx ? { ...q, ...patch } : q))
  }
  function updateOption(qIdx: number, oIdx: number, value: string) {
    setMcQuestions(qs => qs.map((q, i) => {
      if (i !== qIdx) return q
      const options = [...q.options]
      options[oIdx] = value
      return { ...q, options }
    }))
  }
  function addQuestion() {
    if (mcQuestions.length < 5) setMcQuestions(qs => [...qs, newMCQuestion()])
  }
  function removeQuestion(idx: number) {
    if (mcQuestions.length > 1) setMcQuestions(qs => qs.filter((_, i) => i !== idx))
  }

  // --- Math helpers ---
  function updateProblem(idx: number, patch: Partial<MathProblem>) {
    setMathProblems(ps => ps.map((p, i) => i === idx ? { ...p, ...patch } : p))
  }
  function addProblem() {
    if (mathProblems.length < 5) setMathProblems(ps => [...ps, newMathProblem()])
  }
  function removeProblem(idx: number) {
    if (mathProblems.length > 1) setMathProblems(ps => ps.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate puzzle
      if (puzzleType === 'multiple_choice') {
        for (const q of mcQuestions) {
          if (!q.question.trim()) throw new Error('All questions must have text.')
          if (q.options.some(o => !o.trim())) throw new Error('All answer options must be filled in.')
        }
      } else {
        for (const p of mathProblems) {
          if (!p.expression.trim()) throw new Error('All math problems must have an expression.')
        }
      }

      // Validate content
      if (contentType === 'text' && !textContent.trim()) {
        throw new Error('Please enter a text message to share.')
      }
      if ((contentType === 'image' || contentType === 'file') && !imageFile) {
        throw new Error('Please select a file to upload.')
      }

      const giftId = crypto.randomUUID()
      let filePath: string | null = null

      // Upload file if needed
      if ((contentType === 'image' || contentType === 'file') && imageFile) {
        const ext = imageFile.name.split('.').pop()
        filePath = `${userId}/${giftId}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('gift-content')
          .upload(filePath, imageFile)
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
      }

      const puzzleConfig = puzzleType === 'multiple_choice'
        ? { type: 'multiple_choice' as const, questions: mcQuestions }
        : { type: 'math' as const, problems: mathProblems }

      const { data: gift, error: insertError } = await supabase
        .from('gifts')
        .insert({
          id: giftId,
          sender_id: userId,
          title: title.trim(),
          personal_message: message.trim() || null,
          content_type: contentType,
          file_path: filePath,
          text_content: contentType === 'text' ? textContent.trim() : null,
          puzzle_type: puzzleType,
          puzzle_config: puzzleConfig,
          max_attempts: 5,
          is_active: true,
        })
        .select('id')
        .single()

      if (insertError) throw new Error(insertError.message)

      const url = `${window.location.origin}/gift/${gift.id}`
      setShareUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function copyUrl() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (shareUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your gift is ready! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">Share this link with your recipient. They&apos;ll need to solve your puzzle to unlock it.</p>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="font-mono text-sm" />
            <Button onClick={copyUrl} variant="outline" className="shrink-0">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShareUrl(null)}>Create Another</Button>
            <Button asChild><a href="/dashboard">View All Gifts</a></Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Gift Details */}
      <Card>
        <CardHeader><CardTitle>Gift details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. A surprise for you!"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Personal message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Something to show before they solve the puzzle..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Content */}
      <Card>
        <CardHeader><CardTitle>What are you sharing?</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {(['text', 'image', 'file'] as ContentType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setContentType(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  contentType === t ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-muted'
                }`}
              >
                {t === 'text' ? 'Text message' : t === 'image' ? 'Image' : 'File'}
              </button>
            ))}
          </div>

          {contentType === 'text' && (
            <div className="space-y-1.5">
              <Label htmlFor="textContent">Your message *</Label>
              <Textarea
                id="textContent"
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Write the message they'll see after solving the puzzle..."
                rows={5}
                required
              />
            </div>
          )}

          {(contentType === 'image' || contentType === 'file') && (
            <div className="space-y-1.5">
              <Label htmlFor="file">
                {contentType === 'image' ? 'Upload image *' : 'Upload file *'}
              </Label>
              <Input
                id="file"
                type="file"
                accept={contentType === 'image' ? 'image/*' : undefined}
                onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                required
              />
              {imageFile && (
                <p className="text-xs text-muted-foreground">{imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Puzzle */}
      <Card>
        <CardHeader><CardTitle>Create the puzzle</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            {(['multiple_choice', 'math'] as PuzzleType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setPuzzleType(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  puzzleType === t ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-muted'
                }`}
              >
                {t === 'multiple_choice' ? 'Multiple Choice' : 'Math Problems'}
              </button>
            ))}
          </div>

          {puzzleType === 'multiple_choice' && (
            <div className="space-y-6">
              {mcQuestions.map((q, qIdx) => (
                <div key={q.id} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Question {qIdx + 1}</span>
                    {mcQuestions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qIdx)} className="text-xs text-destructive hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                  <Input
                    value={q.question}
                    onChange={e => updateQuestion(qIdx, { question: e.target.value })}
                    placeholder="e.g. What year did we first meet?"
                    required
                  />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Options — select the correct answer</p>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex gap-2 items-center">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.answer_index === oIdx}
                          onChange={() => updateQuestion(qIdx, { answer_index: oIdx })}
                          className="mt-0.5"
                        />
                        <Input
                          value={opt}
                          onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {mcQuestions.length < 5 && (
                <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
                  + Add Question
                </Button>
              )}
            </div>
          )}

          {puzzleType === 'math' && (
            <div className="space-y-4">
              {mathProblems.map((p, pIdx) => (
                <div key={p.id} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Problem {pIdx + 1}</span>
                    {mathProblems.length > 1 && (
                      <button type="button" onClick={() => removeProblem(pIdx)} className="text-xs text-destructive hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Expression</Label>
                      <Input
                        value={p.expression}
                        onChange={e => updateProblem(pIdx, { expression: e.target.value })}
                        placeholder="e.g. 12 × 5"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Answer</Label>
                      <Input
                        type="number"
                        value={p.answer}
                        onChange={e => updateProblem(pIdx, { answer: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              {mathProblems.length < 5 && (
                <Button type="button" variant="outline" onClick={addProblem} className="w-full">
                  + Add Problem
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Creating your gift...' : 'Create Gift & Get Link'}
      </Button>
    </form>
  )
}
