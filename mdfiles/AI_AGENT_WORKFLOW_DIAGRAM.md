# 🎯 AI Marketing Agent - Complete Workflow Diagram

## Your AI Agent's Complete Structure and Workflow

---

## 📊 FULL SYSTEM OVERVIEW (At a Glance)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    🧠 AI MARKETING AGENT SYSTEM                             │
│                                                                             │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────┐ │
│  │  USER   │───▶│ CHATBOT  │───▶│  AGENTS  │───▶│  EMAIL   │───▶│TRACK │ │
│  │(Dashboard)│  │(AI Chat) │    │(4 Agents)│    │ (Resend) │    │(Stats)│ │
│  └─────────┘    └──────────┘    └──────────┘    └──────────┘    └──────┘ │
│       ▲                              │                              │      │
│       │                              ▼                              │      │
│       │                        ┌──────────┐                         │      │
│       └────────────────────────│ DATABASE │◀────────────────────────┘      │
│                                │(Postgres)│                                 │
│                                └──────────┘                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 STEP-BY-STEP WORKFLOW (How It Works)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║  STEP 1: USER TALKS TO CHATBOT                                            ║
║  ════════════════════════════════════════                                   ║
║                                                                            ║
║  User: "I'm Mijash from ArticleCraft.org.                                 ║
║         I want to email 100 companies in USA from LinkedIn"                ║
║                                                                            ║
║         ┌─────────────────────────────────────┐                            ║
║         │         CHATBOT (AI)                │                            ║
║         │                                     │                            ║
║         │  • OpenAI GPT-4o-mini powered       │                            ║
║         │  • Natural language understanding   │                            ║
║         │  • English language support         │                            ║
║         │  • Asks for missing info            │                            ║
║         │  • Confirms before executing        │                            ║
║         └─────────────────────────────────────┘                            ║
║                          │                                                 ║
║                          ▼                                                 ║
║         ┌─────────────────────────────────────┐                            ║
║         │      EXTRACTED CAMPAIGN INFO        │                            ║
║         │                                     │                            ║
║         │  userName: "Mijash"                 │                            ║
║         │  userCompany: "ArticleCraft.org"    │                            ║
║         │  targetAudience: "Companies"        │                            ║
║         │  country: "United States"           │                            ║
║         │  emailCount: 100                    │                            ║
║         │  channel: "LinkedIn"                │                            ║
║         └─────────────────────────────────────┘                            ║
║                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```


```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║  STEP 2: CAMPAIGN IS CREATED IN DATABASE                                   ║
║  ═══════════════════════════════════════════                                ║
║                                                                            ║
║  User clicks "Yes, Start!"                                                 ║
║         │                                                                  ║
║         ▼                                                                  ║
║  ┌─────────────────────────────────────────────────────────┐               ║
║  │                  API ROUTE                              │               ║
║  │           /api/chat/agent/route.ts                      │               ║
║  │                                                         │               ║
║  │  1. ✅ Clerk Authentication check                       │               ║
║  │  2. ✅ Create/find User in Database                    │               ║
║  │  3. ✅ Campaign create (status: ACTIVE)                 │               ║
║  │  4. ✅ AgentLog create (action: "started")              │               ║
║  │  5. ✅ Lead Finder Agent START (background)             │               ║
║  │  6. ✅ Response return to user                          │               ║
║  └─────────────────────────────────────────────────────────┘               ║
║                          │                                                 ║
║                          ▼                                                 ║
║  ┌─────────────────────────────────────────────────────────┐               ║
║  │              DATABASE (Neon PostgreSQL)                  │               ║
║  │                                                         │               ║
║  │  Campaign {                                             │               ║
║  │    name: "ArticleCraft → Companies in USA"              │               ║
║  │    status: "ACTIVE"                                     │               ║
║  │    agentStatus: "FINDING_LEADS"                         │               ║
║  │    targetAudience: "Companies"                          │               ║
║  │    location: "United States"                            │               ║
║  │  }                                                      │               ║
║  └─────────────────────────────────────────────────────────┘               ║
║                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```


```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║  STEP 3: LEAD FINDER AGENT SCRAPES DATA FROM APIFY                        ║
║  ═══════════════════════════════════════════════════════════                 ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────┐          ║
║  │                 LEAD FINDER AGENT                            │          ║
║  │              lib/agents/lead-finder.ts                       │          ║
║  │                                                              │          ║
║  │  Input:                                                      │          ║
║  │  • targetAudience: "Companies"                               │          ║
║  │  • location: "USA"                                           │          ║
║  │  • leadCount: 100                                            │          ║
║  │  • industry: "Technology"                                    │          ║
║  │                                                              │          ║
║  │  Process:                                                    │          ║
║  │  ┌────────────────────────────────────────────────────┐     │          ║
║  │  │  1. 🔍 Build Search Query:                         │     │          ║
║  │  │     "Companies in USA Technology                    │     │          ║
║  │  │      decision maker OR owner OR founder"            │     │          ║
║  │  │                                                     │     │          ║
║  │  │  2. 📡 Call Apify LinkedIn Scraper                  │     │          ║
║  │  │     → apify/linkedin-profile-scraper                │     │          ║
║  │  │     → Scrapes: name, email, company, title          │     │          ║
║  │  │                                                     │     │          ║
║  │  │  3. 📧 Email Construction (if missing):             │     │          ║
║  │  │     → ram.sharma@company.com                        │     │          ║
║  │  │     → ram@company.com                               │     │          ║
║  │  │     → ramsharma@company.com                         │     │          ║
║  │  │                                                     │     │          ║
║  │  │  4. 🔄 Backup: Google Search (if not enough)        │     │          ║
║  │  │     → apify/google-search-scraper                   │     │          ║
║  │  │                                                     │     │          ║
║  │  │  5. ✅ Verify Emails                                │     │          ║
║  │  │                                                     │     │          ║
║  │  │  6. 💾 Save to Database                             │     │          ║
║  │  │                                                     │     │          ║
║  │  │  7. 🤖 AI Enrichment (remarks generate)            │     │          ║
║  │  └────────────────────────────────────────────────────┘     │          ║
║  └──────────────────────────────────────────────────────────────┘          ║
║                          │                                                 ║
║                          ▼                                                 ║
║  ┌──────────────────────────────────────────────────────────────┐          ║
║  │                    APIFY API                                 │          ║
║  │                                                              │          ║
║  │  ┌─────────────────┐        ┌─────────────────┐            │          ║
║  │  │ LinkedIn Scraper│        │ Google Scraper  │            │          ║
║  │  │                 │        │                 │            │          ║
║  │  │ • Profiles      │        │ • Websites      │            │          ║
║  │  │ • Emails        │        │ • Contact Info  │            │          ║
║  │  │ • Companies     │        │ • Phone Numbers │            │          ║
║  │  │ • Titles        │        │ • Addresses     │            │          ║
║  │  └─────────────────┘        └─────────────────┘            │          ║
║  └──────────────────────────────────────────────────────────────┘          ║
║                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```


```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║  STEP 4: AI GENERATES PERSONALIZED EMAIL AND SENDS                        ║
║  ═══════════════════════════════════════════════════════════                 ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────┐          ║
║  │                 EMAIL SENDER AGENT                           │          ║
║  │                                                              │          ║
║  │  For EACH lead:                                              │          ║
║  │                                                              │          ║
║  │  ┌────────────────────────────────────────────────────┐     │          ║
║  │  │  1. 🤖 OpenAI GPT-4o-mini writes email:             │     │          ║
║  │  │                                                     │     │          ║
║  │  │     Subject: "Quick question about your company"    │     │          ║
║  │  │     Body: Personalized based on:                    │     │          ║
║  │  │       - Lead's company info                         │     │          ║
║  │  │       - Lead's position/role                       │     │          ║
║  │  │       - User's service offering                    │     │          ║
║  │  │       - Industry context                            │     │          ║
║  │  │                                                     │     │          ║
║  │  │  2. 📧 Sends via Resend API:                         │     │          ║
║  │  │     From: username@aiemailmarketing.com             │     │          ║
║  │  │     To: lead@company.com                            │     │          ║
║  │  │     Tracking: ON (open, click, reply)               │     │          ║
║  │  │                                                     │     │          ║
║  │  │  3. 💾 Database Update:                             │     │          ║
║  │  │     Email status: PENDING → SENT                    │     │          ║
║  │  │     Campaign stats: totalSent++                     │     │          ║
║  │  └────────────────────────────────────────────────────┘     │          ║
║  └──────────────────────────────────────────────────────────────┘          ║
║                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```


```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║  STEP 5: REPLY HANDLER PROCESSES REPLIES                                   ║
║  ═══════════════════════════════════════════════                            ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────┐          ║
║  │                 REPLY HANDLER AGENT                          │          ║
║  │              lib/agents/reply-handler.ts                     │          ║
║  │                                                              │          ║
║  │  Lead replies:                                                │          ║
║  │  "Yes, I'm interested! Can we schedule a call?"             │          ║
║  │                                                              │          ║
║  │  ┌────────────────────────────────────────────────────┐     │          ║
║  │  │  1. 📥 Reply receive (Resend webhook)              │     │          ║
║  │  │                                                     │     │          ║
║  │  │  2. 🧠 AI Sentiment Analysis:                       │     │          ║
║  │  │     • "interested" → POSITIVE                       │     │          ║
║  │  │     • "not interested" → NEGATIVE                   │     │          ║
║  │  │     • "maybe later" → NEUTRAL                       │     │          ║
║  │  │                                                     │     │          ║
║  │  │  3. 📊 Lead Score Update:                           │     │          ║
║  │  │     • Positive reply → Score: 80+ (HOT 🔥)         │     │          ║
║  │  │     • Neutral reply → Score: 40-60 (WARM)          │     │          ║
║  │  │     • Negative → Score: 0 (COLD)                   │     │          ║
║  │  │                                                     │     │          ║
║  │  │  4. 📧 Auto Follow-up (if needed):                  │     │          ║
║  │  │     AI generates follow-up email                    │     │          ║
║  │  │     "Great! Here's my calendar link..."             │     │          ║
║  │  │                                                     │     │          ║
║  │  │  5. 💾 Database Update:                             │     │          ║
║  │  │     Lead status: COLD → HOT                         │     │          ║
║  │  │     Campaign: totalReplied++                        │     │          ║
║  │  └────────────────────────────────────────────────────┘     │          ║
║  └──────────────────────────────────────────────────────────────┘          ║
║                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```


```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║  STEP 6: REAL-TIME STATS SHOWN ON DASHBOARD                                ║
║  ═══════════════════════════════════════════════                            ║
║                                                                            ║
║  ┌──────────────────────────────────────────────────────────────┐          ║
║  │                    DASHBOARD UI                              │          ║
║  │                                                              │          ║
║  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │          ║
║  │  │ Leads: 247 │ │ Sent: 189  │ │ Open: 142  │ │Reply: 12 │ │          ║
║  │  │    🎯      │ │    📧      │ │    👁️      │ │   💬     │ │          ║
║  │  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │          ║
║  │                                                              │          ║
║  │  ┌──────────────────────────────────────────────────────┐   │          ║
║  │  │  HOT LEADS 🔥                                        │   │          ║
║  │  │                                                       │   │          ║
║  │  │  • john@company.com    Score: 85  (Replied ✅)       │   │          ║
║  │  │  • sarah@startup.com   Score: 75  (Clicked ✅)       │   │          ║
║  │  │  • mike@business.com   Score: 72  (Opened 3x ✅)    │   │          ║
║  │  └──────────────────────────────────────────────────────┘   │          ║
║  │                                                              │          ║
║  │  ┌──────────────────────────────────────────────────────┐   │          ║
║  │  │  ACTIVITY LOG                                         │   │          ║
║  │  │                                                       │   │          ║
║  │  │  🔍 Finding leads on LinkedIn...                      │   │          ║
║  │  │  ✅ Found 100 leads                                   │   │          ║
║  │  │  ✍️ Writing personalized emails...                    │   │          ║
║  │  │  📧 Sent 50/100 emails                               │   │          ║
║  │  │  💬 New reply from john@company.com                   │   │          ║
║  │  └──────────────────────────────────────────────────────┘   │          ║
║  └──────────────────────────────────────────────────────────────┘          ║
║                                                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---


