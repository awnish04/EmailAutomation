# 🎯 Conversational AI System - Visual Flow Diagram

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    /dashboard/chat/page.tsx                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Chat UI    │  │ Dynamic Form │  │ Stats Sidebar│        │
│  │              │  │              │  │              │        │
│  │ • Messages   │  │ • Text Input │  │ • Leads      │        │
│  │ • Typing     │  │ • Numbers    │  │ • Emails     │        │
│  │ • Bubbles    │  │ • Textarea   │  │ • Opens      │        │
│  │ • Loading    │  │ • Validation │  │ • Replies    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ User Message / Form Data
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API ENDPOINT                            │
│                  /api/chat/agent/route.ts                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Authenticate User (Clerk)                                  │
│  2. Get/Create DB User                                         │
│  3. Get Conversational Agent                                   │
│  4. Process Message                                            │
│  5. Return Response                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CONVERSATIONAL AGENT                         │
│              lib/agents/conversational-agent.ts                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              CONVERSATION STATES                      │     │
│  ├──────────────────────────────────────────────────────┤     │
│  │                                                       │     │
│  │  GREETING → UNDERSTANDING → COLLECTING_INFO          │     │
│  │       ↓                                               │     │
│  │  CONFIRMING → EXECUTING → MONITORING                 │     │
│  │                                                       │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │           CORE METHODS                                │     │
│  ├──────────────────────────────────────────────────────┤     │
│  │                                                       │     │
│  │  • chat(message)          - Main entry point         │     │
│  │  • analyzeMessage()       - Extract info             │     │
│  │  • generateResponse()     - OpenAI call              │     │
│  │  • updateCampaignInfo()   - Update state             │     │
│  │  • generateFormFields()   - Create form              │     │
│  │                                                       │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         OPENAI GPT-4                            │
│                    Natural Language AI                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Input: User message + Business context + Conversation history │
│  Output: Natural language response                             │
│                                                                 │
│  • Understands intent                                          │
│  • Generates human-like responses                              │
│  • Maintains conversation context                              │
│  • Asks clarifying questions                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Response
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE PROCESSING                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Message   │  │    State    │  │    Form     │           │
│  │   Content   │  │  Management │  │  Generation │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  If state = EXECUTING:                                         │
│  ┌──────────────────────────────────────────────────┐         │
│  │  1. Create Campaign in Database                  │         │
│  │  2. Log Agent Activity                           │         │
│  │  3. Start Background Jobs                        │         │
│  │  4. Return Campaign ID                           │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ If Campaign Confirmed
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND AGENTS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐        ┌──────────────────────┐     │
│  │   LEAD FINDER        │        │   EMAIL SENDER       │     │
│  │   lead-finder.ts     │        │   email-sender.ts    │     │
│  ├──────────────────────┤        ├──────────────────────┤     │
│  │                      │        │                      │     │
│  │ 1. Search Apify      │        │ 1. Get Leads         │     │
│  │ 2. Scrape Data       │        │ 2. Generate Emails   │     │
│  │ 3. Verify Emails     │        │ 3. Send via Sender   │     │
│  │ 4. Save to DB        │        │ 4. Track Status      │     │
│  │ 5. Update Campaign   │        │ 5. Update Stats      │     │
│  │                      │        │                      │     │
│  └──────────────────────┘        └──────────────────────┘     │
│           ↓                                   ↓                │
│           ↓                                   ↓                │
│  ┌──────────────────────┐        ┌──────────────────────┐     │
│  │   APIFY API          │        │   SENDER API         │     │
│  │   Lead Scraping      │        │   Email Delivery     │     │
│  └──────────────────────┘        └──────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Updates
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
│                    PostgreSQL + Prisma                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Users   │  │Campaigns │  │  Leads   │  │  Emails  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │AgentLogs │  │ Replies  │  │  Stats   │                    │
│  └──────────┘  └──────────┘  └──────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Real-time Updates
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         DASHBOARD                               │
│                   /dashboard/page.tsx                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Campaign    │  │   Metrics    │  │   Activity   │        │
│  │   Status     │  │   Charts     │  │     Log      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  • Leads Found: 247                                            │
│  • Emails Sent: 189                                            │
│  • Opened: 142 (75%)                                           │
│  • Replied: 12 (6%)                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Conversation Flow States

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONVERSATION STATES                          │
└─────────────────────────────────────────────────────────────────┘

