# 🧪 Conversational AI Chatbot - Testing Guide

## Quick Start Testing

### 1. Start the Application

```bash
cd aiemailmarketing
npm run dev
```

Open: `http://localhost:3000/dashboard/chat`

---

## 🎯 Test Scenarios

### Scenario 1: Simple Direct Request
**Goal**: Test if AI can extract all info from one message

```
User: "Find 100 real estate agents in New York"

Expected:
✅ AI extracts: target="real estate agents", location="New York", count=100
✅ AI asks for business/niche
✅ Shows form or continues conversation
```

---

### Scenario 2: Conversational Flow
**Goal**: Test natural back-and-forth conversation

```
Step 1:
User: "Hello"
Expected: Welcome message, asks about business

Step 2:
User: "I build websites and need clients"
Expected: AI acknowledges, asks for target audience

Step 3:
User: "Real estate agents"
Expected: AI asks for location

Step 4:
User: "California"
Expected: AI asks for email count

Step 5:
User: "100"
Expected: AI shows confirmation with all details

Step 6:
User: "Yes, start"
Expected: Campaign starts, redirects to dashboard
```

---

### Scenario 3: Form-Based Collection
**Goal**: Test dynamic form generation

```
Step 1:
User: "I need clients for my marketing agency"

Expected:
✅ AI responds with understanding
✅ Shows interactive form with fields:
   - Business/Service (pre-filled: "marketing agency")
   - Target Audience (empty)
   - Location (empty)
   - Email Count (empty)
   - Custom Message (optional)

Step 2:
User fills form:
- Target: "Small business owners"
- Location: "Texas"
- Count: 200

Expected:
✅ AI confirms all details
✅ Asks for final confirmation

Step 3:
User: "Yes"

Expected:
✅ Campaign created
✅ Background jobs start
✅ Redirects to dashboard
```

---

### Scenario 4: Partial Information
**Goal**: Test AI's ability to ask for missing info

```
User: "Find leads in Miami"

Expected:
✅ AI acknowledges location
✅ Asks for:
   - What business/service?
   - Who to target?
   - How many emails?
```

---

### Scenario 5: Status Check
**Goal**: Test monitoring state

```
User: "Show me campaign status"

Expected:
✅ AI shows all active campaigns
✅ Displays metrics (leads, sent, opened, replied)
✅ Suggests next actions
```

---

## 🔍 What to Check

### UI Elements:
- [ ] Welcome message with typing animation
- [ ] Message bubbles (user=green, AI=white)
- [ ] AI icon on assistant messages
- [ ] Timestamps on messages
- [ ] Loading indicator while AI thinks
- [ ] Quick suggestion buttons
- [ ] Dynamic form appears when needed
- [ ] Form fields pre-filled with known info
- [ ] Confirm button changes text based on state

### Sidebar Stats:
- [ ] Leads Found counter
- [ ] Emails Sent counter
- [ ] Opened counter with percentage
- [ ] Replied counter with percentage
- [ ] Recent Activity feed
- [ ] AI Capabilities list

### Functionality:
- [ ] Enter key sends message
- [ ] Can't send empty messages
- [ ] Form validation works
- [ ] Confirmation required before campaign starts
- [ ] Redirects to dashboard after campaign starts
- [ ] Stats update in real-time

---

## 🐛 Common Issues & Solutions

### Issue 1: AI Not Responding
**Symptoms**: Message sent but no response

**Check**:
```bash
# Check console for errors
# Verify OpenAI API key
echo $OPENAI_API_KEY

# Check API endpoint
curl http://localhost:3000/api/chat/agent
```

**Solution**:
- Add OpenAI API key to `.env.local`
- Restart dev server

---

### Issue 2: Form Not Showing
**Symptoms**: AI responds but form doesn't appear

**Check**:
- Browser console for React errors
- Network tab for API response
- Verify `showForm: true` in response

**Solution**:
- Clear browser cache
- Check React state updates
- Verify formFields array in response

---

### Issue 3: Campaign Not Starting
**Symptoms**: User confirms but nothing happens

**Check**:
```bash
# Check database
npx prisma studio

# Check backend logs
# Look for campaign creation
```

**Solution**:
- Verify database connection
- Check Apify API key
- Check Sender API key
- Review backend logs

---

