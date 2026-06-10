# Apify LinkedIn Integration - System Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Chatbot Interface                      │  │
│  │  • Step-by-step wizard                                   │  │
│  │  • 6 questions with clickable options                    │  │
│  │  • Real-time feedback                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Dashboard Interface                      │  │
│  │  • Campaigns list                                        │  │
│  │  • Leads display                                         │  │
│  │  • Activity logs                                         │  │
│  │  • Real-time stats                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Chat Component (React)                       │  │
│  │  • Renders wizard steps                                  │  │
│  │  • Handles user selections                               │  │
│  │  • Shows progress                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           API Route: /api/chat/agent                     │  │
│  │  • POST request handler                                  │  │
│  │  • User authentication                                   │  │
│  │  • Wizard state management                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND LOGIC (Agents)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Conversational Agent (Wizard)                   │  │
│  │  • Collects campaign info                                │  │
│  │  • 6 steps: Purpose → Service → Target →                │  │
│  │             Country → Location → Count                   │  │
│  │  • Validates input                                       │  │
│  │  • Generates summary                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Lead Finder Agent                           │  │
│  │  • Receives campaign config                              │  │
│  │  • Orchestrates scraping workflow                        │  │
│  │  • Handles errors & fallbacks                            │  │
│  │  • Updates campaign status                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   APIFY SERVICE LAYER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         scrapeLinkedInByCampaign()                       │  │
│  │  • Builds intelligent search query                       │  │
│  │  • Adds purpose-based keywords                           │  │
│  │  • Includes location + country filters                   │  │
│  │  • Calls Apify API                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Apify Client                                │  │
│  │  • API authentication                                    │  │
│  │  • Actor execution                                       │  │
│  │  • Dataset retrieval                                     │  │
│  │  • Error handling                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL API (Apify)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         LinkedIn Profile Scraper Actor                   │  │
│  │  • Searches LinkedIn with query                          │  │
│  │  • Extracts profile data                                 │  │
│  │  • Returns structured results                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              LinkedIn Platform                           │  │
│  │  • Profile pages                                         │  │
│  │  • Search results                                        │  │
│  │  • Company data                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DATA PROCESSING LAYER                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Data Transformation                            │  │
│  │  • Parse scraped data                                    │  │
│  │  • Extract name, company, title                          │  │
│  │  • Construct email if missing                            │  │
│  │  • Validate required fields                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Email Construction                             │  │
│  │  • Pattern 1: firstname.lastname@company.com             │  │
│  │  • Pattern 2: firstname@company.com                      │  │
│  │  • Pattern 3: firstnamelastname@company.com              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Campaigns Table                             │  │
│  │  • id, name, status                                      │  │
│  │  • targetAudience, location                              │  │
│  │  • agentStatus, leadsFound                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Leads Table                                 │  │
│  │  • id, email, firstName, lastName                        │  │
│  │  • company, position, phone                              │  │
│  │  • website, source, emailVerified                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           CampaignLeads Table (Junction)                 │  │
│  │  • campaignId, leadId                                    │  │
│  │  • status, sentAt, openedAt                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AgentLogs Table                             │  │
│  │  • campaignId, action, message                           │  │
│  │  • data, timestamp                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Sequence

```
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────┐     ┌──────────┐
│ User │────▶│ Chatbot  │────▶│   API    │────▶│ Agent│────▶│  Apify   │
└──────┘     └──────────┘     └──────────┘     └──────┘     └──────────┘
   │              │                 │               │              │
   │ 1. Clicks    │                 │               │              │
   │    options   │                 │               │              │
   │              │                 │               │              │
   │◀─────────────┤ 2. Shows next   │               │              │
   │              │    question     │               │              │
   │              │                 │               │              │
   │ 3. Completes │                 │               │              │
   │    all steps │                 │               │              │
   │              │                 │               │              │
   │              │ 4. POST request │               │              │
   │              │─────────────────▶               │              │
   │              │                 │               │              │
   │              │                 │ 5. Create     │              │
   │              │                 │    campaign   │              │
   │              │                 │               │              │
   │              │                 │ 6. Start      │              │
   │              │                 │    lead finder│              │
   │              │                 │───────────────▶              │
   │              │                 │               │              │
   │              │                 │               │ 7. Build     │
   │              │                 │               │    query     │
   │              │                 │               │              │
   │              │                 │               │ 8. Call API  │
   │              │                 │               │──────────────▶
   │              │                 │               │              │
   │              │                 │               │ 9. Scrape    │
   │              │                 │               │    LinkedIn  │
   │              │                 │               │              │
   │              │                 │               │10. Return    │
   │              │                 │               │◀──────────────
   │              │                 │               │   data       │
   │              │                 │               │              │
   │              │                 │               │11. Transform │
   │              │                 │               │    & save    │
   │              │                 │               │              │
   │              │                 │12. Update     │              │
   │              │                 │◀───────────────   status     │
   │              │                 │               │              │
   │              │13. Return       │               │              │
   │              │◀─────────────────   response    │              │
   │              │                 │               │              │
   │14. Show      │                 │               │              │
   │◀──────────────   success       │               │              │
   │    message   │                 │               │              │
   │              │                 │               │              │
   │15. Redirect  │                 │               │              │
   │    to        │                 │               │              │
   │    dashboard │                 │               │              │
   │              │                 │               │              │
```

---

