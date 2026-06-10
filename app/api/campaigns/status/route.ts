/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"
import { sendCampaign } from "@/lib/campaign-sender"
import { ApifyClient } from "apify-client"

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_KEY,
})

// ─── Email extraction helpers ─────────────────────────────────────────────────

const EMAIL_REGEX = /([a-zA-Z0-9._+%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g

// Domains we know are not real business emails
const JUNK_DOMAINS = new Set([
  "sentry.io",
  "wixpress.com",
  "example.com",
  "test.com",
  "wordpress.com",
  "squarespace.com",
  "shopify.com",
  "amazonaws.com",
  "cloudfront.net",
  "google.com",
  "googleapis.com",
  "gstatic.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "linkedin.com",
])

function extractEmailsFromText(text: string): string[] {
  const matches = text.match(EMAIL_REGEX) ?? []
  return matches.filter((email) => {
    const parts = email.toLowerCase().split("@")
    if (parts.length !== 2) return false
    const domain = parts[1]
    // Skip image extensions, junk domains, and obvious non-emails
    if (domain.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js)$/)) return false
    if (JUNK_DOMAINS.has(domain)) return false
    // Must look like a real domain
    return domain.includes(".") && !domain.startsWith(".")
  })
}

// Scrape a single website for emails with a timeout
async function scrapeEmailsFromWebsite(url: string): Promise<string[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; EmailBot/1.0)" },
    })
    clearTimeout(timeout)
    if (!res.ok) return []
    const html = await res.text()
    return extractEmailsFromText(html)
  } catch {
    return []
  }
}

// Extract emails from an Apify result item (tries multiple fields)
function extractEmailsFromItem(item: Record<string, unknown>): string[] {
  const emails: string[] = []

  // Direct fields
  if (typeof item.email === "string") emails.push(item.email)
  if (Array.isArray(item.emails)) {
    item.emails.forEach((e) => typeof e === "string" && emails.push(e))
  }
  if (typeof item.contactEmail === "string") emails.push(item.contactEmail)

  // Regex on full JSON as last resort
  if (emails.length === 0) {
    emails.push(...extractEmailsFromText(JSON.stringify(item)))
  }

  return [...new Set(emails)] // deduplicate
}

// ─── Upsert a contact and link to list ───────────────────────────────────────