1. GREETING
   ├─ User: "Hello"
   └─ AI: Welcome message + capabilities

2. UNDERSTANDING
   ├─ User: "I build websites"
   └─ AI: Acknowledges + asks for target audience

3. COLLECTING_INFO
   ├─ AI: Asks for missing details
   ├─ Shows dynamic form if needed
   └─ Collects: niche, audience, location, count

4. CONFIRMING
   ├─ AI: Shows campaign summary
   ├─ Asks for confirmation
   └─ Waits for "yes" / "confirm" / "start"

5. EXECUTING
   ├─ Creates campaign in DB
   ├─ Starts background agents
   ├─ Shows progress message
   └─ Redirects to dashboard

6. MONITORING
   ├─ User: "Show status"
   └─ AI: Displays campaign metrics
```

---

## 💬 Message Flow Example

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXAMPLE CONVERSATION                         │
└─────────────────────────────────────────────────────────────────┘

User Input                    AI Processing                Response
─────────────────────────────────────────────────────────────────

"Hello"                       State: GREETING              "👋 Hi! I'm your AI
                              Extract: None                Marketing Agent..."
                              Form: No                     
                              ↓

"I build websites"            State: UNDERSTANDING         "Great! Who do you
                              Extract: niche=websites      want to reach?"
                              Form: No
                              ↓

"Real estate agents"          State: COLLECTING_INFO       "Where are they
                              Extract: audience=agents     located?"
                              Form: Maybe
                              ↓

"California"                  State: COLLECTING_INFO       "How many emails?"
                              Extract: location=CA         [Shows form]
                              Form: Yes
                              ↓

"100"                         State: CONFIRMING            "Confirm:
                              Extract: count=100           - Niche: Websites
                              Form: Yes (confirm)          - Target: Agents
                              Complete: Yes                - Location: CA
                              ↓                            - Count: 100
                                                          Start?"
                                                          ↓

"Yes, start"                  State: EXECUTING             "🚀 Campaign started!
                              Create Campaign              Searching for leads..."
                              Start Agents                 [Redirect to dashboard]
                              ↓

[Background]                  Apify: Scraping              Dashboard shows:
                              AI: Writing emails           - Leads: 0 → 100
                              Sender: Sending              - Sent: 0 → 100
                              DB: Updating                 - Opens: 0 → 75
                                                          - Replies: 0 → 6
```

---

## 🎯 Information Extraction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              NATURAL LANGUAGE PROCESSING                        │
└─────────────────────────────────────────────────────────────────┘

User Message: "Find 100 real estate agents in New York"
                              ↓
                    analyzeMessage()
                              ↓
        ┌─────────────────────────────────────┐
        │     REGEX PATTERN MATCHING          │
        ├─────────────────────────────────────┤
        │                                     │
        │  Numbers: /(\d+)/                   │
        │  → Extract: 100                     │
        │                                     │
        │  Location: /in ([A-Z][a-z]+)/      │
        │  → Extract: "New York"              │
        │                                     │
        │  Audience: /find (\w+)/             │
        │  → Extract: "real estate agents"    │
        │                                     │
        └─────────────────────────────────────┘
                              ↓
                    campaignInfo Updated
                              ↓
        ┌─────────────────────────────────────┐
        │     CAMPAIGN INFO OBJECT            │
        ├─────────────────────────────────────┤
        │                                     │
        │  niche: null                        │
        │  targetAudience: "real estate..."   │
        │  location: "New York"               │
        │  emailCount: 100                    │
        │  complete: false (missing niche)    │
        │                                     │
        └─────────────────────────────────────┘
                              ↓
                    updateConversationState()
                              ↓
                State: COLLECTING_INFO
                              ↓
                AI asks for missing niche
```

---

## 📋 Form Generation Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                    FORM FIELD GENERATION                        │
└─────────────────────────────────────────────────────────────────┘

generateFormFields()
        ↓
Check campaignInfo for missing fields
        ↓
┌─────────────────────────────────────────┐
│  Missing: niche                         │
│  → Add field: "What is your business?"  │
│                                         │
│  Missing: targetAudience                │
│  → Add field: "Who to reach?"           │
│                                         │
│  Missing: location                      │
│  → Add field: "What location?"          │
│                                         │
│  Missing: emailCount                    │
│  → Add field: "How many emails?"        │
│                                         │
│  Always add: emailMessage (optional)    │
│  → Add field: "Custom message"          │
└─────────────────────────────────────────┘
        ↓
Return formFields array
        ↓
UI renders form with fields
        ↓
User fills and submits
        ↓
updateCampaignInfo(formData)
        ↓
campaignInfo.complete = true
        ↓
State: CONFIRMING
```

