import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: gift } = await admin
    .from('gifts')
    .select('id, content_type, text_content, file_path, personal_message, gift_card_brand_name, gift_card_amount_cents, gift_card_code, tasks_approved_at, is_active, unlock_type')
    .eq('id', id)
    .single()

  const g = gift as typeof gift & {
    unlock_type?: string
    tasks_approved_at?: string | null
  }

  if (!g || !g.is_active || g.unlock_type !== 'task_list')
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!g.tasks_approved_at)
    return NextResponse.json({ approved: false }, { status: 403 })

  admin.from('gift_access').insert({ gift_id: g.id, ip_address: null } as never)
    .then(() => null).catch(() => null)

  if (g.content_type === 'gift_card') {
    return NextResponse.json({
      success: true,
      content: {
        type: 'gift_card',
        brand_name: g.gift_card_brand_name,
        amount_cents: g.gift_card_amount_cents,
        claim_link: g.gift_card_code,
      },
    })
  }

  if (g.content_type === 'text') {
    return NextResponse.json({ success: true, content: { type: 'text', value: g.text_content } })
  }

  const { data: signed } = await admin.storage
    .from('gift-content')
    .createSignedUrl(g.file_path!, 60 * 60 * 2)

  if (!signed?.signedUrl)
    return NextResponse.json({ error: 'Could not retrieve content' }, { status: 500 })

  return NextResponse.json({ success: true, content: { type: 'url', url: signed.signedUrl } })
}
