# 🤖 Conversational AI Marketing Agent System

## Overview

This is an intelligent conversational AI system that understands your business, has natural conversations with users, collects campaign information through interactive forms, and automatically executes marketing campaigns.

## 🎯 Key Features

### 1. **Business Context Understanding**
- The AI knows about your business, services, and capabilities
- Understands what you offer (websites, marketing, software development)
- Can explain your services to potential clients

### 2. **Natural Conversation Flow**
The AI guides users through different conversation states:

- **GREETING**: Initial welcome and introduction
- **UNDERSTANDING**: Learning about user's business and needs
- **COLLECTING_INFO**: Gathering campaign details through questions
- **CONFIRMING**: Summarizing and confirming campaign details
- **EXECUTING**: Running the campaign (lead scraping + email sending)
- **MONITORING**: Showing campaign progress

### 3. **Interactive Form Collection**
When the AI needs specific information, it shows a dynamic form with fields like:
- **Niche/Business**: What service/product do you offer?
- **Target Audience**: Who do you want to reach?
- **Location**: Geographic area to target
- **Email Count**: How many emails to send?
- **Custom Message**: Optional personalized message

### 4. **Intelligent Information Extraction**
The AI automatically extracts information from natural language:
```
User: "I build websites and need to find 100 real estate agents in New York"

AI extracts:
- Niche: "website building"
- Target Audience: "real estate agents"
- Location: "New York"
- Email Count: 100
```

### 5. **Confirmation Before Execution**
Before starting any campaign, the AI:
1. Summarizes all collected information
2. Shows a clear confirmation message
3. Waits for user approval ("yes", "confirm", "start")
4. Only then starts the backend processes

### 6. **Automatic Campaign Execution**
Once confirmed, the system automatically:
1. **Creates campaign** in database
2. **Starts Apify** lead scraping in background
3. **Generates AI emails** for each lead
4. **Sends emails** via Sender API
5. **Updates dashboard** with real-time progress

## 📁 File Structure

```
lib/agents/
├── conversational-agent.ts    # Main conversational AI logic
├── lead-finder.ts             # Apify lead scraping agent
├── email-sender.ts            # Email sending agent
└── reply-handler.ts           # Reply processing agent

app/api/chat/agent/
└── route.ts                   # API endpoint for chat

app/(dashboard)/dashboard/chat/
└── page.tsx                   # Chat UI with forms
```

## 🔄 Conversation Flow Example

### Example 1: Complete Flow

```
User: "Hello"

AI: "👋 Hi! I'm your AI Marketing Agent.

I understand your business and can help you:
• Find potential clients anywhere
• Write personalized emails
• Send automated campaigns
• Track results in real-time

Tell me about your business - what do you do and who do you want to reach?"

---

User: "I build websites and want to find clients"

AI: "Great! Website building is a valuable service. 

To help you find clients, I need a few more details:
• Who is your ideal client? (e.g., real estate agents, restaurants, lawyers)
• What location should I target?
• How many potential clients do you want to reach?"

---

User: "Real estate agents in California, around 100"

AI: "Perfect! Let me confirm the details:

📋 **Campaign Summary**
- Business: Website building
- Target: Real estate agents
- Location: California
- Emails: 100

Should I start finding leads and sending emails? Reply 'yes' to confirm!"

---

User: "Yes, start"

AI: "🚀 Campaign started! I'm now:

1. 🔍 Searching for real estate agents in California
2. ✍️ Writing personalized emails
3. 📧 Sending emails automatically

Check your dashboard for real-time progress!"

[System automatically redirects to dashboard after 3 seconds]
```

### Example 2: Using the Form

```
User: "I need clients for my marketing agency"

AI: "I'd love to help you find clients for your marketing agency!

Let me collect some details to create the perfect campaign for you."

[AI shows interactive form with fields:]
- What is your business/service? [Pre-filled: "marketing agency"]
- Who do you want to reach? [Empty]
- What location/area? [Empty]
- How many emails to send? [Empty]
- Custom message (optional) [Empty]

[User fills form and clicks "Continue"]

AI: "Excellent! Here's what I have:

📋 **Campaign Summary**
- Business: Marketing agency
- Target: Small business owners
- Location: Texas
- Emails: 200

Ready to start? Reply 'yes' to confirm!"
```

## 🛠️ Technical Implementation

### 1. Conversational Agent Class

