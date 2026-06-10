import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { niche, audience, location, agentName } = await req.json();

    if (!niche || !audience || !location) {
      return NextResponse.json(
        { error: "Niche, audience, and location are required." },
        { status: 400 }
      );
    }

    // Derive the sender's first name from their Clerk profile
    const senderFirstName = user.name?.split(" ")[0] || "Alex";
    const senderFullName = user.name || "Alex Johnson";
    const agentContext = agentName || "Marketing";

    // Determine tone based on agent type
    const isJob = agentContext.toLowerCase().includes("job");
    const isRealEstate = agentContext.toLowerCase().includes("real estate");

    const agentToneGuide = isJob
      ? `This is a JOB APPLICATION email. The sender is ${senderFirstName} and they are reaching out to a hiring manager or recruiter at a company. The email should feel like a genuine, well-crafted job application cover letter, not a sales pitch. Reference real skills, express genuine interest, and ask for a call to discuss how they can add value to the team.`
      : isRealEstate
      ? `This is a REAL ESTATE OUTREACH email. The sender is ${senderFirstName} and they are reaching out to a property manager or landlord. The email should feel like a professional inquiry about a property partnership or listing opportunity. Keep it concise and professional.`
      : `This is a B2B OUTREACH email. The sender is ${senderFirstName} and they are reaching out to offer their services in the ${niche} space. The email should feel like a warm, genuine first touchpoint — not spammy or templated. Reference a specific pain point the recipient likely faces.`;

    const prompt = `You are a world-class cold email copywriter who specializes in writing emails that feel genuinely human and get replies.

Write ONE highly personalized cold email from ${senderFullName} targeting ${audience} in the ${niche} industry, located in ${location}.

${agentToneGuide}

CRITICAL RULES:
- The email MUST feel like it was written by a real human, not a template
- Use {{firstName}} at the start for the recipient's first name
- Sign off with the sender's actual name: ${senderFullName}
- Keep the body to 3-4 short paragraphs max. Short sentences. White space. Easy to read on mobile.
- The subject line should be specific and curiosity-driving — avoid generic phrases like "Quick question" or "Following up"
- Do NOT use buzzwords like "leverage", "synergy", "game-changer", "world-class"
- Do NOT include placeholder text like [your name] or [company name] — use the actual values provided
- The email should end with ONE clear, low-friction call to action (e.g., "Would it make sense to hop on a 15-min call this week?")
- Include a natural, professional sign-off with ${senderFirstName}'s name

Respond ONLY with a valid JSON object (no markdown, no code blocks):
{
  "subjectA": "Specific, compelling subject line",
  "contentA": "Hi,\\n\\nFull email body here...\\n\\nBest,\\n${senderFullName}"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional B2B cold email copywriter. You write emails that sound human, get replies, and never sound like mass marketing. You always reply with valid raw JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    const json = JSON.parse(responseContent);

    return NextResponse.json(json);
  } catch (error) {
    console.error("Error generating AI email:", error);
    return NextResponse.json(
      { error: "Failed to generate email content." },
      { status: 500 }
    );
  }
}