## 🤖 4 AI AGENTS' ROLES (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         4 AI AGENTS                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AGENT 1: CONVERSATIONAL AGENT (Chatbot)                            │   │
│  │  File: lib/agents/conversational-agent.ts                           │   │
│  │                                                                      │   │
│  │  Role: Talks to user, collects campaign info                          │   │
│  │                                                                      │   │
│  │  States:                                                             │   │
│  │  GREETING → COLLECTING_INFO → CONFIRMING → EXECUTING → MONITORING   │   │
│  │                                                                      │   │
│  │  Features:                                                           │   │
│  │  • OpenAI GPT-4o-mini powered                                       │   │
│  │  • English language support                                          │   │
│  │  • Natural language understanding (regex + AI extraction)            │   │
│  │  • Button options + free-form text both supported                    │   │
│  │  • Missing info automatically requested                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AGENT 2: LEAD FINDER AGENT (Data Scraper)                          │   │
│  │  File: lib/agents/lead-finder.ts                                    │   │
│  │                                                                      │   │
│  │  Role: Scrapes leads from Apify, saves to database                    │   │
│  │                                                                      │   │
│  │  Process:                                                            │   │
│  │  1. Builds smart search query                                       │   │
│  │  2. Calls Apify LinkedIn Scraper                                    │   │
│  │  3. Constructs email (if missing)                                   │   │
│  │  4. Google Search backup (if not enough)                            │   │
│  │  5. Verifies email                                                  │   │
│  │  6. Saves to database                                               │   │
│  │  7. AI enrichment (remarks generate)                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AGENT 3: JOB APPLICATION AGENT (Job Apply)                         │   │
│  │  File: lib/agents/job-application-agent.ts                          │   │
│  │                                                                      │   │
│  │  Role: Finds remote jobs, filters them, applies                       │   │
│  │                                                                      │   │
│  │  Process:                                                            │   │
│  │  1. Scrapes job listings from Apify                                 │   │
│  │  2. AI Filter (GPT-4o-mini):                                        │   │
│  │     ❌ Country mismatch → REJECT                                    │   │
│  │     ❌ Salary too low → REJECT                                      │   │
│  │     ❌ Skills don't match → REJECT                                  │   │
│  │     ❌ Job > 60 days old → REJECT                                   │   │
│  │     ✅ All pass → APPROVE + generate email                          │   │
│  │  3. Generates personalized application email                        │   │
│  │  4. Sends email to company                                          │   │
│  │  5. Saves approved jobs to dashboard                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AGENT 4: REPLY HANDLER AGENT (Auto-Reply)                          │   │
│  │  File: lib/agents/reply-handler.ts                                  │   │
│  │                                                                      │   │
│  │  Role: Monitors replies, analyzes them, sends follow-ups              │   │
│  │                                                                      │   │
│  │  Process:                                                            │   │
│  │  1. Receives reply from Resend webhook                              │   │
│  │  2. Sentiment analysis (positive/negative/neutral)                  │   │
│  │  3. Lead score update (0-100)                                       │   │
│  │  4. Lead status update (COLD → WARM → HOT)                         │   │
│  │  5. Auto follow-up email generate + send                           │   │
│  │  6. Activity log update                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---


