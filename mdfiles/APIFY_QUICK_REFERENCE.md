# Apify LinkedIn Integration - Quick Reference

## 🚀 Quick Start

### 1. User Opens Chatbot
```
Dashboard → Chat Tab → Start Conversation
```

### 2. Bot Asks 6 Questions
```
Q1: Why send emails? → Select purpose
Q2: What service? → Select or type service
Q3: Who to target? → Select or type audience
Q4: Which country? → Select or type country
Q5: Which location? → Select or type city/state
Q6: How many emails? → Select or type count
```

### 3. Confirm & Launch
```
Review summary → Click "Yes, start campaign!"
```

### 4. System Automatically:
```
✅ Creates campaign in database
✅ Calls Apify LinkedIn scraper
✅ Scrapes targeted profiles
✅ Extracts/constructs emails
✅ Saves leads to database
✅ Updates campaign status
```

---

## 📋 Campaign Flow

```mermaid
User Input → Campaign Creation → Apify Call → LinkedIn Scraping → Data Transform → Database Save → Email Ready
```

---

## 🔧 Technical Components

### Files Modified:
1. `lib/agents/conversational-agent.ts` - Added country step
2. `lib/agents/lead-finder.ts` - Enhanced Apify integration
3. `lib/apify-service.ts` - Added `scrapeLinkedInByCampaign()`
4. `app/api/chat/agent/route.ts` - Pass country to lead finder

### New Function:
```typescript
scrapeLinkedInByCampaign({
  targetAudience: string,
  location: string,
  country: string,
  industry: string,
  purpose: string,
  maxResults: number
})
```

---

## 🎯 Search Query Examples

### Example 1: Real Estate in Nepal
```
Input:
- Target: Real Estate Agents
- Country: Nepal
- Location: Kathmandu
- Industry: Website Development
- Purpose: Find new clients

Query:
"Real Estate Agents in Kathmandu, Nepal Website Development decision maker OR owner OR founder"
```

### Example 2: Restaurants in USA
```
Input:
- Target: Restaurant Owners
- Country: United States
- Location: New York
- Industry: Digital Marketing
- Purpose: Promote my service

Query:
"Restaurant Owners in New York, United States Digital Marketing manager OR director OR head"
```

---

## 📊 Data Extracted

### From LinkedIn:
- ✅ Full Name
- ✅ Email (or constructed)
- ✅ Company Name
- ✅ Job Title
- ✅ LinkedIn URL
- ✅ Location
- ✅ Industry
- ✅ Company Size
- ✅ Profile Summary

### Email Construction:
```typescript
// If email not found, construct:
Pattern 1: firstname.lastname@company.com
Pattern 2: firstname@company.com
Pattern 3: firstnamelastname@company.com
```

---

## 🔄 Fallback Strategy

```
1. LinkedIn Scraping (Primary)
   ↓ (if insufficient)
2. Google Search (Backup)
   ↓ (if fails)
3. Mock Data (Fallback)
```

---

## 📝 Activity Logs

### Real-time Messages:
```
🎯 Searching for [Target] in [Location]
🔍 Starting LinkedIn campaign scraping
✅ Found X leads from LinkedIn
🔍 Searching Google for additional leads
✅ Found Y additional leads from Google
💾 Saving Z leads to database
✅ Z leads saved successfully
```

---

## ⚙️ Configuration

### Environment Variables:
```env
APIFY_API_KEY=apify_api_...
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql://...
```

### Apify Actor:
```
Actor: apify/linkedin-profile-scraper
Features: Contact info, Skills, Experience, Company details
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No leads found | Check API key, try different search terms |
| Invalid emails | System auto-constructs emails |
| Slow scraping | Reduce lead count (50-100) |
| Duplicate leads | System auto-skips duplicates |
| API error | Check Apify quota/limits |

---

## 📈 Dashboard Views

### Campaigns:
```
- List all campaigns
- Status (Finding Leads, Leads Ready, Sending, etc.)
- Progress percentage
- Leads found count
```

### Leads:
```
- Name, Email, Company
- Position, Location
- Source (LinkedIn, Google)
- Verification status
```

### Activity Logs:
```
- Real-time scraping progress
- Success/error messages
- Timestamps
```

### Stats:
```
- Leads found: X
- Emails sent: Y
- Open rate: Z%
- Reply rate: W%
```

---

## 🧪 Testing

### Quick Test:
```bash
1. Open chatbot
2. Select: "Find new clients"
3. Select: "Website Development"
4. Select: "Real Estate Agents"
5. Select: "Nepal"
6. Select: "Kathmandu"
7. Select: "50 emails"
8. Confirm
9. Check dashboard
```

### Expected Result:
```
✅ Campaign created
✅ Apify triggered
✅ ~50 leads scraped
✅ Leads saved with emails
✅ Status updated
```

---

## 📚 Documentation

- **Full Guide**: `APIFY_LINKEDIN_INTEGRATION.md`
- **This File**: `APIFY_QUICK_REFERENCE.md`
- **API Docs**: `BACKEND_API_REFERENCE.md`

---

## 🎉 Benefits

### For Users:
- ✅ Simple chatbot interface
- ✅ No technical knowledge needed
- ✅ Automatic lead finding
- ✅ Real-time tracking

### For Business:
- ✅ Time-saving automation
- ✅ Targeted leads
- ✅ Scalable (50-1000 leads)
- ✅ Cost-effective

---

## 🔮 Future Features

- 🔄 Email verification
- 🔄 Lead enrichment
- 🔄 AI lead scoring
- 📅 Auto-follow-ups
- 📅 Advanced analytics
- 📅 CRM integration

---

**Version**: 1.0  
**Status**: ✅ Working  
**Last Updated**: 2026-05-18
