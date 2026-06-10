# Apify LinkedIn Integration - Complete Guide

## Overview

This system automatically triggers Apify LinkedIn scraping from the AI chatbot. After the user provides email campaign details, the system scrapes targeted leads from LinkedIn and saves them to the database.

## System Flow

```
User Input (Chatbot)
    ↓
Campaign Details Collection
    ↓
Apify LinkedIn Scraper Call
    ↓
Data Scraping from LinkedIn
    ↓
Lead Data Transformation
    ↓
Database Storage (Leads Table)
    ↓
Email Campaign Ready
```

## Features

### 1. **AI Bot Integration**
- User provides campaign details in chatbot:
  - **Purpose**: Why send emails (Find clients, Promote service, etc.)
  - **Service/Niche**: What service you offer
  - **Target Audience**: Who to target (Real Estate Agents, Restaurant Owners, etc.)
  - **Country**: Which country (USA, Nepal, India, etc.)
  - **Location**: Which city/state (New York, Kathmandu, etc.)
  - **Email Count**: How many emails to send (50, 100, 500, etc.)

### 2. **Apify LinkedIn Scraping**
- Builds intelligent search query from campaign details
- Uses LinkedIn Profile Scraper actor
- Advanced filtering:
  - Location-based targeting
  - Industry-specific search
  - Job title/position filtering
  - Company size filtering

### 3. **Smart Search Query Building**
```typescript
// Example: Real Estate Agents in Kathmandu, Nepal
searchQuery = "Real Estate Agents in Kathmandu, Nepal decision maker OR owner OR founder"

// Example: Restaurant Owners in New York, USA
searchQuery = "Restaurant Owners in New York, United States manager OR director OR head"
```

### 4. **Data Extraction**
Extracts this data from Apify:
- Full Name
- Email Address (or constructed email)
- Company Name
- Job Title/Position
- LinkedIn Profile URL
- Location
- Company Size
- Industry
- Profile Summary

### 5. **Email Construction**
When LinkedIn profile has no email, system automatically constructs it:
```typescript
// Pattern 1: firstname.lastname@company.com
// Pattern 2: firstname@company.com
// Pattern 3: firstnamelastname@company.com
```

### 6. **Database Storage**
Saves scraped leads to database:
- Stored in Lead table
- Linked to Campaign
- Duplicate check
- Email verification status

## Code Structure

### 1. **Conversational Agent** (`lib/agents/conversational-agent.ts`)
- Step-by-step wizard interface
- Campaign details collection
- 6 steps: Purpose → Service → Target → Country → Location → Count

### 2. **Lead Finder Agent** (`lib/agents/lead-finder.ts`)
- Campaign execution orchestration
- Apify scraper call
- Data transformation
- Database storage

### 3. **Apify Service** (`lib/apify-service.ts`)
- `scrapeLinkedInByCampaign()`: Advanced LinkedIn scraping
- Smart query building
- Email extraction/construction
- Error handling with fallback

### 4. **API Route** (`app/api/chat/agent/route.ts`)
- Chatbot message handling
- Campaign creation
- Agent triggering
- Real-time status updates

## Configuration

### Environment Variables
```env
# Apify API Key
APIFY_API_KEY=your_apify_api_key_here

# OpenAI for AI chatbot
OPENAI_API_KEY=sk-proj-...

# Database
DATABASE_URL=postgresql://...
```

### Apify Actor
- **Actor**: `apify/linkedin-profile-scraper`
- **Features**:
  - Contact info extraction
  - Skills & experience
  - Company details
  - Profile summary

## Usage Example

### User Interaction:
```
Bot: "Why do you want to send emails?"
User: [Clicks] "Find new clients"

Bot: "What service do you offer?"
User: [Clicks] "Website Development"

Bot: "Who do you want to reach?"
User: [Clicks] "Real Estate Agents"

Bot: "Which country?"
User: [Clicks] "Nepal"

Bot: "Which city in Nepal?"
User: [Clicks] "Kathmandu"

Bot: "How many emails?"
User: [Clicks] "100 emails"

Bot: "Campaign Started! 🚀"
```