## 🗄️ DATABASE STRUCTURE (Tables)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (PostgreSQL + Prisma)                       │
│                                                                             │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐            │
│  │    USERS      │     │  CAMPAIGNS    │     │    LEADS      │            │
│  │               │     │               │     │               │            │
│  │ • id          │────▶│ • id          │     │ • id          │            │
│  │ • clerkId     │     │ • userId      │     │ • userId      │            │
│  │ • email       │     │ • name        │     │ • email       │            │
│  │ • firstName   │     │ • status      │     │ • firstName   │            │
│  │ • lastName    │     │ • agentType   │     │ • company     │            │
│  │ • fromName    │     │ • agentStatus │     │ • position    │            │
│  │ • subdomain   │     │ • target      │     │ • leadScore   │            │
│  │   Username    │     │ • location    │     │ • leadStatus  │            │
│  └───────────────┘     │ • leadsFound  │     │ • aiRemarks   │            │
│                         │ • totalSent   │     │ • tags        │            │
│                         │ • totalOpened │     │ • source      │            │
│                         │ • totalReplied│     └───────────────┘            │
│                         └───────────────┘            │                     │
│                                │                     │                     │
│                                ▼                     ▼                     │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐            │
│  │  AGENT_LOGS   │     │    EMAILS     │     │ EMAIL_REPLIES │            │
│  │               │     │               │     │               │            │
│  │ • id          │     │ • id          │     │ • id          │            │
│  │ • campaignId  │     │ • campaignId  │     │ • emailId     │            │
│  │ • action      │     │ • leadId      │     │ • leadId      │            │
│  │ • message     │     │ • subject     │     │ • fromEmail   │            │
│  │ • data (JSON) │     │ • body        │     │ • body        │            │
│  │ • createdAt   │     │ • status      │     │ • sentiment   │            │
│  └───────────────┘     │ • sentAt      │     │ • interest    │            │
│                         │ • openedAt    │     │   Level       │            │
│                         │ • repliedAt   │     │ • aiSummary   │            │
│                         └───────────────┘     └───────────────┘            │
│                                                                             │
│  ┌───────────────┐                                                         │
│  │CAMPAIGN_LEADS │  (Many-to-Many Junction)                                │
│  │               │                                                         │
│  │ • campaignId  │                                                         │
│  │ • leadId      │                                                         │
│  │ • status      │                                                         │
│  └───────────────┘                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---