---

## 🚀 Campaign Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  CAMPAIGN EXECUTION PIPELINE                    │
└─────────────────────────────────────────────────────────────────┘

User confirms: "Yes, start"
        ↓
State: EXECUTING
        ↓
┌─────────────────────────────────────────┐
│  1. CREATE CAMPAIGN                     │
│     ├─ Insert into campaigns table      │
│     ├─ Set status: ACTIVE               │
│     ├─ Set agentStatus: FINDING_LEADS   │
│     └─ Return campaignId                │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  2. LOG ACTIVITY                        │
│     ├─ Insert into agentLogs            │
│     ├─ Action: "started"                │
│     └─ Message: "Finding 100 leads..."  │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  3. START BACKGROUND AGENTS             │
│     ├─ startLeadFinder()                │
│     │   ├─ Search Apify                 │
│     │   ├─ Scrape leads                 │
│     │   ├─ Verify emails                │
│     │   └─ Save to DB                   │
│     │                                   │
│     └─ startEmailSender()               │
│         ├─ Get leads from DB            │
│         ├─ Generate AI emails           │
│         ├─ Send via Sender API          │
│         └─ Track delivery               │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  4. RETURN RESPONSE                     │
│     ├─ message: "Campaign started!"     │
│     ├─ campaignId: "clx123..."          │
│     ├─ activity: {...}                  │
│     └─ stats: {...}                     │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  5. UI ACTIONS                          │
│     ├─ Show success message             │
│     ├─ Add activity to feed             │
│     ├─ Wait 3 seconds                   │
│     └─ Redirect to dashboard            │
└─────────────────────────────────────────┘
        ↓
Dashboard shows real-time progress
```

---

## 📊 Data Models

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                            │
└─────────────────────────────────────────────────────────────────┘

User
├─ id
├─ clerkId
├─ email
├─ firstName
├─ lastName
└─ campaigns[]

Campaign
├─ id
├─ userId
├─ name
├─ targetAudience
├─ location
├─ agentStatus (FINDING_LEADS, SENDING, COMPLETED)
├─ status (ACTIVE, PAUSED, COMPLETED)
├─ leadsFound
├─ totalSent
├─ totalOpened
├─ totalReplied
└─ chatHistory (JSON)

Lead
├─ id
├─ userId
├─ email
├─ firstName
├─ lastName
├─ company
├─ position
├─ leadStatus (COLD, WARM, HOT)
└─ leadScore

Email
├─ id
├─ campaignId
├─ leadId
├─ subject
├─ body
├─ status (PENDING, SENT, OPENED, REPLIED)
├─ sentAt
├─ openedAt
└─ repliedAt

AgentLog
├─ id
├─ campaignId
├─ action
├─ message
├─ data (JSON)
└─ createdAt
```

---

## 🎨 UI Component Tree

```
ChatPage
├─ Header
│  ├─ Back Button
│  ├─ AI Icon
│  └─ Title
│
├─ Messages Container
│  ├─ Typing Animation (initial)
│  ├─ Message Bubbles
│  │  ├─ User Messages (green)
│  │  └─ AI Messages (white)
│  │     ├─ AI Icon
│  │     ├─ Content
│  │     └─ Timestamp
│  │
│  └─ Dynamic Form (conditional)
│     ├─ Form Header
│     ├─ Form Fields
│     │  ├─ Text Inputs
│     │  ├─ Number Inputs
│     │  └─ Textareas
│     └─ Submit Button
│
├─ Quick Suggestions (conditional)
│  └─ Suggestion Buttons
│
├─ Chat Input
│  ├─ Text Input
│  ├─ Send Button
│  └─ Helper Text
│
└─ Stats Sidebar
   ├─ Stats Cards
   │  ├─ Leads Found
   │  ├─ Emails Sent
   │  ├─ Opened
   │  └─ Replied
   │
   ├─ Activity Feed
   │  └─ Activity Items
   │
   └─ AI Capabilities
      └─ Capability List
```

---

**This visual guide shows how all components work together! 🎯**
