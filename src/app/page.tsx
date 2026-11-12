import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl tracking-tight">PuzzleGift</span>
        <div className="flex gap-3">
          {user ? (
            <>
              <Button variant="ghost" asChild><Link href="/dashboard">My Gifts</Link></Button>
              <Button asChild><Link href="/create">Create Gift</Link></Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild><Link href="/login">Sign In</Link></Button>
              <Button asChild><Link href="/login">Get Started</Link></Button>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 px-6 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
            Share memories that<br />unlock with a smile
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Send photos, messages, and files locked behind a fun puzzle.
            Your recipient has to solve it before they can see what&apos;s inside.
          </p>
          <Button size="lg" asChild>
            <Link href={user ? '/create' : '/login'}>Send a Gift</Link>
          </Button>
        </section>

        {/* How it works */}
        <section className="py-20 bg-muted/40 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-14">How it works</h2>
            <div className="grid md:grid-cols-3 gap-10 text-center">
              <div>
                <div className="text-4xl mb-4">📦</div>
                <h3 className="font-semibold text-lg mb-2">1. Create a gift</h3>
                <p className="text-muted-foreground text-sm">Upload a photo, write a message, or share a file. Add a puzzle to protect it.</p>
              </div>
              <div>
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="font-semibold text-lg mb-2">2. Share the link</h3>
                <p className="text-muted-foreground text-sm">Copy your gift link and send it via text, email, or any messaging app.</p>
              </div>
              <div>
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="font-semibold text-lg mb-2">3. They solve it</h3>
                <p className="text-muted-foreground text-sm">Your recipient answers the puzzle and unlocks the surprise inside.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-14">Perfect for everyone</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { emoji: '📚', title: 'Learning', desc: 'Use math and trivia puzzles to make learning rewarding for kids.' },
                { emoji: '❤️', title: 'Romance', desc: 'Send a loving photo locked with questions only your partner would know.' },
                { emoji: '🎊', title: 'Friends', desc: 'Share inside jokes, surprise announcements, and party invites in a fun way.' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="rounded-2xl border p-6">
                  <div className="text-3xl mb-3">{emoji}</div>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center bg-muted/40">
          <h2 className="text-3xl font-bold mb-4">Ready to surprise someone?</h2>
          <p className="text-muted-foreground mb-8">Free to use. No app to download. Just a link.</p>
          <Button size="lg" asChild>
            <Link href={user ? '/create' : '/login'}>Create your first gift</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t py-6 px-6 text-center text-sm text-muted-foreground">
        PuzzleGift &mdash; Make every reveal a moment
      </footer>
    </div>
  )
}