### Issue 4: Stats Not Updating
**Symptoms**: Dashboard shows 0 for everything

**Check**:
- Database has campaigns
- API returns stats object
- React state updates properly

**Solution**:
- Create a test campaign
- Check API response structure
- Verify stats calculation logic

---

## 📊 Expected API Responses

### Initial Message:
```json
{
  "message": "👋 Hi! I'm your AI Marketing Agent...",
  "state": "GREETING",
  "campaignInfo": { "complete": false },
  "showForm": false,
  "stats": {
    "leadsFound": 0,
    "emailsSent": 0,
    "opened": 0,
    "replied": 0
  }
}
```

### Collecting Info:
```json
{
  "message": "Great! I need a few more details...",
  "state": "COLLECTING_INFO",
  "campaignInfo": {
    "niche": "website building",
    "targetAudience": "real estate agents",
    "complete": false
  },
  "showForm": true,
  "formFields": [
    {
      "name": "location",
      "label": "What location/area?",
      "type": "text",
      "required": true
    },
    {
      "name": "emailCount",
      "label": "How many emails to send?",
      "type": "number",
      "required": true
    }
  ]
}
```

### Confirming:
```json
{
  "message": "Perfect! Let me confirm...",
  "state": "CONFIRMING",
  "campaignInfo": {
    "niche": "website building",
    "targetAudience": "real estate agents",
    "location": "California",
    "emailCount": 100,
    "complete": true
  },
  "needsConfirmation": true,
  "showForm": true
}
```

### Executing:
```json
{
  "message": "🚀 Campaign started!...",
  "state": "EXECUTING",
  "campaignId": "clx123abc",
  "activity": {
    "id": "clx123abc",
    "action": "Finding Leads",
    "message": "Searching for 100 real estate agents in California",
    "timestamp": "2024-01-01T00:00:00Z",
    "status": "pending"
  },
  "stats": {
    "leadsFound": 0,
    "emailsSent": 0,
    "opened": 0,
    "replied": 0
  }
}
```

---

## 🎯 Test Checklist

### Basic Functionality:
- [ ] Chat loads without errors
- [ ] Can send messages
- [ ] AI responds within 3 seconds
- [ ] Typing animation works
- [ ] Messages display correctly

### Conversation Flow:
- [ ] AI understands greetings
- [ ] Extracts business info from messages
- [ ] Asks clarifying questions
- [ ] Remembers previous messages
- [ ] Transitions between states correctly

### Form System:
- [ ] Form appears when needed
- [ ] Fields pre-filled with known data
- [ ] Can edit form fields
- [ ] Form submission works
- [ ] Validation prevents empty required fields

### Campaign Execution:
- [ ] Confirmation required before starting
- [ ] Campaign created in database
- [ ] Background jobs triggered
- [ ] Activity log updates
- [ ] Redirects to dashboard

### Dashboard Integration:
- [ ] Stats display correctly
- [ ] Activity feed shows actions
- [ ] Real-time updates work
- [ ] Can navigate back to chat

---

## 🚀 Performance Testing

### Response Time:
- AI response: < 3 seconds
- Form rendering: < 100ms
- Campaign creation: < 500ms
- Dashboard redirect: 3 seconds

### Load Testing:
```bash
# Test multiple concurrent users
# Use tools like Apache Bench or k6
ab -n 100 -c 10 http://localhost:3000/api/chat/agent
```

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Scenario 1: Simple Direct Request
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 2: Conversational Flow
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 3: Form-Based Collection
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 4: Partial Information
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 5: Status Check
Status: [ ] Pass [ ] Fail
Notes: _______________________

Overall: [ ] All Pass [ ] Some Failures

Issues Found:
1. _______________________
2. _______________________
3. _______________________
```

---

## 🎉 Success Criteria

System is ready when:
- ✅ All 5 test scenarios pass
- ✅ No console errors
- ✅ Forms work smoothly
- ✅ Campaigns start automatically
- ✅ Dashboard updates in real-time
- ✅ UI is responsive and smooth
- ✅ AI responses are relevant
- ✅ Confirmation system works

---

## 📞 Need Help?

If tests fail:
1. Check console logs (browser + server)
2. Verify all API keys are set
3. Test database connection
4. Review API responses
5. Check network tab in DevTools

---

**Happy Testing! 🚀**
