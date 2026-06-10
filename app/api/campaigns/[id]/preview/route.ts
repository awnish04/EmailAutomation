import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: id,
        userId: user.id,
      },
      select: {
        subject: true,
        htmlContent: true,
        fromName: true,
        fromEmail: true,
        createdAt: true,
      },
    })

    if (!campaign) {
      return new NextResponse("Campaign not found", { status: 404 })
    }

    // Replace line breaks with <br> tags if it's plain text
    const formattedContent = campaign.htmlContent.replace(/\n/g, "<br />")

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${campaign.subject}</title>
  <style>
    :root {
      --bg-color: #f3f4f6;
      --card-bg: #ffffff;
      --border-color: #e5e7eb;
      --text-main: #111827;
      --text-muted: #6b7280;
      --accent: #10b981; /* Emerald-500 */
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #111827;
        --card-bg: #1f2937;
        --border-color: #374151;
        --text-main: #f9fafb;
        --text-muted: #9ca3af;
        --accent: #10b981;
      }
    }

    body {
      margin: 0;
      padding: 0;
      background-color: var(--bg-color);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: var(--text-main);
      display: flex;
      justify-content: center;
      min-height: 100vh;
      padding: 40px 20px;
      box-sizing: border-box;
    }

    .email-container {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      width: 100%;
      max-width: 700px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .email-header {
      padding: 24px 32px;
      border-bottom: 1px solid var(--border-color);
    }

    .subject {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 16px 0;
      color: var(--text-main);
      line-height: 1.3;
    }

    .meta-flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .sender-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }

    .sender-details {
      display: flex;
      flex-direction: column;
    }

    .from-name {
      font-weight: 600;
      font-size: 15px;
    }

    .from-email {
      font-size: 13px;
      color: var(--text-muted);
    }

    .date-sent {
      font-size: 13px;
      color: var(--text-muted);
    }

    .email-body {
      padding: 32px;
      font-size: 15px;
      line-height: 1.6;
      color: var(--text-main);
      white-space: pre-wrap;
    }

    .preview-badge {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--accent);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
      70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
  </style>
</head>
<body>

  <div class="email-container">
    <div class="email-header">
      <h1 class="subject">${campaign.subject || "No Subject"}</h1>
      
      <div class="meta-flex">
        <div class="sender-info">
          <div class="avatar">${(campaign.fromName || "?")[0].toUpperCase()}</div>
          <div class="sender-details">
            <span class="from-name">${campaign.fromName || "Unknown Sender"}</span>
            <span class="from-email">&lt;${campaign.fromEmail || "no-reply@example.com"}&gt;</span>
          </div>
        </div>
        <div class="date-sent">
          ${new Date(campaign.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>

    <div class="email-body">
      ${formattedContent}
    </div>
  </div>

  <div class="preview-badge">
    <div class="dot"></div>
    Live Preview Mode
  </div>

</body>
</html>
    `;

    return new NextResponse(htmlTemplate, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("[CAMPAIGN_PREVIEW]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

