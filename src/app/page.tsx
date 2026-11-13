import Link from 'next/link'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const instant = false

export default async function LandingPage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <span className="font-heading font-extrabold text-xl tracking-tight text-gradient-primary">
          🎁 PuzzleGift
        </span>
        <div className="flex gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>My Gifts</Link>
              <Link href="/create" className={buttonVariants({ size: 'sm' })}>Create Gift</Link>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Sign In</Link>
              <Link href="/login" className={buttonVariants({ size: 'sm' })}>Get Started →</Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-28 px-6 text-center"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.28 292) 0%, oklch(0.5 0.3 310) 45%, oklch(0.6 0.27 345) 100%)' }}
        >
          <span className="absolute top-10 left-[8%] text-5xl opacity-40 animate-float select-none pointer-events-none">🧩</span>
          <span className="absolute top-24 right-[10%] text-4xl opacity-35 animate-float-delayed select-none pointer-events-none">🎯</span>
          <span className="absolute bottom-16 left-[15%] text-4xl opacity-30 animate-float-delayed select-none pointer-events-none">✨</span>
          <span className="absolute bottom-10 right-[18%] text-5xl opacity-35 animate-float select-none pointer-events-none">🎊</span>
          <span className="absolute top-16 left-[42%] text-3xl opacity-25 animate-float select-none pointer-events-none">🔑</span>
          <span className="absolute bottom-20 right-[40%] text-3xl opacity-25 animate-float-delayed select-none pointer-events-none">💝</span>

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium mb-6 border border-white/20">
              🔐 The gift they have to earn — and never forget
            </div>
            <h1 className="font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight mb-6 text-white">
              Make them work<br />
              <span className="relative">
                for the <em className="not-italic underline decoration-wavy decoration-yellow-300">surprise</em>
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Lock photos, messages, and gift cards behind a fun puzzle.
              Your recipient can&apos;t see what&apos;s inside until they solve it —
              making every reveal 10× more exciting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={user ? '/create' : '/login'}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-purple-700 font-bold text-lg hover:bg-purple-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Create a Gift 🎁
              </Link>
              <a
                href="#stories"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                See How People Use It
              </a>
            </div>
            {/* Trust bar */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/60 text-sm">
              <span>✓ No app download for recipient</span>
              <span>✓ Just send a link</span>
              <span>✓ $1.00 per gift</span>
              <span>✓ Gift cards from $10</span>
            </div>
          </div>
        </section>

        {/* Real Stories */}
        <section id="stories" className="py-20 px-6 bg-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading font-extrabold text-4xl mb-3">People are having way too much fun with this</h2>
              <p className="text-muted-foreground text-lg">Real ways people are using PuzzleGift every day</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  quote: "I locked our anniversary photo behind questions about our first date. He got it wrong twice. We haven't laughed that hard in years.",
                  who: 'Sarah — married 8 years',
                  emoji: '💑',
                  tag: 'Couples',
                  color: 'bg-rose-50 border-rose-200',
                  tagColor: 'bg-rose-100 text-rose-700',
                },
                {
                  quote: "Sent my grandkids a $50 Amazon gift card for Christmas — but they had to solve 5 math problems first. Their teacher called me to say thank you.",
                  who: 'Robert — proud grandpa',
                  emoji: '👴',
                  tag: 'Grandparents',
                  color: 'bg-amber-50 border-amber-200',
                  tagColor: 'bg-amber-100 text-amber-700',
                },
                {
                  quote: "I hid the Airbnb address for our girls trip behind trivia questions about the bride. The group chat absolutely lost it. Best bachelorette reveal ever.",
                  who: 'Jessica — maid of honor',
                  emoji: '🎉',
                  tag: 'Friends',
                  color: 'bg-violet-50 border-violet-200',
                  tagColor: 'bg-violet-100 text-violet-700',
                },
                {
                  quote: "My son wanted to know his birthday gift early. I sent it as a PuzzleGift locked behind a jigsaw. He worked on it for 45 minutes straight. Best. Dad. Moment. Ever.",
                  who: 'Mike — dad of three',
                  emoji: '👨‍👧‍👦',
                  tag: 'Parents & Kids',
                  color: 'bg-emerald-50 border-emerald-200',
                  tagColor: 'bg-emerald-100 text-emerald-700',
                },
                {
                  quote: "My girlfriend lives two states away. I send her a surprise photo every Friday locked behind a trivia quiz about us. It's become our favorite ritual.",
                  who: 'Darnell — long-distance relationship',
                  emoji: '💌',
                  tag: 'Long Distance',
                  color: 'bg-blue-50 border-blue-200',
                  tagColor: 'bg-blue-100 text-blue-700',
                },
                {
                  quote: "My students unlock their weekly bonus points by solving a slide puzzle I make from a photo of the classroom. They beg me to give them one now.",
                  who: 'Mrs. Torres — 4th grade teacher',
                  emoji: '📚',
                  tag: 'Education',
                  color: 'bg-fuchsia-50 border-fuchsia-200',
                  tagColor: 'bg-fuchsia-100 text-fuchsia-700',
                },
              ].map(({ quote, who, emoji, tag, color, tagColor }) => (
                <div key={who} className={`rounded-2xl border-2 p-6 ${color} hover:shadow-lg transition-all`}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl shrink-0">{emoji}</div>
                    <div>
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${tagColor}`}>{tag}</span>
                      <p className="text-foreground/80 text-sm leading-relaxed mb-3 italic">&ldquo;{quote}&rdquo;</p>
                      <p className="text-xs font-semibold text-muted-foreground">— {who}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Puzzle Types */}
        <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, oklch(0.97 0.01 285) 0%, oklch(0.99 0.004 285) 100%)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading font-extrabold text-4xl mb-3">Four ways to make them work for it</h2>
              <p className="text-muted-foreground text-lg">We generate the puzzle automatically — you just pick the type</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  emoji: '🧠',
                  name: 'Trivia Quiz',
                  example: '"Name the year we met to unlock your photo"',
                  desc: '9 categories including history, science, sports & pop culture. Easy to expert.',
                  color: 'from-violet-500 to-purple-600',
                  bg: 'bg-violet-50 border-violet-200',
                },
                {
                  emoji: '➕',
                  name: 'Math Challenge',
                  example: '"Solve 5 problems to open your gift card"',
                  desc: 'From simple addition to percentages — perfect for rewarding kids and grandkids.',
                  color: 'from-blue-500 to-cyan-500',
                  bg: 'bg-blue-50 border-blue-200',
                },
                {
                  emoji: '🔀',
                  name: 'Slide Puzzle',
                  example: '"Slide the tiles to reveal the surprise photo"',
                  desc: 'Upload any image — it gets scrambled into a 3×3 or 4×4 tile puzzle.',
                  color: 'from-emerald-500 to-teal-500',
                  bg: 'bg-emerald-50 border-emerald-200',
                },
                {
                  emoji: '🧩',
                  name: 'Jigsaw Puzzle',
                  example: '"Tap pieces into place to see what\'s inside"',
                  desc: 'Scrambled photo pieces they tap and swap until the picture comes together.',
                  color: 'from-rose-500 to-pink-500',
                  bg: 'bg-rose-50 border-rose-200',
                },
              ].map(({ emoji, name, example, desc, color, bg }) => (
                <div key={name} className={`rounded-2xl border-2 p-6 ${bg} hover:shadow-lg transition-all hover:-translate-y-1`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                    {emoji}
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">{name}</h3>
                  <p className="text-xs font-medium text-muted-foreground italic mb-3 leading-snug">{example}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What can you lock inside */}
        <section className="py-20 px-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading font-extrabold text-4xl mb-3">What can you lock inside?</h2>
              <p className="text-muted-foreground text-lg">Anything worth earning</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  emoji: '📸',
                  title: 'A photo or image',
                  desc: 'Anniversary pictures, vacation snaps, funny selfies, ultrasound reveals — any image that deserves a dramatic unveiling.',
                  badge: 'Most popular',
                  badgeColor: 'bg-violet-100 text-violet-700',
                  style: { background: 'linear-gradient(135deg, oklch(0.95 0.025 292) 0%, oklch(0.98 0.01 310) 100%)' },
                },
                {
                  emoji: '💳',
                  title: 'A real gift card',
                  desc: 'Amazon, Starbucks, Apple, Netflix, Target and more. We buy it, lock it, and they claim it after solving. From $10.',
                  badge: 'New!',
                  badgeColor: 'bg-rose-100 text-rose-700',
                  style: { background: 'linear-gradient(135deg, oklch(0.97 0.025 345) 0%, oklch(0.98 0.015 10) 100%)' },
                },
                {
                  emoji: '💬',
                  title: 'A personal message',
                  desc: 'Love letters, heartfelt birthday wishes, funny roasts, secret announcements. Words land harder when they\'re earned.',
                  badge: null,
                  badgeColor: '',
                  style: { background: 'linear-gradient(135deg, oklch(0.95 0.025 180) 0%, oklch(0.97 0.015 200) 100%)' },
                },
                {
                  emoji: '📎',
                  title: 'Any file',
                  desc: 'A party invite PDF, a song you wrote, a voice memo, a document — if it\'s a file, you can lock it.',
                  badge: null,
                  badgeColor: '',
                  style: { background: 'linear-gradient(135deg, oklch(0.95 0.025 60) 0%, oklch(0.97 0.015 80) 100%)' },
                },
              ].map(({ emoji, title, desc, badge, badgeColor, style }) => (
                <div key={title} className="rounded-2xl border p-7 hover:shadow-lg transition-all hover:-translate-y-1" style={style}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl shrink-0">{emoji}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-heading font-bold text-lg">{title}</h3>
                        {badge && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>}
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 px-6" style={{ background: 'linear-gradient(180deg, oklch(0.97 0.01 285) 0%, oklch(0.99 0.004 285) 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading font-extrabold text-4xl mb-3">Ridiculously easy to send</h2>
              <p className="text-muted-foreground text-lg">Three steps. No technical skills required.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  step: '01',
                  emoji: '📦',
                  title: 'Create your gift',
                  desc: 'Pick what you want to lock inside (photo, message, or gift card), choose a puzzle type, and write a personal note.',
                  color: 'text-violet-600',
                  bg: 'bg-violet-100',
                },
                {
                  step: '02',
                  emoji: '🔗',
                  title: 'Share the link',
                  desc: 'You get a unique link. Text it, DM it, email it. Your recipient needs zero accounts or apps — just the link.',
                  color: 'text-fuchsia-600',
                  bg: 'bg-fuchsia-100',
                },
                {
                  step: '03',
                  emoji: '🎉',
                  title: 'They earn it!',
                  desc: 'They solve the puzzle, the surprise is revealed, and you get a notification the moment it happens.',
                  color: 'text-rose-600',
                  bg: 'bg-rose-100',
                },
              ].map(({ step, emoji, title, desc, color, bg }) => (
                <div key={step} className="text-center">
                  <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-5 shadow-sm`}>
                    <span className="text-3xl">{emoji}</span>
                  </div>
                  <div className={`font-heading font-black text-xs tracking-widest uppercase mb-2 ${color}`}>{step}</div>
                  <h3 className="font-heading font-bold text-xl mb-3">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing clarity */}
        <section className="py-16 px-6 bg-background">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading font-extrabold text-3xl mb-4">Simple, honest pricing</h2>
            <p className="text-muted-foreground mb-10">No subscriptions. No hidden fees. Pay per gift.</p>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="rounded-2xl border-2 border-primary/20 p-7 text-center" style={{ background: 'linear-gradient(135deg, oklch(0.96 0.025 292) 0%, oklch(0.98 0.01 310) 100%)' }}>
                <div className="text-4xl mb-3">🎁</div>
                <div className="font-heading font-black text-4xl text-primary mb-1">$1.00</div>
                <div className="font-semibold mb-3">per gift</div>
                <p className="text-sm text-muted-foreground">Photos, messages, files — locked behind any puzzle. Recipient gets it instantly after solving.</p>
              </div>
              <div className="rounded-2xl border-2 border-rose-200 p-7 text-center" style={{ background: 'linear-gradient(135deg, oklch(0.97 0.025 345) 0%, oklch(0.98 0.015 10) 100%)' }}>
                <div className="text-4xl mb-3">💳</div>
                <div className="font-heading font-black text-4xl text-rose-600 mb-1">$1.99</div>
                <div className="font-semibold mb-3">+ card value</div>
                <p className="text-sm text-muted-foreground">Gift cards from Amazon, Starbucks, Apple & more. We handle the purchase — they earn the code.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-24 px-6 text-center"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.28 292) 0%, oklch(0.5 0.3 310) 45%, oklch(0.6 0.27 345) 100%)' }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-6xl mb-6 animate-bounce">🎁</p>
            <h2 className="font-heading font-extrabold text-4xl md:text-5xl text-white mb-4">
              Stop sending boring gifts.
            </h2>
            <p className="text-white/75 text-xl mb-3">
              Make them laugh, make them think, make them earn it.
            </p>
            <p className="text-white/55 text-base mb-10">
              Takes 2 minutes to create. No app download for your recipient.
            </p>
            <Link
              href={user ? '/create' : '/login'}
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-white text-purple-700 font-bold text-xl hover:bg-purple-50 transition-all shadow-2xl hover:-translate-y-0.5"
            >
              Create Your First Gift — $1.00 🎉
            </Link>
            <p className="text-white/40 text-sm mt-5">Secure payment via Stripe. Cancel anytime. It&apos;s $1 — just try it.</p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6 text-center text-sm text-muted-foreground">
        <span className="font-heading font-bold text-gradient-primary">🎁 PuzzleGift</span>
        <span className="mx-3">—</span>
        Make every reveal a moment
      </footer>
    </div>
  )
}
