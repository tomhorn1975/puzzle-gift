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
              🎉 Send gifts that are impossible to ignore
            </div>
            <h1 className="font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight mb-6 text-white">
              The gift they have<br />
              <span className="relative">
                to <em className="not-italic underline decoration-wavy decoration-yellow-300">earn</em>
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
              Lock photos, messages, and files behind a fun puzzle.
              Your recipient has to solve it before seeing what&apos;s inside.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={user ? '/create' : '/login'}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-purple-700 font-bold text-lg hover:bg-purple-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Create a Gift 🎁
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                See How It Works
              </a>
            </div>
          </div>
        </section>

        {/* Puzzle Types */}
        <section className="py-20 px-6 bg-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading font-extrabold text-4xl mb-3">Pick your puzzle</h2>
              <p className="text-muted-foreground text-lg">Four types of puzzles — all generated for you automatically</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  emoji: '🧠',
                  name: 'Trivia',
                  desc: 'Answer questions from categories like science, history, sports, and pop culture.',
                  color: 'from-violet-500 to-purple-600',
                  bg: 'bg-violet-50 border-violet-200',
                },
                {
                  emoji: '➕',
                  name: 'Math',
                  desc: 'Solve a set of math problems — easy addition to tough percentages.',
                  color: 'from-blue-500 to-cyan-500',
                  bg: 'bg-blue-50 border-blue-200',
                },
                {
                  emoji: '🔀',
                  name: 'Slide Puzzle',
                  desc: 'Slide scrambled tiles to piece together a secret image.',
                  color: 'from-emerald-500 to-teal-500',
                  bg: 'bg-emerald-50 border-emerald-200',
                },
                {
                  emoji: '🧩',
                  name: 'Jigsaw',
                  desc: 'Tap-to-swap scrambled pieces until the picture is revealed.',
                  color: 'from-rose-500 to-pink-500',
                  bg: 'bg-rose-50 border-rose-200',
                },
              ].map(({ emoji, name, desc, color, bg }) => (
                <div key={name} className={`rounded-2xl border-2 p-6 ${bg} hover:shadow-lg transition-all hover:-translate-y-1`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                    {emoji}
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">{name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 px-6" style={{ background: 'linear-gradient(180deg, oklch(0.97 0.01 285) 0%, oklch(0.99 0.004 285) 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading font-extrabold text-4xl mb-3">How it works</h2>
              <p className="text-muted-foreground text-lg">Three steps, then sit back and watch them work for it</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  step: '01',
                  emoji: '📦',
                  title: 'Create your gift',
                  desc: 'Upload a photo, write a message, or share a file. Pick a puzzle type and difficulty.',
                  color: 'text-violet-600',
                  bg: 'bg-violet-100',
                },
                {
                  step: '02',
                  emoji: '🔗',
                  title: 'Share the link',
                  desc: 'Copy your gift link and send it via text, email, or any app. No sign-up needed to solve.',
                  color: 'text-fuchsia-600',
                  bg: 'bg-fuchsia-100',
                },
                {
                  step: '03',
                  emoji: '🎉',
                  title: 'They earn it!',
                  desc: 'Your recipient solves the puzzle and unlocks the surprise waiting inside.',
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

        {/* Use Cases */}
        <section className="py-20 px-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading font-extrabold text-4xl mb-3">Perfect for everyone</h2>
              <p className="text-muted-foreground text-lg">Make any occasion unforgettable</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  emoji: '👨‍👩‍👧',
                  title: 'Families',
                  desc: 'Make learning rewarding. Lock a fun surprise behind a math or trivia challenge for your kids.',
                  style: { background: 'linear-gradient(135deg, oklch(0.95 0.025 292) 0%, oklch(0.97 0.015 310) 100%)' },
                },
                {
                  emoji: '💑',
                  title: 'Couples',
                  desc: 'Send a loving photo locked with questions only your partner would know the answers to.',
                  style: { background: 'linear-gradient(135deg, oklch(0.97 0.025 345) 0%, oklch(0.98 0.015 10) 100%)' },
                },
                {
                  emoji: '🎊',
                  title: 'Friends',
                  desc: 'Share surprise party invites, inside jokes, and announcements in the most fun way possible.',
                  style: { background: 'linear-gradient(135deg, oklch(0.95 0.025 180) 0%, oklch(0.97 0.015 200) 100%)' },
                },
              ].map(({ emoji, title, desc, style }) => (
                <div key={title} className="rounded-2xl border p-7 hover:shadow-lg transition-all hover:-translate-y-1" style={style}>
                  <div className="text-4xl mb-4">{emoji}</div>
                  <h3 className="font-heading font-bold text-xl mb-2">{title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-24 px-6 text-center"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.28 292) 0%, oklch(0.5 0.3 310) 45%, oklch(0.6 0.27 345) 100%)' }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-6xl mb-6">🎁</p>
            <h2 className="font-heading font-extrabold text-4xl md:text-5xl text-white mb-4">
              Ready to surprise someone?
            </h2>
            <p className="text-white/75 text-xl mb-10">
              Free to use. No app to download. Just share a link.
            </p>
            <Link
              href={user ? '/create' : '/login'}
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-white text-purple-700 font-bold text-xl hover:bg-purple-50 transition-all shadow-2xl hover:-translate-y-0.5"
            >
              Create Your First Gift 🎉
            </Link>
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