async function upsertContact(
  userId: string,
  listId: string,
  email: string,
  name: string,
  metadata: Record<string, unknown>
): Promise<string | null> {
  if (!email.includes("@")) return null
  try {
    const contact = await prisma.contact.upsert({
      where: { userId_email: { userId, email } },
      update: {},
      create: {
        userId,
        email,
        firstName: name,
        source: "Google Maps Scraper",
        tags: ["Google Maps", "Apify"],
        metadata: metadata as any,
        leadScore: 80,
      },
    })
    await prisma.contactList.upsert({
      where: { contactId_listId: { contactId: contact.id, listId } },
      update: {},
      create: { contactId: contact.id, listId },
    })
    return contact.id
  } catch {
    return null
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(req.url)
    const runId = searchParams.get("runId")
    const listId = searchParams.get("listId")
    const campaignIdsParam = searchParams.get("campaignIds")

    if (!runId || !listId || !campaignIdsParam) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const campaignIds = campaignIdsParam.split(",")

    // ── MOCK RUN (no Apify key or dev testing) ────────────────────────────
    if (runId === "mock_run") {
      const list = await prisma.list.findUnique({ where: { id: listId } })
      const niche = list?.name.split(" - ")[0] ?? "business"
      const cleanNiche = niche.replace(/[^a-zA-Z]/g, "").toLowerCase()

      const mockEmails = [
        `hello@${cleanNiche}-company.com`,
        `info@${cleanNiche}-services.com`,
        `contact@${cleanNiche}-solutions.com`,
        `sales@${cleanNiche}-group.com`,
        `team@${cleanNiche}-agency.com`,
      ]

      const contactIds: string[] = []
      for (let i = 0; i < mockEmails.length; i++) {
        const id = await upsertContact(
          user.id,
          listId,
          mockEmails[i],
          `Mock Business ${i + 1}`,
          { source: "mock" }
        )
        if (id) contactIds.push(id)
      }

      for (const campId of campaignIds) {
        for (const cid of contactIds) {
          const exists = await prisma.campaignContact.findFirst({
            where: { campaignId: campId, contactId: cid },
          })
          if (!exists) {
            await prisma.campaignContact.create({
              data: { campaignId: campId, contactId: cid },
            })
          }
        }
        const camp = await prisma.campaign.findUnique({ where: { id: campId } })
        if (camp && (camp.status === "DRAFT" || camp.status === "SCHEDULED")) {
          await sendCampaign(campId, user.id).catch(console.error)
        }
      }

      return NextResponse.json({
        status: "SUCCEEDED",
        stats: {
          totalGenerated: mockEmails.length,
          validVerified: contactIds.length,
        },
      })
    }

    // ── REAL APIFY RUN ────────────────────────────────────────────────────
    const run = await apifyClient.run(runId).get()
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 })
    }

    // Still running — return live preview of leads found so far
    if (run.status !== "SUCCEEDED") {
      let liveLeads: unknown[] = []
      try {
        const dataset = await apifyClient
          .dataset(run.defaultDatasetId)
          .listItems()
        liveLeads = dataset.items.slice(0, 50).map((item) => ({
          company: item.title ?? item.name ?? item.companyName ?? "Unknown",
          email:
            extractEmailsFromItem(item as Record<string, unknown>)[0] ?? null,
          phone: item.phone ?? item.phoneUnformatted ?? null,
          address: item.address ?? item.street ?? null,
          website: item.website ?? null,
          rating: item.totalScore ?? item.rating ?? null,
          reviewCount: item.reviewsCount ?? null,
        }))
      } catch {
        // Dataset may not exist yet at start of run
      }
      return NextResponse.json({ status: run.status, liveLeads })
    }

    // ── SCRAPING COMPLETE — process results ───────────────────────────────
    const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems()
    const items = dataset.items as Record<string, unknown>[]

    // Step 1: Extract emails already present in the dataset
    const directContacts: Array<{
      email: string
      name: string
      meta: Record<string, unknown>
    }> = []
    const websiteItems: Array<{
      website: string
      name: string
      meta: Record<string, unknown>
    }> = []

    for (const item of items) {
      const name = String(
        item.title ?? item.name ?? item.companyName ?? "Unknown Business"
      )
      const emails = extractEmailsFromItem(item)

      if (emails.length > 0) {
        emails.forEach((email) =>
          directContacts.push({ email, name, meta: item })
        )
      } else if (item.website && typeof item.website === "string") {
        // No email in listing — queue website for scraping
        websiteItems.push({ website: item.website, name, meta: item })
      }
    }

    // Step 2: Parallel website scraping (batches of 10 to avoid overloading)
    const BATCH = 10
    for (let i = 0; i < websiteItems.length; i += BATCH) {
      const batch = websiteItems.slice(i, i + BATCH)
      const results = await Promise.allSettled(
        batch.map(({ website }) => scrapeEmailsFromWebsite(website))
      )
      results.forEach((result, idx) => {
        if (result.status === "fulfilled" && result.value.length > 0) {
          result.value.forEach((email) =>
            directContacts.push({
              email,
              name: batch[idx].name,
              meta: batch[idx].meta,
            })
          )
        }
      })
    }

    // Step 3: Deduplicate and save
    const seenEmails = new Set<string>()
    const contactIds: string[] = []

    for (const { email, name, meta } of directContacts) {
      const normalised = email.toLowerCase().trim()
      if (seenEmails.has(normalised)) continue
      seenEmails.add(normalised)

      const id = await upsertContact(user.id, listId, normalised, name, meta)
      if (id) contactIds.push(id)
    }

    // If no emails found at all — return without sending (don't spam test addresses)
    if (contactIds.length === 0) {
      console.warn(
        `[Scraper] No emails found for run ${runId}. Campaign not sent.`
      )
      // Mark campaigns as CANCELLED so dashboard doesn't show them stuck in DRAFT
      for (const campId of campaignIds) {
        await prisma.campaign
          .update({
            where: { id: campId },
            data: { status: "CANCELLED" },
          })
          .catch(console.error)
      }
      return NextResponse.json({
        status: "SUCCEEDED",
        stats: { totalGenerated: items.length, validVerified: 0 },
        warning:
          "No emails could be found for the scraped businesses. Try a different niche or location.",
      })
    }

    // Step 4: Link contacts to campaigns and send
    for (const campId of campaignIds) {
      for (const cid of contactIds) {
        const exists = await prisma.campaignContact.findFirst({
          where: { campaignId: campId, contactId: cid },
        })
        if (!exists) {
          await prisma.campaignContact.create({
            data: { campaignId: campId, contactId: cid },
          })
        }
      }

      const camp = await prisma.campaign.findUnique({ where: { id: campId } })
      if (camp && (camp.status === "DRAFT" || camp.status === "SCHEDULED")) {
        await sendCampaign(campId, user.id).catch((e) =>
          console.error(`Failed to send campaign ${campId}:`, e)
        )
      }
    }

    return NextResponse.json({
      status: "SUCCEEDED",
      stats: {
        totalGenerated: items.length,
        validVerified: contactIds.length,
      },
    })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    )
  }
}
