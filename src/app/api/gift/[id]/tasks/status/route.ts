import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createAdminClient()

  const { data } = await admin
    .from('gifts')
    .select('tasks_submitted_at, tasks_approved_at')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    submitted: !!(data as { tasks_submitted_at?: string | null }).tasks_submitted_at,
    approved: !!(data as { tasks_approved_at?: string | null }).tasks_approved_at,
  })
}
