import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'PuzzleGift <noreply@puzzlegift.app>'

export async function sendGiftSolvedEmail({
  to,
  giftTitle,
  puzzleType,
}: {
  to: string
  giftTitle: string
  puzzleType: string
}) {
  const puzzleLabel: Record<string, string> = {
    trivia: 'Trivia Quiz',
    math: 'Math Challenge',
    slide: 'Slide Puzzle',
    jigsaw: 'Jigsaw Puzzle',
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: `🎉 "${giftTitle}" was just solved!`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#faf5ff;border-radius:16px;">
        <h1 style="font-size:28px;font-weight:800;color:#6d28d9;margin-bottom:8px;">🎉 Puzzle solved!</h1>
        <p style="font-size:16px;color:#374151;line-height:1.6;">
          Someone just unlocked your gift <strong>"${giftTitle}"</strong> by solving the <strong>${puzzleLabel[puzzleType] ?? puzzleType}</strong>!
        </p>
        <p style="font-size:14px;color:#6b7280;margin-top:24px;">
          Log in to <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#7c3aed;">your dashboard</a> to see all your gifts and their solve activity.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="font-size:12px;color:#9ca3af;">PuzzleGift — Make every reveal a moment</p>
      </div>
    `,
  })
}

export async function sendGiftCreatedEmail({
  to,
  giftTitle,
  shareUrl,
  isGiftCard,
  brandName,
  amountDollars,
}: {
  to: string
  giftTitle: string
  shareUrl: string
  isGiftCard: boolean
  brandName?: string
  amountDollars?: number
}) {
  const subject = isGiftCard
    ? `Your $${amountDollars} ${brandName} gift card is locked and ready!`
    : `Your gift "${giftTitle}" is ready to share!`

  const giftCardNote = isGiftCard
    ? `<p style="font-size:16px;color:#374151;line-height:1.6;">A <strong>$${amountDollars} ${brandName} gift card</strong> has been purchased and locked inside. The recipient will only receive the claim link after solving the puzzle.</p>`
    : ''

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#faf5ff;border-radius:16px;">
        <h1 style="font-size:28px;font-weight:800;color:#6d28d9;margin-bottom:8px;">🎁 Gift ready!</h1>
        <p style="font-size:16px;color:#374151;line-height:1.6;">
          Your gift <strong>"${giftTitle}"</strong> is live and waiting for someone to solve it.
        </p>
        ${giftCardNote}
        <div style="margin:24px 0;">
          <a href="${shareUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:16px;padding:14px 28px;border-radius:12px;text-decoration:none;">
            Share Gift Link →
          </a>
        </div>
        <p style="font-size:12px;color:#9ca3af;word-break:break-all;">
          Link: ${shareUrl}
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="font-size:12px;color:#9ca3af;">PuzzleGift — Make every reveal a moment</p>
      </div>
    `,
  })
}