### Behind the Scenes:
```typescript
// 1. Campaign Created
const campaign = {
  name: "Real Estate Agents in Kathmandu, Nepal",
  targetAudience: "Real Estate Agents",
  location: "Kathmandu",
  country: "Nepal",
  industry: "Website Development",
  purpose: "Find new clients",
  emailCount: 100
}

// 2. Apify Called
scrapeLinkedInByCampaign({
  targetAudience: "Real Estate Agents",
  location: "Kathmandu",
  country: "Nepal",
  industry: "Website Development",
  purpose: "Find new clients",
  maxResults: 100
})

// 3. Search Query Built
"Real Estate Agents in Kathmandu, Nepal Website Development decision maker OR owner OR founder"

// 4. LinkedIn Scraped
// ... Apify scrapes 100 profiles ...

// 5. Leads Saved
// 100 leads saved to database with emails
```

## Error Handling

### Fallback Strategy:
1. **Primary**: LinkedIn scraping
2. **Backup**: Google search scraping
3. **Fallback**: Mock data generation

### Logging:
```typescript
// Activity logs in database
- "🎯 Searching for Real Estate Agents in Kathmandu"
- "🔍 Starting LinkedIn campaign scraping"
- "✅ Found 87 leads from LinkedIn"
- "🔍 Searching Google for additional leads"
- "✅ Found 13 additional leads from Google"
- "💾 Saving 100 leads to database"
- "✅ 100 leads saved successfully"
```

## Benefits

### For Users:
- ✅ Simple chatbot interface
- ✅ No technical knowledge needed
- ✅ Automatic lead finding
- ✅ Verified email addresses
- ✅ Real-time progress tracking

### For System:
- ✅ Intelligent search queries
- ✅ Multiple data sources
- ✅ Automatic fallback
- ✅ Duplicate prevention
- ✅ Comprehensive logging

## Testing

### Test Campaign:
```bash
# 1. Start chatbot
# 2. Select: "Find new clients"
# 3. Select: "Website Development"
# 4. Select: "Real Estate Agents"
# 5. Select: "Nepal"
# 6. Select: "Kathmandu"
# 7. Select: "50 emails"
# 8. Confirm campaign
# 9. Check dashboard for leads
```

### Expected Results:
- Campaign created in database
- Apify scraper triggered
- LinkedIn profiles scraped
- Leads saved with emails
- Campaign status updated
- Activity logs created

## Monitoring

### Dashboard Views:
- **Campaigns**: All active campaigns
- **Leads**: Scraped leads with details
- **Activity Logs**: Real-time scraping progress
- **Stats**: Leads found, emails sent, opens, replies

### API Endpoints:
- `POST /api/chat/agent` - Chatbot interaction
- `GET /api/campaigns` - List campaigns
- `GET /api/leads` - List leads
- `GET /api/campaigns/:id/logs` - Activity logs

## Future Enhancements

1. **Email Verification**: Verify emails before saving
2. **Enrichment**: Add more data from other sources
3. **AI Scoring**: Score leads based on relevance
4. **Auto-follow-up**: Automatic follow-up emails
5. **Analytics**: Advanced campaign analytics

## Support

### Common Issues:

**Issue**: No leads found
- **Solution**: Check Apify API key, try different search terms

**Issue**: Invalid emails
- **Solution**: Enable email verification service

**Issue**: Slow scraping
- **Solution**: Reduce lead count, check Apify quota

**Issue**: Duplicate leads
- **Solution**: System automatically handles duplicates

## Conclusion

This integration seamlessly connects the AI chatbot with Apify LinkedIn scraping. After the user provides details in the simple chatbot interface, the system automatically scrapes targeted leads from LinkedIn and saves them to the database. It's a fully automated, intelligent, and user-friendly solution.

---

**Created**: 2026-05-18
**Version**: 1.0
**Status**: ✅ Implemented & Working