## 🎯 Campaign Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: PURPOSE                          │
│  "Why do you want to send emails?"                          │
│  Options: Find clients | Promote service | Build            │
│           partnerships | General outreach                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    STEP 2: SERVICE                          │
│  "What service or product do you offer?"                    │
│  Options: Website Dev | App Dev | Marketing | Design |      │
│           Content | Consulting | Custom                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    STEP 3: TARGET                           │
│  "Who do you want to reach?"                                │
│  Options: Real Estate | Restaurants | Healthcare |          │
│           Small Business | Tech Startups | Retail | Custom  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    STEP 4: COUNTRY                          │
│  "Which country?"                                           │
│  Options: USA | UK | Canada | Australia | India |           │
│           Nepal | Custom                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    STEP 5: LOCATION                         │
│  "Which city or state in [Country]?"                        │
│  Dynamic options based on selected country                  │
│  USA: NY | CA | TX | FL | IL | All States                  │
│  Nepal: Kathmandu | Pokhara | Lalitpur | All Nepal         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    STEP 6: COUNT                            │
│  "How many emails do you want to send?"                     │
│  Options: 50 | 100 | 200 | 500 | 1000 | Custom             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CONFIRMATION                             │
│  Shows complete summary of all selections                   │
│  Options: Start Campaign | Edit Details                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    EXECUTION                                │
│  • Campaign created in database                             │
│  • Lead finder agent started                                │
│  • Apify scraper triggered                                  │
│  • Real-time progress shown                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Search Query Building Logic

```
┌─────────────────────────────────────────────────────────────┐
│                  INPUT PARAMETERS                           │
│  • targetAudience: "Real Estate Agents"                     │
│  • location: "Kathmandu"                                    │
│  • country: "Nepal"                                         │
│  • industry: "Website Development"                          │
│  • purpose: "Find new clients"                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  QUERY CONSTRUCTION                         │
│                                                             │
│  Step 1: Start with target audience                        │
│  query = "Real Estate Agents"                               │
│                                                             │
│  Step 2: Add location + country                            │
│  query += " in Kathmandu, Nepal"                            │
│                                                             │
│  Step 3: Add industry (if provided)                        │
│  query += " Website Development"                            │
│                                                             │
│  Step 4: Add purpose-based keywords                        │
│  keywords = "decision maker OR owner OR founder"            │
│  query += " " + keywords                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  FINAL SEARCH QUERY                         │
│  "Real Estate Agents in Kathmandu, Nepal Website           │
│   Development decision maker OR owner OR founder"           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  APIFY API CALL                             │
│  Actor: apify/linkedin-profile-scraper                      │
│  Input: { searchQuery, maxResults, includeContacts }        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Transformation Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│              RAW LINKEDIN DATA (from Apify)                 │
│  {                                                          │
│    fullName: "Ram Sharma",                                  │
│    company: "ABC Solutions",                                │
│    headline: "Real Estate Agent",                           │
│    location: "Kathmandu, Nepal",                            │
│    url: "linkedin.com/in/ramsharma",                        │
│    contactInfo: { email: null },                            │
│    companyWebsite: "https://abcsolutions.com"               │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  EMAIL CONSTRUCTION                         │
│  No email found in profile                                  │
│  → Extract: firstName = "Ram", lastName = "Sharma"          │
│  → Extract: companyDomain = "abcsolutions.com"              │
│  → Generate patterns:                                       │
│     1. ram.sharma@abcsolutions.com                          │
│     2. ram@abcsolutions.com                                 │
│     3. ramsharma@abcsolutions.com                           │
│  → Use pattern 1 as primary                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              TRANSFORMED LEAD DATA                          │
│  {                                                          │
│    name: "Ram Sharma",                                      │
│    email: "ram.sharma@abcsolutions.com",                    │
│    company: "ABC Solutions",                                │
│    title: "Real Estate Agent",                              │
│    linkedin: "linkedin.com/in/ramsharma",                   │
│    location: "Kathmandu, Nepal",                            │
│    website: "https://abcsolutions.com",                     │
│    source: "apify_linkedin_campaign"                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              DATABASE STORAGE (Prisma)                      │
│  Lead.create({                                              │
│    userId, email, firstName, lastName,                      │
│    company, position, phone, website,                       │
│    source, emailVerified: true                              │
│  })                                                         │
│  CampaignLead.create({                                      │
│    campaignId, leadId, status: 'PENDING'                    │
│  })                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Error Handling & Fallback Strategy

```
┌─────────────────────────────────────────────────────────────┐
│              PRIMARY: LinkedIn Scraping                     │
│  Try scrapeLinkedInByCampaign()                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │   Success?    │
                    └───────┬───────┘
                    Yes ↓   │ No
                        ↓   │
                        ↓   ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKUP: Google Search                          │
│  Try scrapeGoogleSearch()                                   │
│  Only if LinkedIn results < requested count                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │   Success?    │
                    └───────┬───────┘
                    Yes ↓   │ No
                        ↓   │
                        ↓   ↓
┌─────────────────────────────────────────────────────────────┐
│              FALLBACK: Mock Data                            │
│  Generate mock leads for testing                            │
│  Only used when both scraping methods fail                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              RESULT: Leads Array                            │
│  Return leads (from any successful source)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Real-time Status Updates

```
Campaign Status Flow:

CREATED
   ↓
FINDING_LEADS (Agent started)
   ↓
   ├─→ Scraping LinkedIn...
   ├─→ Found X profiles
   ├─→ Scraping Google...
   ├─→ Found Y more profiles
   ├─→ Saving to database...
   ↓
LEADS_READY (Scraping complete)
   ↓
SENDING_EMAILS (Email agent started)
   ↓
ACTIVE (Campaign running)
   ↓
COMPLETED (All emails sent)
```

---

**Created**: 2026-05-18  
**Version**: 1.0  
**Status**: ✅ Complete