## 🛠️ TECH STACK (Which Technology Where)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  FRONTEND (What User Sees)                                          │   │
│  │                                                                      │   │
│  │  • Next.js 14 (App Router)     → Website framework                  │   │
│  │  • React + TypeScript          → UI components                      │   │
│  │  • Tailwind CSS                → Styling                            │   │
│  │  • Clerk                       → Login/Signup (Authentication)      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  BACKEND (Server-side Logic)                                        │   │
│  │                                                                      │   │
│  │  • Next.js API Routes          → /api/chat/agent, /api/campaigns    │   │
│  │  • Prisma ORM                  → Database queries                   │   │
│  │  • OpenAI GPT-4o-mini          → AI text generation                 │   │
│  │  • Vercel Cron Jobs            → Background tasks (every 5 min)     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  EXTERNAL SERVICES (Third-party APIs)                               │   │
│  │                                                                      │   │
│  │  • Apify                       → LinkedIn/Google data scraping      │   │
│  │  • Resend                      → Email sending + tracking           │   │
│  │  • OpenAI                      → AI (email writing, analysis)       │   │
│  │  • Neon                        → PostgreSQL database (cloud)        │   │
│  │  • Vercel                      → Hosting + deployment               │   │
│  │  • Clerk                       → User authentication                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  DATABASE                                                           │   │
│  │                                                                      │   │
│  │  • Neon PostgreSQL (Cloud)     → Main database                      │   │
│  │  • Prisma ORM                  → Type-safe queries                  │   │
│  │  • Connection Pooling          → Performance                        │   │
│  │  • SSL Encryption              → Security                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---


