# AI Agent Marketing System - Complete Guide

## System Overview

In this system, the AI chatbot converses with users to automatically create and execute marketing campaigns.

## How It Works

### 1. User Flow

```
User clicks "New Campaign"
    ↓
AI Chatbot starts conversation
    ↓
Asks: "What type of marketing?"
    ↓
User: "Lead generation for SaaS founders"
    ↓
AI: "Great! What location?"
    ↓
User: "USA"
    ↓
AI: "What industry?"
    ↓
User: "Technology"
    ↓
AI shows summary and asks for confirmation
    ↓
User: "Yes, start!"
    ↓
AI Agent starts working automatically
    ↓
User sees real-time progress in dashboard
```

### 2. AI Agent Workflow

```
IDLE → ANALYZING → FINDING_LEADS → GENERATING_EMAILS → SENDING → COMPLETED
```

**Status Meanings:**
- **IDLE**: Agent not started yet
- **ANALYZING**: Understanding requirements
- **FINDING_LEADS**: Searching for potential customers
- **GENERATING_EMAILS**: Creating personalized messages
- **SENDING**: Sending emails to leads
- **COMPLETED**: Campaign finished
- **ERROR**: Something went wrong

### 3. Database Schema

**Campaign Table (Updated):**
```typescript
{
  id: string
  name: string
  status: CampaignStatus
  
  // AI Agent Fields
  agentType: string          // "lead_generation", "email_outreach", etc.
  targetAudience: string     // "SaaS founders"
  location: string           // "USA"
  industry: string           // "Technology"
  agentStatus: AgentStatus   // Current agent status
  chatHistory: Json          // Conversation history
  isConfirmed: boolean       // User confirmed?
  leadsFound: number         // How many leads found
  
  // Stats
  totalSent: number
  totalOpened: number
  totalClicked: number
  totalReplied: number
}
```

**AgentLog Table (New):**
```typescript
{
  id: string
  campaignId: string
  action: string      // "started", "found_leads", "sent_email", etc.
  message: string     // Human-readable message
  data: Json          // Additional data
  createdAt: DateTime
}
```

## Features Implemented

### 1. AI Chatbot (`/dashboard/new-campaign`)
- Conversational interface
- Step-by-step data collection
- Real-time responses
- Confirmation before starting

### 2. Chat API (`/api/chat/campaign`)
- Processes user messages
- Extracts campaign data
- Guides conversation flow
- Returns appropriate responses

### 3. Campaign Creation API (`/api/campaigns/create`)
- Creates campaign in database
- Starts AI agent automatically
- Logs all actions
- Updates status in real-time

### 4. Agent Simulation
- Finds leads (simulated)
- Generates emails (simulated)
- Sends emails (simulated)
- Updates progress in real-time

## Pages & Routes

### Frontend Pages:
- `/dashboard` - Main dashboard with active agents
- `/dashboard/new-campaign` - AI chatbot for creating campaigns

### API Routes:
- `POST /api/chat/campaign` - Chat with AI
- `POST /api/campaigns/create` - Create campaign
- `GET /api/campaigns` - List campaigns (to be created)
- `GET /api/campaigns/[id]` - Get campaign details (to be created)
- `GET /api/campaigns/[id]/logs` - Get agent logs (to be created)

## Next Steps to Complete

### 1. Update Dashboard
Add real campaign data:
```typescript
// Fetch real campaigns from database
const campaigns = await prisma.campaign.findMany({
  where: { userId: user.id },
  include: { agentLogs: true },
  orderBy: { createdAt: 'desc' }
})
```

### 2. Create Campaign Detail Page
Show agent progress:
- Real-time status updates
- Agent logs timeline
- Leads found
- Emails sent
- Performance metrics

### 3. Add Real Lead Finding
Integrate with:
- Apollo.io API
- Hunter.io API
- LinkedIn Sales Navigator
- Custom scraping

### 4. Add Real Email Sending
Integrate with:
- Resend
- SendGrid
- AWS SES
- Custom SMTP

### 5. Add OpenAI Integration
For better AI responses:
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: messages
})
```

## Environment Variables Needed

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx
CLERK_SECRET_KEY=xxx

# Database
DATABASE_URL=xxx

# OpenAI (for better AI)
OPENAI_API_KEY=xxx

# Email Service (choose one)
RESEND_API_KEY=xxx
# or
SENDGRID_API_KEY=xxx

# Lead Finding (choose one)
APOLLO_API_KEY=xxx
# or
HUNTER_API_KEY=xxx
```

## Testing the System

### 1. Start Development Server:
```bash
npm run dev
```

### 2. Create Campaign:
1. Go to http://localhost:3000/dashboard
2. Click "New Campaign" button
3. Chat with AI:
   - "I want to do lead generation"
   - "SaaS founders"
   - "USA"
   - "Technology"
4. Confirm and watch agent work

### 3. View Progress:
- Dashboard shows active agents
- Click on campaign to see details
- Watch real-time status updates

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │ New Campaign │  │   Campaign   │ │
│  │              │  │   (Chatbot)  │  │    Detail    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      API Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Chat API    │  │ Campaign API │  │  Agent API   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   AI Agent System                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Lead Finder  │  │Email Generator│  │Email Sender  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Database (Neon)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Campaigns   │  │    Leads     │  │ Agent Logs   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Current Status

✅ Database schema updated
✅ AI chatbot interface created
✅ Chat API implemented
✅ Campaign creation API implemented
✅ Agent simulation working
✅ Real-time status updates

⏳ To Do:
- Update dashboard with real data
- Create campaign detail page
- Add real lead finding integration
- Add real email sending integration
- Add OpenAI for better AI responses

## Files Created

1. `prisma/schema.prisma` - Updated with AI agent fields
2. `app/(dashboard)/dashboard/new-campaign/page.tsx` - Chatbot UI
3. `app/api/chat/campaign/route.ts` - Chat API
4. `app/api/campaigns/create/route.ts` - Campaign creation API
5. `AI_AGENT_SYSTEM.md` - This documentation

## How to Continue Development

1. **Add OpenAI API Key** to `.env.local`
2. **Update Dashboard** to show real campaigns
3. **Create Campaign Detail Page** for tracking
4. **Integrate Real APIs** for lead finding and email sending
5. **Add Background Jobs** using Inngest or Bull Queue

---

**System is ready for testing!** 
Visit `/dashboard/new-campaign` to start creating campaigns with AI.
