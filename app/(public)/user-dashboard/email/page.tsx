import { Suspense } from "react"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EmailClient } from "@/components/user-dashboard/email-client"

export const dynamic = "force-dynamic"

async function EmailData() {
  const user = await requireUser()

  const [campaigns, templates] = await Promise.all([
    prisma.campaign.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        subject: true,
        status: true,
        totalSent: true,
        totalOpened: true,
        totalClicked: true,
        createdAt: true,
        sentAt: true,
      },
    }),
    prisma.emailTemplate.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        subject: true,
        htmlContent: true,
        updatedAt: true,
      },
    }),
  ])

  // Serialize dates
  const serializedCampaigns = campaigns.map(
    (c: (typeof campaigns)[number]) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      sentAt: c.sentAt?.toISOString() || null,
    })
  )

  const serializedTemplates = templates.map(
    (t: (typeof templates)[number]) => ({
      ...t,
      updatedAt: t.updatedAt.toISOString(),
    })
  )

  return (
    <EmailClient
      initialCampaigns={serializedCampaigns}
      initialTemplates={serializedTemplates}
    />
  )
}

export default function EmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      }
    >
      <EmailData />
    </Suspense>
  )
}