## 📁 FILE STRUCTURE (Which File Does What)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  aiemailmarketing/                                                          │
│  │                                                                          │
│  ├── app/                                                                   │
│  │   ├── (auth)/                    → Login/Signup pages (Clerk)            │
│  │   ├── (dashboard)/                                                       │
│  │   │   └── dashboard/                                                     │
│  │   │       └── page.tsx           → 🖥️ MAIN DASHBOARD (UI)               │
│  │   │                                                                      │
│  │   └── api/                                                               │
│  │       ├── chat/agent/route.ts    → 🤖 CHATBOT API (main entry)          │
│  │       ├── campaigns/             → Campaign CRUD APIs                    │
│  │       ├── leads/                 → Lead management APIs                  │
│  │       ├── webhooks/resend/       → 📧 Email tracking webhooks           │
│  │       └── cron/                  → ⏰ Background jobs (5 min)           │
│  │                                                                          │
│  ├── lib/                                                                   │
│  │   ├── agents/                                                            │
│  │   │   ├── conversational-agent.ts → 💬 CHATBOT AI BRAIN                 │
│  │   │   ├── lead-finder.ts         → 🔍 LEAD SCRAPING AGENT              │
│  │   │   ├── job-application-agent.ts→ 💼 JOB APPLY AGENT                 │
│  │   │   ├── reply-handler.ts       → 📨 REPLY PROCESSING AGENT           │
│  │   │   └── email-sender.ts        → 📧 EMAIL SENDING AGENT              │
│  │   │                                                                      │
│  │   ├── email/                                                             │
│  │   │   └── resend-subdomain.ts    → 📧 Subdomain email creation         │
│  │   │                                                                      │
│  │   ├── apify-service.ts           → 🔗 APIFY API CONNECTION             │
│  │   ├── prisma.ts                  → 🗄️ Database client                   │
│  │   └── ai-lead-enrichment.ts      → 🤖 AI lead remarks                  │
│  │                                                                          │
│  ├── prisma/                                                                │
│  │   └── schema.prisma              → 📋 DATABASE SCHEMA                   │
│  │                                                                          │
│  └── .env.local                     → 🔑 API KEYS (secret)                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---


