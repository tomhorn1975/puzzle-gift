import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResend } from '@/lib/email'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { name, address1, address2, city, state, zip, country } = body
  if (!name || !address1 || !city || !state || !zip)
    return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 })

  const admin = createAdminClient()

  const { data: gift } = await admin
    .from('gifts')
    .select('id, title, notification_email, amazon_product_url, amazon_product_title, amazon_product_image, is_active, content_type')
    .eq('id', id)
    .single()

  const g = gift as typeof gift & {
    amazon_product_url?: string | null
    amazon_product_title?: string | null
    amazon_product_image?: string | null
  }

  if (!g || !g.is_active || g.content_type !== 'amazon_prize')
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await admin.from('prize_claims' as never).insert({
    gift_id: id,
    recipient_name: name,
    address_line1: address1,
    address_line2: address2 || null,
    city, state, zip,
    country: country || 'US',
  } as never)

  if (g.notification_email) {
    const resend = getResend()
    if (resend) {
      const productLine = g.amazon_product_title
        ? `<p><strong>Product:</strong> ${g.amazon_product_title}</p>`
        : ''
      const productLink = g.amazon_product_url
        ? `<p><a href="${g.amazon_product_url}" style="color:#7c3aed;">View product on Amazon →</a></p>`
        : ''

      await resend.emails.send({
        from: 'PuzzleGift <noreply@puzzlegift.app>',
        to: g.notification_email,
        subject: `🎁 "${g.title}" — your winner claimed their prize!`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#faf5ff;border-radius:16px;">
            <h1 style="font-size:24px;font-weight:800;color:#6d28d9;">🏆 Prize claimed!</h1>
            <p>Someone solved your gift <strong>"${g.title}"</strong> and claimed their Amazon prize. Ship it to:</p>
            ${productLine}
            ${productLink}
            <div style="background:#f3f4f6;border-radius:12px;padding:16px;margin:16px 0;font-size:15px;line-height:1.8;">
              <strong>${name}</strong><br/>
              ${address1}${address2 ? '<br/>' + address2 : ''}<br/>
              ${city}, ${state} ${zip}<br/>
              ${country || 'US'}
            </div>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="font-size:12px;color:#9ca3af;">PuzzleGift — Make every reveal a moment</p>
          </div>
        `,
      }).catch(err => console.error('Failed to send prize claim email:', err))
    }
  }

  return NextResponse.json({ ok: true })
}
