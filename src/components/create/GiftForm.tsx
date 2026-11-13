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
type GiftMode = 'regular' | 'gift_card'

const PUZZLE_TYPES: { type: PuzzleType; emoji: string; label: string; desc: string }[] = [
  { type: 'trivia',  emoji: '🧠', label: 'Trivia Quiz',    desc: "Pick a category and difficulty. We'll fetch the questions." },
  { type: 'math',    emoji: '➗', label: 'Math Challenge', desc: "Choose a difficulty. We'll generate the problems."           },
  { type: 'slide',   emoji: '◈',  label: 'Slide Puzzle',  desc: 'Upload an image. Recipients slide tiles to assemble it.'     },
  { type: 'jigsaw',  emoji: '🧩', label: 'Jigsaw Puzzle', desc: 'Upload an image. Recipients tap pieces to put it together.'  },
]

const GC_BRANDS = [
  { id: 'AMAZONG3HV5',   name: 'Amazon',    emoji: '📦', amounts: [10,25,50,100,200] },
  { id: 'V_STARBUCKS01', name: 'Starbucks', emoji: '☕', amounts: [10,25,50]         },
  { id: 'V_APPLE_GC01',  name: 'Apple',     emoji: '🍎', amounts: [15,25,50,100]     },
  { id: 'V_NETFLIX01',   name: 'Netflix',   emoji: '🎬', amounts: [15,25,30]         },
  { id: 'V_TARGET_GC01', name: 'Target',    emoji: '🎯', amounts: [10,25,50,100]     },
  { id: 'V_WALMART01',   name: 'Walmart',   emoji: '🛒', amounts: [10,25,50,100]     },
  { id: 'V_DOORDASH01',  name: 'DoorDash',  emoji: '🍔', amounts: [15,25,50]         },
  { id: 'V_SPOTIFY01',   name: 'Spotify',   emoji: '🎵', amounts: [10,30,60]         },
  { id: 'V_UBER01',      name: 'Uber',      emoji: '🚗', amounts: [10,25,50]         },
  { id: 'V_AIRBNB01',    name: 'Airbnb',    emoji: '🏠', amounts: [25,50,100,200]    },
]

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
      }`}
    >
      {label}
    </button>
  )
}

export function GiftForm({ userId }: Props) {
  const supabase = createClient()

  const [giftMode, setGiftMode] = useState<GiftMode>('regular')

  const [title, setTitle]     = useState('')
  const [message, setMessage] = useState('')

  const [puzzleType, setPuzzleType] = useState<PuzzleType | null>(null)

  const [triviaCategory, setTriviaCategory]     = useState(9)
  const [triviaDifficulty, setTriviaDifficulty] = useState<Difficulty>('medium')
  const [triviaCount, setTriviaCount]           = useState(4)

  const [mathDifficulty, setMathDifficulty] = useState<Difficulty>('medium')
  const [mathCount, setMathCount]           = useState(4)

  const [puzzleImage, setPuzzleImage] = useState<File | null>(null)
  const [gridSize, setGridSize]       = useState<3 | 4>(3)

  const [contentType, setContentType] = useState<ContentType>('text')
  const [textContent, setTextContent] = useState('')
  const [contentFile, setContentFile] = useState<File | null>(null)

  const [gcBrandId, setGcBrandId]     = useState<string | null>(null)
  const [gcBrandName, setGcBrandName] = useState<string | null>(null)
  const [gcAmount, setGcAmount]       = useState<number | null>(null)

  const [notificationEmail, setNotificationEmail] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const isImagePuzzle  = puzzleType === 'slide' || puzzleType === 'jigsaw'
  const selectedBrand  = GC_BRANDS.find(b => b.id === gcBrandId)
  const totalDisplay   = giftMode === 'gift_card' && gcAmount
    ? `$${(gcAmount + 1.99).toFixed(2)}`
    : '$1.00'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!puzzleType) { setError('Please choose a puzzle type.'); return }
    if (giftMode === 'gift_card' && (!gcBrandId || !gcAmount)) {
      setError('Please select a gift card brand and amount.')
      return
    }
    if (!notificationEmail.trim()) { setError('Please enter your email for notifications.'); return }
    setLoading(true)

    let draftId: string | null = null

    try {
      const giftId = crypto.randomUUID()
      draftId = giftId
      let puzzleConfig: unknown
      let filePath: string | null = null
      let actualContentType: ContentType = giftMode === 'gift_card' ? 'gift_card' : contentType

      if (puzzleType === 'trivia') {
        const questions = await fetchTriviaQuestions(triviaCategory, triviaDifficulty, triviaCount)
        const cat = TRIVIA_CATEGORIES.find(c => c.id === triviaCategory)
        puzzleConfig = { type: 'trivia', category_id: triviaCategory, category_name: cat?.name ?? '', difficulty: triviaDifficulty, questions }

      } else if (puzzleType === 'math') {
        const problems = generateMathProblems(mathDifficulty, mathCount)
        puzzleConfig = { type: 'math', difficulty: mathDifficulty, problems }

      } else {
        if (!puzzleImage) throw new Error('Please upload an image for the puzzle.')
        const ext  = puzzleImage.name.split('.').pop()
        const path = `${userId}/${giftId}.${ext}`
        const { error: upErr } = await supabase.storage.from('puzzle-images').upload(path, puzzleImage)
        if (upErr) throw new Error(`Image upload failed: ${upErr.message}`)
        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/puzzle-images/${path}`
        puzzleConfig = { type: puzzleType, grid_size: gridSize, image_url: imageUrl }
        if (giftMode === 'regular') actualContentType = 'text'
      }

      if (giftMode === 'regular' && !isImagePuzzle && (contentType === 'image' || contentType === 'file')) {
        if (!contentFile) throw new Error('Please select a file to share.')
        const ext = contentFile.name.split('.').pop()
        filePath  = `${userId}/${giftId}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('gift-content').upload(filePath, contentFile)
        if (upErr) throw new Error(`File upload failed: ${upErr.message}`)
      }

      if (giftMode === 'regular' && !isImagePuzzle && contentType === 'text' && !textContent.trim()) {
        throw new Error('Please enter a message to share.')
      }

      const { error: insertErr } = await supabase.from('gifts').insert({
        id: giftId,
        sender_id: userId,
        title: title.trim(),
        personal_message: message.trim() || null,
        content_type: actualContentType,
        file_path: filePath,
        text_content: (giftMode === 'regular' && !isImagePuzzle && contentType === 'text') ? textContent.trim() : null,
        puzzle_type: puzzleType,
        puzzle_config: puzzleConfig as never,
        max_attempts: 5,
        is_active: false,
        payment_status: 'pending',
        notification_email: notificationEmail.trim() || null,
        ...(giftMode === 'gift_card' ? {
          gift_card_brand_id: gcBrandId,
          gift_card_brand_name: gcBrandName,
          gift_card_amount_cents: gcAmount! * 100,
        } : {}),
      })
      if (insertErr) throw new Error(insertErr.message)

      const checkoutRes = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gift_id: giftId }),
      })
      const checkoutText = await checkoutRes.text()
      let checkoutData: { url?: string; error?: string } = {}
      try { checkoutData = JSON.parse(checkoutText) } catch { /* non-JSON response */ }
      if (!checkoutRes.ok || !checkoutData.url) {
        throw new Error(checkoutData.error ?? `Payment setup failed (${checkoutRes.status}). Make sure your Stripe keys are configured.`)
      }

      window.location.href = checkoutData.url

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      if (draftId) {
        await supabase.from('gifts').delete().eq('id', draftId).eq('sender_id', userId)
      }
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Gift Mode Toggle */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setGiftMode('regular')}
          className={`flex-1 py-4 px-5 rounded-2xl border-2 text-left transition-all ${
            giftMode === 'regular'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40'
          }`}
        >
          <div className="text-2xl mb-1">🎁</div>
          <div className="font-semibold text-sm">Regular Gift</div>
          <div className="text-xs text-muted-foreground mt-0.5">Text, image, or file — $1.00 to send</div>
        </button>
        <button
          type="button"
          onClick={() => setGiftMode('gift_card')}
          className={`flex-1 py-4 px-5 rounded-2xl border-2 text-left transition-all ${
            giftMode === 'gift_card'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40'
          }`}
        >
          <div className="text-2xl mb-1">💳</div>
          <div className="font-semibold text-sm">Gift Card</div>
          <div className="text-xs text-muted-foreground mt-0.5">We buy it, they earn it — from $11.99</div>
        </button>
      </div>

      {/* Gift Details */}
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

      {/* Gift Card Brand + Amount */}
      {giftMode === 'gift_card' && (
        <Card>
          <CardHeader><CardTitle>Choose a gift card</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Brand</Label>
              <div className="grid grid-cols-5 gap-2">
                {GC_BRANDS.map(brand => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => { setGcBrandId(brand.id); setGcBrandName(brand.name); setGcAmount(null) }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all ${
                      gcBrandId === brand.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span className="text-2xl">{brand.emoji}</span>
                    <span className="text-xs font-medium leading-tight">{brand.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {selectedBrand && (
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedBrand.amounts.map(amt => (
                    <Chip key={amt} label={`$${amt}`} active={gcAmount === amt} onClick={() => setGcAmount(amt)} />
                  ))}
                </div>
              </div>
            )}
            {gcAmount && gcBrandName && (
              <div className="rounded-xl bg-muted/60 p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{gcBrandName} gift card</span>
                  <span>${gcAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Puzzle fee</span>
                  <span>$1.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service fee</span>
                  <span>$0.99</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-border">
                  <span>Total</span>
                  <span>${(gcAmount + 1.99).toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Choose Puzzle Type */}
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
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
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

      {/* Puzzle Settings */}
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
                    {(['easy','medium','hard'] as Difficulty[]).map(d => (
                      <Chip key={d} label={d.charAt(0).toUpperCase()+d.slice(1)} active={triviaDifficulty===d} onClick={() => setTriviaDifficulty(d)} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Number of questions</Label>
                  <div className="flex gap-2">
                    {[3,4,5].map(n => (
                      <Chip key={n} label={String(n)} active={triviaCount===n} onClick={() => setTriviaCount(n)} />
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
                    {(['easy','medium','hard'] as Difficulty[]).map(d => (
                      <Chip key={d} label={d.charAt(0).toUpperCase()+d.slice(1)} active={mathDifficulty===d} onClick={() => setMathDifficulty(d)} />
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
                    {[3,4,5].map(n => (
                      <Chip key={n} label={String(n)} active={mathCount===n} onClick={() => setMathCount(n)} />
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
                  {puzzleImage && <p className="text-xs text-muted-foreground">{puzzleImage.name} ({(puzzleImage.size/1024).toFixed(1)} KB)</p>}
                  <p className="text-xs text-muted-foreground">Square images work best. The image becomes the puzzle.</p>
                </div>
                <div className="space-y-2">
                  <Label>Grid size</Label>
                  <div className="flex gap-2">
                    <Chip label="3×3 — Easier (9 pieces)" active={gridSize===3} onClick={() => setGridSize(3)} />
                    <Chip label="4×4 — Harder (16 pieces)" active={gridSize===4} onClick={() => setGridSize(4)} />
                  </div>
                </div>
                {giftMode === 'regular' && (
                  <p className="text-sm text-muted-foreground border rounded-lg p-3 bg-muted/40">
                    The assembled image is the reveal. Your personal message above will appear after they solve it.
                  </p>
                )}
              </>
            )}

          </CardContent>
        </Card>
      )}

      {/* What they'll unlock (regular gifts only, not image puzzles) */}
      {giftMode === 'regular' && puzzleType && !isImagePuzzle && (
        <Card>
          <CardHeader><CardTitle>What they&apos;ll unlock</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(['text','image','file'] as ContentType[]).map(t => (
                <Chip key={t} label={t==='text'?'Text message':t==='image'?'Image':'File'} active={contentType===t} onClick={() => setContentType(t)} />
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
                  accept={contentType==='image'?'image/*':undefined}
                  onChange={e => setContentFile(e.target.files?.[0] ?? null)}
                  required
                />
                {contentFile && <p className="text-xs text-muted-foreground">{contentFile.name} ({(contentFile.size/1024).toFixed(1)} KB)</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gift card how-it-works note */}
      {giftMode === 'gift_card' && gcBrandId && gcAmount && (
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 text-sm">
          <p className="font-semibold mb-1">💳 How the gift card works</p>
          <p className="text-muted-foreground leading-relaxed">
            We&apos;ll purchase a <strong>${gcAmount} {gcBrandName}</strong> gift card after payment.
            The claim link will be hidden inside the puzzle — your recipient only sees it after solving.
          </p>
        </div>
      )}

      {/* Notification Email */}
      <Card>
        <CardHeader><CardTitle>Your email</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          <Label htmlFor="notifEmail">We&apos;ll notify you when they solve it</Label>
          <Input
            id="notifEmail"
            type="email"
            value={notificationEmail}
            onChange={e => setNotificationEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        size="lg"
        className="w-full text-base"
        disabled={loading || !puzzleType || !title.trim() || !notificationEmail.trim()}
      >
        {loading
          ? 'Setting up your gift…'
          : `Pay ${totalDisplay} & ${giftMode === 'gift_card' ? 'Send Gift Card' : 'Send Gift'} →`}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Secure payment via Stripe.{' '}
        {giftMode === 'gift_card'
          ? 'Gift card is purchased instantly after payment.'
          : 'Your gift goes live immediately after payment.'}
      </p>
    </form>
  )
}