## 🔄 CORRECT COMPLETE DATA FLOW (A to Z)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  USER                                                                       │
│   │                                                                         │
│   │ "Find 100 real estate agents in USA and email them"                     │
│   │                                                                         │
│   ▼                                                                         │
│  ┌──────────────┐                                                           │
│  │   CHATBOT    │ ──── OpenAI GPT-4o-mini (extract info)                   │
│  │   (AI Chat)  │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                   │
│         │ campaignInfo = { target: "real estate", location: "USA", n: 100 } │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │  API ROUTE   │ ──── Create Campaign in PostgreSQL                       │
│  │  /api/chat   │ ──── Start Lead Finder (background)                      │
│  └──────┬───────┘                                                           │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │ LEAD FINDER AGENT (Apify Scraping)                               │       │
│  │                                                                   │       │
│  │  Detailed data comes from Apify:                                     │       │
│  │  ┌─────────────────────────────────────────────────────────┐     │       │
│  │  │  Lead {                                                  │     │       │
│  │  │    name: "John Smith"                                    │     │       │
│  │  │    email: "john@smithrealty.com"                         │     │       │
│  │  │    phone: "+1 555-123-4567"                              │     │       │
│  │  │    company: "Smith Realty Group"                         │     │       │
│  │  │    position: "CEO & Founder"                             │     │       │
│  │  │    website: "https://smithrealty.com"                    │     │       │
│  │  │    linkedin: "linkedin.com/in/johnsmith"                 │     │       │
│  │  │    location: "New York, NY"                              │     │       │
│  │  │    industry: "Real Estate"                               │     │       │
│  │  │    companySize: "50-200 employees"                       │     │       │
│  │  │    description: "Full-service real estate brokerage..."  │     │       │
│  │  │  }                                                       │     │       │
│  │  └─────────────────────────────────────────────────────────┘     │       │
│  │                                                                   │       │
│  │  → 100 leads with FULL DETAIL saved to database                  │       │
│  │  → Each lead appears directly in LEADS section                       │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         │                                                                   │
│         │ 100 REAL leads with complete data                                 │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │ AI EMAIL WRITER (Per-Company Personalization)                     │       │
│  │                                                                   │       │
│  │  AI analyzes EACH COMPANY's data:                                 │       │
│  │  ┌─────────────────────────────────────────────────────────┐     │       │
│  │  │  Company: "Smith Realty Group"                           │     │       │
│  │  │  Person: "John Smith" (CEO)                              │     │       │
│  │  │  Industry: Real Estate                                   │     │       │
│  │  │  Location: New York                                      │     │       │
│  │  │  Website: smithrealty.com                                │     │       │
│  │  │  Company Size: 50-200                                    │     │       │
│  │  │                                                          │     │       │
│  │  │  AI generates SPECIFIC email:                            │     │       │
│  │  │  "Hi John, I noticed Smith Realty Group is growing       │     │       │
│  │  │   fast in NYC. With 50+ agents, you probably need        │     │       │
│  │  │   better automation for lead management..."              │     │       │
│  │  └─────────────────────────────────────────────────────────┘     │       │
│  │                                                                   │       │
│  │  → EACH email is DIFFERENT (company-specific)                    │       │
│  │  → NOT generic template                                          │       │
│  │  → AI reads company data and writes accordingly                  │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │   RESEND     │ ──── Sends real emails                                   │
│  │   (Email)    │ ──── Tracks: open, click, reply, bounce                  │
│  └──────┬───────┘                                                           │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │ LEADS SECTION (REAL DATA on Dashboard)                                 │       │
│  │                                                                   │       │
│  │  ┌─────────────────────────────────────────────────────────┐     │       │
│  │  │  Lead #1: John Smith                                     │     │       │
│  │  │  Company: Smith Realty Group                              │     │       │
│  │  │  Email: john@smithrealty.com                              │     │       │
│  │  │  Status: REPLIED ✅                                      │     │       │
│  │  │  Score: 85 (HOT 🔥)                                     │     │       │
│  │  │  AI Remarks: "High-value lead. CEO of growing firm..."   │     │       │
│  │  │  Email Sent: "Hi John, I noticed Smith Realty..."         │     │       │
│  │  │  Reply: "Yes interested! Let's schedule a call"          │     │       │
│  │  ├─────────────────────────────────────────────────────────┤     │       │
│  │  │  Lead #2: Sarah Johnson                                  │     │       │
│  │  │  Company: Keller Williams NYC                             │     │       │
│  │  │  Email: sarah@kwnyc.com                                   │     │       │
│  │  │  Status: OPENED 👁️                                      │     │       │
│  │  │  Score: 45 (WARM)                                        │     │       │
│  │  │  AI Remarks: "Mid-level agent, opened 3 times..."        │     │       │
│  │  └─────────────────────────────────────────────────────────┘     │       │
│  │                                                                   │       │
│  │  → ALL DATA IS REAL (from Apify scraping)                        │       │
│  │  → NO FAKE/MOCK DATA                                            │       │
│  │  → Fetched directly from database                                    │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │ DASHBOARD (REAL VALUES from Database)                             │       │
│  │                                                                   │       │
│  │  Stats = prisma.campaign.findMany() → REAL counts                │       │
│  │                                                                   │       │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐     │       │
│  │  │Leads: 100  │ │ Sent: 95   │ │ Open: 47   │ │Reply: 6  │     │       │
│  │  │(DB count)  │ │(DB count)  │ │(DB count)  │ │(DB count)│     │       │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────┘     │       │
│  │                                                                   │       │
│  │  → Numbers come from DATABASE (not hardcoded)                    │       │
│  │  → Updates in real-time as agent works                           │       │
│  │  → Agent running = status "FINDING_LEADS" / "SENDING"           │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │ REPLY HANDLER (Background - 24/7 Running)                         │       │
│  │                                                                   │       │
│  │  • Resend webhook → reply received                                  │       │
│  │  • AI analyzes sentiment                                         │       │
│  │  • Lead score update (COLD → WARM → HOT)                        │       │
│  │  • Auto follow-up send                                           │       │
│  │  • Dashboard stats update                                        │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---