```typescript
export class ConversationalAgent {
  private userId: string
  private conversationState: ConversationState
  private campaignInfo: CampaignInfo
  private conversationHistory: Message[]

  async chat(userMessage: string): Promise<Response>
  private async analyzeMessage(message: string): Promise<void>
  private async generateResponse(userMessage: string): Promise<Response>
  updateCampaignInfo(formData: Partial<CampaignInfo>): void
}
```

### 2. API Endpoint

```typescript
POST /api/chat/agent

Request:
{
  "message": "User message",
  "formData": { /* Optional form data */ }
}

Response:
{
  "message": "AI response",
  "state": "COLLECTING_INFO",
  "campaignInfo": { /* Collected info */ },
  "showForm": true,
  "formFields": [ /* Dynamic form fields */ ],
  "stats": { /* Campaign stats */ },
  "activity": { /* Recent activity */ }
}
```

### 3. Chat UI Component

The chat page includes:
- **Message display** with typing animation
- **Dynamic form rendering** based on AI response
- **Real-time stats sidebar** showing campaign metrics
- **Activity feed** showing agent actions
- **Quick suggestions** for common queries

## 🎨 UI Features

### Form Display
- Shows only when AI needs specific information
- Pre-fills known information
- Validates required fields
- Smooth animations and transitions

### Message Bubbles
- User messages: Green, right-aligned
- AI messages: White, left-aligned with AI icon
- Typing indicator while AI is thinking
- Timestamps on all messages

### Stats Sidebar
- **Leads Found**: Total prospects identified
- **Emails Sent**: Emails delivered
- **Opened**: Email open rate
- **Replied**: Reply rate
- **Recent Activity**: Live agent actions

## 🚀 Backend Integration

### Lead Finding (Apify)
```typescript
startLeadFinder({
  campaignId: campaign.id,
  targetAudience: "real estate agents",
  location: "California",
  leadCount: 100
})
```

### Email Sending (Sender API)
```typescript
startEmailSender({
  campaignId: campaign.id,
  userId: user.id
})
```

### Real-time Updates
- Campaign status updates in database
- Agent activity logs
- Dashboard metrics refresh
- Email tracking (opens, clicks, replies)

## 📊 Dashboard Integration

After campaign starts:
1. User is redirected to dashboard
2. Dashboard shows:
   - Campaign progress
   - Leads being found
   - Emails being sent
   - Real-time metrics
   - Agent activity log

## 🔐 Security & Privacy

- User authentication via Clerk
- Campaign data isolated per user
- API rate limiting
- Input validation and sanitization
- Secure API key storage

## 🎯 Customization

### Update Business Context
Edit `BUSINESS_CONTEXT` in `conversational-agent.ts`:

```typescript
const BUSINESS_CONTEXT = `
You are an AI Marketing Agent for [YOUR COMPANY].

Your capabilities:
- [List your services]
- [What you can do]

Your personality:
- [How you communicate]
`
```

### Add Custom Form Fields
Modify `generateFormFields()` method to add new fields:

```typescript
fields.push({
  name: 'industry',
  label: 'What industry?',
  type: 'select',
  required: true,
  options: ['Real Estate', 'Healthcare', 'Technology']
})
```

### Customize Conversation States
Add new states in `ConversationState` type and handle them in `generateResponse()`.

## 📝 Usage Instructions

### For Users:
1. Go to `/dashboard/chat`
2. Start conversation naturally
3. Answer AI's questions or fill the form
4. Confirm campaign details
5. Watch campaign execute automatically
6. Check dashboard for results

### For Developers:
1. Configure OpenAI API key in `.env`
2. Set up Apify API key for lead scraping
3. Configure Sender API for email sending
4. Customize business context as needed
5. Deploy and test

## 🐛 Troubleshooting

### AI not responding
- Check OpenAI API key is valid
- Verify API rate limits not exceeded
- Check console for errors

### Form not showing
- Ensure `showForm` is true in response
- Check `formFields` array is populated
- Verify React state updates

### Campaign not starting
- Confirm user clicked "yes" or "confirm"
- Check database campaign creation
- Verify Apify and Sender API keys

## 🚀 Future Enhancements

- [ ] Voice input support
- [ ] Multi-language conversations
- [ ] Advanced lead filtering
- [ ] A/B testing for emails
- [ ] Automated follow-up sequences
- [ ] Integration with CRM systems
- [ ] WhatsApp/SMS campaigns
- [ ] Video message support

## 📞 Support

For issues or questions:
1. Check console logs
2. Review API responses
3. Test with simple queries first
4. Verify all API keys are configured

---

**Built with ❤️ using Next.js, OpenAI, Apify, and Sender API**
