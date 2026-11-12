# PuzzleGift

Puzzle-gated content sharing app. Senders upload photos/files/text and lock them behind a puzzle (multiple choice or math). Recipients follow a link, solve the puzzle, and the content unlocks.

## Stack
- Next.js 16 App Router + React 19
- Supabase (Auth, Postgres, Storage)
- Tailwind CSS v4 + shadcn/ui
- TypeScript

## Running locally
```bash
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm run dev
```

## Supabase setup
1. Create a new Supabase project
2. Run `supabase/migrations/001_initial.sql` in the SQL editor
3. Create a **private** storage bucket named `gift-content`
4. Add the storage RLS policies from the SQL file comments
5. Set all three env vars in `.env.local`

## Key architecture decisions
- Puzzle answers are NEVER sent to the client. The `puzzle_config` JSONB is stripped of answers before rendering via `stripAnswers()` in `src/app/gift/[id]/page.tsx`.
- Answer verification happens server-side in `/api/gift/[id]/solve/route.ts` using the admin (service role) Supabase client.
- File content lives in a private Supabase Storage bucket. Signed URLs (2-hour TTL) are only generated after a successful solve.

## Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login + signup |
| `/dashboard` | Sender's gift list (auth required) |
| `/create` | Create a new gift (auth required) |
| `/gift/[id]` | Public puzzle solve page |
| `/api/gift/[id]/solve` | POST: verify answers, return content |
| `/api/auth/callback` | Supabase auth callback |
| `/api/auth/signout` | Sign out |

## Puzzle types
- **Multiple choice**: sender writes questions with 4 options, picks the correct one
- **Math**: sender writes expressions (e.g. `12 × 5`) and the correct numeric answer

## MVP v2 ideas
- Slide puzzle (15-tile)
- Jigsaw puzzle
- Expiration dates on gift creation form
- Max attempts enforcement (server-side counter)
- Animated content reveal
- Gift themes (romantic, kids, friends)
