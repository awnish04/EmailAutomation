import { Resend } from 'resend'

// ─── Singleton ──────────────────────────────────────────────────────────────

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined
}

export const resend =
  globalForResend.resend ?? new Resend(process.env.RESEND_API_KEY!)

if (process.env.NODE_ENV !== 'production') {
  globalForResend.resend = resend
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string | string[]
  from?: string
  subject: string
  html: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
  headers?: Record<string, string>
}

export interface BulkEmailItem extends SendEmailOptions {
  to: string // Bulk requires single recipient per item
}

// ─── Send Single Email ─────────────────────────────────────────────────────

export async function sendEmail(options: SendEmailOptions) {
  const { to, from, subject, html, replyTo, tags, headers } = options

  const result = await resend.emails.send({
    from: from ?? `Autonity <noreply@${process.env.RESEND_DOMAIN ?? 'autonity.app'}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo: replyTo ?? undefined,
    tags: tags ?? undefined,
    headers: headers ?? undefined,
  })

  if (result.error) {
    throw new Error(`Failed to send email: ${result.error.message}`)
  }

  return result.data
}

// ─── Send Bulk Emails (rate-limited) ────────────────────────────────────────

const BATCH_SIZE = 10
const BATCH_DELAY_MS = 1100 // ~10/sec with safety margin

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Send emails in batches of 10 with a ~1s delay between batches
 * to stay within Resend's rate limit (10 emails/sec).
 */
export async function sendBulkEmails(emails: BulkEmailItem[]) {
  const results: Array<{
    to: string
    messageId?: string
    error?: string
  }> = []

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE)

    const batchResults = await Promise.allSettled(
      batch.map((email) => sendEmail(email))
    )

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j]
      const email = batch[j]

      if (result.status === 'fulfilled') {
        results.push({
          to: email.to,
          messageId: result.value?.id,
        })
      } else {
        results.push({
          to: email.to,
          error:
            result.reason instanceof Error
              ? result.reason.message
              : 'Unknown error',
        })
      }
    }

    // Rate limit: wait before next batch (skip if last batch)
    if (i + BATCH_SIZE < emails.length) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  return {
    total: emails.length,
    sent: results.filter((r) => r.messageId).length,
    failed: results.filter((r) => r.error).length,
    results,
  }
}

// ─── Tracking Injection ─────────────────────────────────────────────────────

/**
 * Injects click tracking and open tracking into HTML email content.
 *
 * - Rewrites all <a href="..."> links through /api/track/click
 * - Appends a 1x1 transparent tracking pixel for open tracking
 */
export function injectTracking(
  html: string,
  campaignId: string,
  contactId: string,
  baseUrl: string
): string {
  // Rewrite all <a href="..."> links for click tracking
  // Matches href="..." in anchor tags, skoring mailto: and # links
  const trackedHtml = html.replace(
    /<a\s([^>]*?)href=["']([^"'#][^"']*)["']([^>]*?)>/gi,
    (match, before, url, after) => {
      // Skip mailto:, tel:, and anchor links
      if (/^(mailto:|tel:|#)/i.test(url)) {
        return match
      }

      const trackUrl = `${baseUrl}/api/track/click?` +
        `cid=${encodeURIComponent(campaignId)}` +
        `&ctid=${encodeURIComponent(contactId)}` +
        `&url=${encodeURIComponent(url)}`

      return `<a ${before}href="${trackUrl}"${after}>`
    }
  )

  // Append open tracking pixel before </body> or at the end
  const pixelUrl =
    `${baseUrl}/api/track/open?` +
    `cid=${encodeURIComponent(campaignId)}` +
    `&ctid=${encodeURIComponent(contactId)}`

  const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;border:0;" />`

  if (trackedHtml.includes('</body>')) {
    return trackedHtml.replace('</body>', `${pixel}</body>`)
  }

  return trackedHtml + pixel
}