## 💰 MONTHLY COST BREAKDOWN

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONTHLY COSTS (~$89/month)                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Resend (Email)        │  $20/month  │  50,000 emails   │   │
│  │  Vercel (Hosting)      │  $20/month  │  Unlimited       │   │
│  │  Neon (Database)       │  $19/month  │  10 GB           │   │
│  │  OpenAI (AI)           │  $30/month  │  ~1M tokens      │   │
│  │  Apify (Scraping)      │  Free tier  │  Limited credits  │   │
│  │  Clerk (Auth)          │  Free tier  │  10,000 users    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TOTAL: ~$89/month for 10,000 emails                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ KEY POINTS (Important Details)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ✅ CORRECT UNDERSTANDING:                                                  │
│                                                                             │
│  1. DETAILED DATA comes from APIFY:                                          │
│     → Name, Email, Phone, Company, Position, Website, LinkedIn              │
│     → Company description, size, industry                                   │
│     → Location, specialties                                                 │
│     → All this data is saved directly in LEADS section                     │
│                                                                             │
│  2. AI WRITES SPECIFIC EMAIL by analyzing EACH COMPANY's DATA:              │
│     → Not a generic template                                                 │
│     → References company name, person name, industry, size                   │
│     → "Hi John, I noticed Smith Realty is growing in NYC..."               │
│     → Each email is UNIQUE                                                │
│                                                                             │
│  3. LEADS SECTION shows REAL DATA:                                           │
│     → Actual data scraped from Apify                                         │
│     → NO fake/mock/hardcoded data                                          │
│     → Fetched from Database (PostgreSQL)                                   │
│     → prisma.lead.findMany() → real leads                                  │
│                                                                             │
│  4. DASHBOARD shows REAL VALUES:                                             │
│     → Stats = database count (not hardcoded numbers)                       │
│     → prisma.campaign.findUnique() → real stats                            │
│     → Live updates while agent is running                                 │
│     → leadsFound, totalSent, totalOpened, totalReplied = DB values         │
│                                                                             │
│  5. DATABASE PROPERLY CONNECTED:                                            │
│     → Neon PostgreSQL (cloud)                                              │
│     → Prisma ORM (type-safe)                                               │
│     → Agent writes to DB when working                                     │
│     → Dashboard reads from DB                                              │
│     → Real-time sync                                                       │
│                                                                             │
│  6. AGENT RUNNING STATUS:                                                   │
│     → agentStatus: "FINDING_LEADS" (scraping)                              │
│     → agentStatus: "SENDING" (emailing)                                    │
│     → agentStatus: "COMPLETED" (done)                                      │
│     → agentStatus: "ERROR" (failed)                                        │
│     → Live status shown on Dashboard                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 CORRECT FLOW SUMMARY

```
USER → CHATBOT (AI collects info)
         │
         ▼
CAMPAIGN CREATE (Saved in Database)
         │
         ▼
APIFY SCRAPE (LinkedIn/Google → DETAILED data: name, email, company, etc.)
         │
         ▼
DATA → LEADS SECTION (Real data from database)
         │
         ▼
AI READS EACH LEAD'S DATA → WRITES SPECIFIC EMAIL (per company)
         │
         ▼
RESEND SENDS → TRACKS (open/click/reply)
         │
         ▼
DASHBOARD (REAL values from database, agent running status)
         │
         ▼
REPLY HANDLER (auto follow-up, lead scoring)
```

**Key Difference:**
- ❌ Generic email template sent to everyone → WRONG
- ✅ AI analyzes each company's data and writes UNIQUE email → CORRECT
- ❌ Dashboard shows fake numbers → WRONG  
- ✅ Real count fetched from database → CORRECT
- ❌ Leads section has hardcoded data → WRONG
- ✅ Apify scrape → DB save → DB fetch → display → CORRECT

---

**Created**: May 18, 2026  
**System**: AI Email Marketing Agent  
**Status**: ✅ Production Ready
