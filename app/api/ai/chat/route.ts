import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Determine the AI system prompt based on agent name/description
function buildSystemPrompt(agentName: string, agentDescription: string | null): string {
  const name = agentName.toLowerCase();
  const desc = (agentDescription || "").toLowerCase();

  // Job Application Agent
  if (name.includes("job") || desc.includes("job") || name.includes("apply") || desc.includes("apply")) {
    return `You are an AI job application assistant embedded in the "${agentName}" agent. 
Your role is to help the user:
- Find job postings that match their skills
- Write tailored cover letters and cold emails to recruiters/hiring managers
- Craft a compelling subject line and email body for outreach
- Suggest improvements to their pitch
- Prepare a campaign by generating the email content and suggesting search terms for scraping

When the user is ready to launch, you should output a JSON config (only when asked) in this format:
{ "action": "launch_campaign", "niche": "...", "audience": "Recruiters / Hiring Managers", "location": "...", "subject": "...", "body": "..." }

Be concise, friendly, and actionable.`;
  }

  // Real Estate Agent
  if (name.includes("real estate") || desc.includes("real estate") || name.includes("property") || desc.includes("property")) {
    return `You are an AI real estate outreach assistant embedded in the "${agentName}" agent.
Your role is to help the user:
- Find real estate agents, property managers, or landlords to contact
- Write personalized outreach emails for property listings, rentals, or agent collaborations
- Suggest the best locations and audience types to target
- Generate compelling email campaigns for property outreach

When the user is ready to launch, output a JSON config (only when asked):
{ "action": "launch_campaign", "niche": "...", "audience": "Real Estate Agents / Property Managers", "location": "...", "subject": "...", "body": "..." }

Be professional, data-driven, and concise.`;
  }

  // E-commerce Agent
  if (name.includes("ecommerce") || name.includes("e-commerce") || name.includes("store") || desc.includes("store owner") || desc.includes("ecommerce")) {
    return `You are an AI e-commerce outreach assistant embedded in the "${agentName}" agent.
Your role is to help the user:
- Find e-commerce store owners, dropshippers, or retail businesses to contact
- Write supplier outreach, partnership, or product promotion emails
- Craft campaigns for Shopify store owners, Amazon sellers, or local retailers

When the user is ready to launch, output a JSON config (only when asked):
{ "action": "launch_campaign", "niche": "...", "audience": "E-commerce Store Owners", "location": "...", "subject": "...", "body": "..." }

Be energetic, ROI-focused, and direct.`;
  }

  // Marketing / Default Agent
  return `You are an AI marketing assistant embedded in the "${agentName}" agent.
Your role is to help the user:
- Define their ideal customer profile (niche, location, audience)
- Write cold email campaigns that convert
- Generate A/B test variants for email subjects and bodies
- Suggest outreach strategies and lead generation approaches
- Launch email campaigns by providing the right configuration

When the user is ready to launch, output a JSON config (only when asked):
{ "action": "launch_campaign", "niche": "...", "audience": "...", "location": "...", "subject": "...", "body": "..." }

Be strategic, creative, and persuasive. Always personalize suggestions based on what the user tells you about their business.`;
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const { messages, agentId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Fetch agent details for context
    let agentName = "Marketing Agent";
    let agentDescription: string | null = null;
    if (agentId && agentId !== "default") {
      try {
        const agent = await prisma.agent.findUnique({ where: { id: agentId } });
        if (agent) {
          agentName = agent.name;
          agentDescription = agent.description;
        }
      } catch (_) {}
    }

    const systemPrompt = buildSystemPrompt(agentName, agentDescription);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.75,
      max_tokens: 800,
    });

    const reply = response.choices[0].message.content;

    // Check if the reply contains a launch_campaign action
    let launchConfig = null;
    if (reply) {
      const jsonMatch = reply.match(/\{[\s\S]*"action"\s*:\s*"launch_campaign"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          launchConfig = JSON.parse(jsonMatch[0]);
        } catch (_) {}
      }
    }

    return NextResponse.json({ reply, launchConfig });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
