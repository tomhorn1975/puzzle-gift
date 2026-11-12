'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchTriviaQuestions, TRIVIA_CATEGORIES } from '@/lib/puzzles/trivia'
import { generateMathProblems } from '@/lib/puzzles/math'
import type { PuzzleType, ContentType } from '@/lib/types'

interface Props { userId: string }

type Difficulty = 'easy' | 'medium' | 'hard'

const PUZZLE_TYPES: { type: PuzzleType; emoji: string; label: string; desc: string }[] = [
  { type: 'trivia',  emoji: '🧠', label: 'Trivia Quiz',      desc: 'Pick a category and difficulty. We\'ll fetch the questions.' },
  { type: 'math',    emoji: '➗', label: 'Math Challenge',    desc: 'Choose a difficulty. We\'ll generate the problems.' },
  { type: 'slide',   emoji: '◈',  label: 'Slide Puzzle',     desc: 'Upload an image. Recipients slide tiles to assemble it.' },
  { type: 'jigsaw',  emoji: '🧩', label: 'Jigsaw Puzzle',    desc: 'Upload an image. Recipients tap pieces to put it together.' },
]

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-muted'
      }`}
    >
      {label}
    </button>
  )
}

export function GiftForm({ userId }: Props) {
  const supabase = createClient()

  // Gift details
  const [title, setTitle]     = useState('')
  const [message, setMessage] = useState('')

  // Puzzle type
  const [puzzleType, setPuzzleType] = useState<PuzzleType | null>(null)

  // Trivia settings
  const [triviaCategory, setTriviaCategory] = useState(9)
  const [triviaDifficulty, setTriviaDifficulty] = useState<Difficulty>('medium')
  const [triviaCount, setTriviaCount]           = useState(4)

  // Math settings
  const [mathDifficulty, setMathDifficulty] = useState<Difficulty>('medium')
  const [mathCount, setMathCount]           = useState(4)

  // Slide/Jigsaw settings
  const [puzzleImage, setPuzzleImage]   = useState<File | null>(null)
  const [gridSize, setGridSize]         = useState<3 | 4>(3)

  // Content (trivia/math only)
  const [contentType, setContentType]   = useState<ContentType>('text')
  const [textContent, setTextContent]   = useState('')
  const [contentFile, setContentFile]   = useState<File | null>(null)

  // State
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)

  const isImagePuzzle = puzzleType === 'slide' || puzzleType === 'jigsaw'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!puzzleType) { setError('Please choose a puzzle type.'); return }
    setLoading(true)

    try {
      const giftId = crypto.randomUUID()
      let puzzleConfig: unknown
      let filePath: string | null = null
      let actualContentType: ContentType = contentType

      // ── Build puzzle config ───────────────────────────────────────────────
      if (puzzleType === 'trivia') {
        const questions = await fetchTriviaQuestions(triviaCategory, triviaDifficulty, triviaCount)
        const cat = TRIVIA_CATEGORIES.find(c => c.id === triviaCategory)
        puzzleConfig = { type: 'trivia', category_id: triviaCategory, category_name: cat?.name ?? '', difficulty: triviaDifficulty, questions }

      } else if (puzzleType === 'math') {
        const problems = generateMathProblems(mathDifficulty, mathCount)
        puzzleConfig = { type: 'math', difficulty: mathDifficulty, problems }

      } else {
        // slide or jigsaw — upload image to public puzzle-images bucket
        if (!puzzleImage) throw new Error('Please upload an image for the puzzle.')
        const ext   = puzzleImage.name.split('.').pop()
        const path  = `${userId}/${giftId}.${ext}`
        const { error: upErr } = await supabase.storage.from('puzzle-images').upload(path, puzzleImage)
        if (upErr) throw new Error(`Image upload failed: ${upErr.message}`)
        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/puzzle-images/${path}`
        puzzleConfig = { type: puzzleType, grid_size: gridSize, image_url: imageUrl }
        actualContentType = 'text' // unused for slide/jigsaw
      }

      // ── Upload content file (trivia/math only) ────────────────────────────
      if (!isImagePuzzle && (contentType === 'image' || contentType === 'file')) {
        if (!contentFile) throw new Error('Please select a file to share.')
        const ext  = contentFile.name.split('.').pop()
        filePath   = `${userId}/${giftId}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('gift-content').upload(filePath, contentFile)
        if (upErr) throw new Error(`File upload failed: ${upErr.message}`)
      }

      // ── Validate text content ─────────────────────────────────────────────
      if (!isImagePuzzle && contentType === 'text' && !textContent.trim()) {
        throw new Error('Please enter a message to share.')
      }

      // ── Insert gift record ────────────────────────────────────────────────
      const { data: gift, error: insertErr } = await supabase
        .from('gifts')
        .insert({
          id: giftId,
          sender_id: userId,
          title: title.trim(),
          personal_message: message.trim() || null,
          content_type: actualContentType,
          file_path: filePath,
          text_content: (!isImagePuzzle && contentType === 'text') ? textContent.trim() : null,
          puzzle_type: puzzleType,
          puzzle_config: puzzleConfig as never,
          max_attempts: 5,
          is_active: true,
        })
        .select('id')
        .single()

      if (insertErr) throw new Error(insertErr.message)

      setShareUrl(`${window.location.origin}/gift/${gift.id}`)
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
        <CardHeader><CardTitle>Your gift is ready! 🎉</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">Share this link. Your recipient will solve the puzzle to unlock it.</p>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="font-mono text-sm" />
            <Button onClick={copyUrl} variant="outline" className="shrink-0">{copied ? 'Copied!' : 'Copy'}</Button>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShareUrl(null); setPuzzleType(null); setTitle(''); setMessage('') }}>
              Create Another
            </Button>
            <a href="/dashboard" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1.5 px-2.5 text-sm font-medium transition-all">
              View All Gifts
            </a>
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
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. A surprise for you!" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Personal message (optional)</Label>
            <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Something to show before they solve the puzzle…" rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Choose Puzzle Type */}
      <Card>
        <CardHeader><CardTitle>Choose your puzzle</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {PUZZLE_TYPES.map(pt => (
              <button
                key={pt.type}
                type="button"
                onClick={() => setPuzzleType(pt.type)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  puzzleType === pt.type
                    ? 'border-foreground bg-muted'
                    : 'border-border hover:border-foreground/40 hover:bg-muted/40'
                }`}
              >
                <div className="text-2xl mb-2">{pt.emoji}</div>
                <div className="font-semibold text-sm mb-1">{pt.label}</div>
                <div className="text-xs text-muted-foreground leading-snug">{pt.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Puzzle Settings */}
      {puzzleType && (
        <Card>
          <CardHeader><CardTitle>Puzzle settings</CardTitle></CardHeader>
          <CardContent className="space-y-5">

            {puzzleType === 'trivia' && (
              <>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={triviaCategory}
                    onChange={e => setTriviaCategory(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                  >
                    {TRIVIA_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                      <Chip key={d} label={d.charAt(0).toUpperCase() + d.slice(1)} active={triviaDifficulty === d} onClick={() => setTriviaDifficulty(d)} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Number of questions</Label>
                  <div className="flex gap-2">
                    {[3, 4, 5].map(n => (
                      <Chip key={n} label={String(n)} active={triviaCount === n} onClick={() => setTriviaCount(n)} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {puzzleType === 'math' && (
              <>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                      <Chip key={d} label={d.charAt(0).toUpperCase() + d.slice(1)} active={mathDifficulty === d} onClick={() => setMathDifficulty(d)} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {mathDifficulty === 'easy' && 'Addition & subtraction with numbers 1–20'}
                    {mathDifficulty === 'medium' && 'Multiplication & division tables'}
                    {mathDifficulty === 'hard' && 'Multi-digit multiplication, percentages & squares'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Number of problems</Label>
                  <div className="flex gap-2">
                    {[3, 4, 5].map(n => (
                      <Chip key={n} label={String(n)} active={mathCount === n} onClick={() => setMathCount(n)} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {isImagePuzzle && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="puzzleImage">Puzzle image *</Label>
                  <Input
                    id="puzzleImage"
                    type="file"
                    accept="image/*"
                    onChange={e => setPuzzleImage(e.target.files?.[0] ?? null)}
                    required
                  />
                  {puzzleImage && (
                    <p className="text-xs text-muted-foreground">{puzzleImage.name} ({(puzzleImage.size / 1024).toFixed(1)} KB)</p>
                  )}
                  <p className="text-xs text-muted-foreground">Square images work best. The image becomes the puzzle.</p>
                </div>
                <div className="space-y-2">
                  <Label>Grid size</Label>
                  <div className="flex gap-2">
                    <Chip label="3×3 — Easier (9 pieces)" active={gridSize === 3} onClick={() => setGridSize(3)} />
                    <Chip label="4×4 — Harder (16 pieces)" active={gridSize === 4} onClick={() => setGridSize(4)} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground border rounded-lg p-3 bg-muted/40">
                  The assembled image is the reveal. Your personal message above will appear after they solve it.
                </p>
              </>
            )}

          </CardContent>
        </Card>
      )}

      {/* Section 4: What They'll Unlock (trivia/math only) */}
      {puzzleType && !isImagePuzzle && (
        <Card>
          <CardHeader><CardTitle>What they&apos;ll unlock</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(['text', 'image', 'file'] as ContentType[]).map(t => (
                <Chip
                  key={t}
                  label={t === 'text' ? 'Text message' : t === 'image' ? 'Image' : 'File'}
                  active={contentType === t}
                  onClick={() => setContentType(t)}
                />
              ))}
            </div>

            {contentType === 'text' && (
              <Textarea
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Write the message they'll see after solving…"
                rows={5}
                required
              />
            )}

            {(contentType === 'image' || contentType === 'file') && (
              <div className="space-y-1.5">
                <Input
                  type="file"
                  accept={contentType === 'image' ? 'image/*' : undefined}
                  onChange={e => setContentFile(e.target.files?.[0] ?? null)}
                  required
                />
                {contentFile && (
                  <p className="text-xs text-muted-foreground">{contentFile.name} ({(contentFile.size / 1024).toFixed(1)} KB)</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={loading || !puzzleType || !title.trim()}>
        {loading ? 'Creating your gift…' : 'Create Gift & Get Link'}
      </Button>
    </form>
  )
}
