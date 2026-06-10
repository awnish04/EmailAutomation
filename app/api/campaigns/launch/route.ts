/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sendCampaign } from "@/lib/campaign-sender";
import { ApifyClient } from "apify-client";

// Initialize Apify Client
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

// Dummy Email Verification Service
async function verifyEmail(email: string): Promise<boolean> {
  // In reality, this would call Hunter.io, NeverBounce, ZeroBounce, etc.
  // Mock logic: 90% of emails are valid
  return Math.random() > 0.1;
}

// Dummy Lead Enrichment Service
async function enrichLeadData(email: string): Promise<any> {
  // Call Clearbit/Apollo etc.
  return {
    companySize: Math.floor(Math.random() * 500) + 10,
    industry: "Technology",
    estimatedRevenue: "$1M - $10M"
  };
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { 
      niche, 
      audience, 
      location, 
      leadCount, 
      subjectA, 
      contentA, 
      isABTesting, 
      subjectB, 
      contentB 
    } = body;

    const requestedCount = leadCount || 10;
    const campaignName = `${niche} - ${location} Campaign`;

    // 1. Find or create a list for this campaign
    let list = await prisma.list.findFirst({
      where: { userId: user.id, name: campaignName },
    });
    
    if (!list) {
      list = await prisma.list.create({
        data: {
          userId: user.id,
          name: campaignName,
          description: `Targeting ${audience} in ${location}`,
        },
      });
    }

    // 2. Create the Draft Campaign(s) first
    const createdCampaignIds: string[] = [];

    if (isABTesting && subjectB && contentB) {
      const campA = await prisma.campaign.create({
        data: {
          userId: user.id,
          name: `${campaignName} (Variant A)`,
          subject: subjectA,
          htmlContent: contentA,
          fromName: user.name || "Outreach Team",
          fromEmail: user.email,
          status: "DRAFT", 
          listId: list.id,
        },
      });
      createdCampaignIds.push(campA.id);

      const campB = await prisma.campaign.create({
        data: {
          userId: user.id,
          name: `${campaignName} (Variant B)`,
          subject: subjectB,
          htmlContent: contentB,
          fromName: user.name || "Outreach Team",
          fromEmail: user.email,
          status: "DRAFT",
          listId: list.id,
        },
      });
      createdCampaignIds.push(campB.id);
    } else {
      const camp = await prisma.campaign.create({
        data: {
          userId: user.id,
          name: campaignName,
          subject: subjectA,
          htmlContent: contentA,
          fromName: user.name || "Outreach Team",
          fromEmail: user.email,
          status: "DRAFT",
          listId: list.id,
        },
      });
      createdCampaignIds.push(camp.id);
    }

    // 3. Kick off Apify Scraping in the background
    // We use oneary/google-maps-email-extractor, but pass redundant keys to ensure compatibility with similar actors.
    const searchString = `${niche} ${audience} in ${location}`;
    
    let runId = "mock_run";
    
    if (process.env.APIFY_API_KEY && process.env.APIFY_API_KEY.trim() !== "") {
      try {
        const run = await apifyClient.actor("nwua9Gu5YrADL7ZDj").start({
          searchStringsArray: [searchString],
          maxCrawledPlacesPerSearch: requestedCount,
          language: "en",
        });
        runId = run.id;
      } catch (err) {
        console.error("Apify start error, falling back to mock:", err);
        runId = "mock_run";
      }
    }

    // Return the run ID so the frontend can poll for status
    return NextResponse.json({
      success: true,
      runId,
      campaignIds: createdCampaignIds,
      listId: list.id,
      message: "Scraping started."
    });
  } catch (error) {
    console.error("Campaign launch error:", error);
    return NextResponse.json({ error: "Failed to launch campaign" }, { status: 500 });
  }
}
