# 🚀 Quick Start Guide - Conversational AI Chatbot

## ⚡ 5-Minute Setup

### 1. Install Dependencies (if not already done)
```bash
cd aiemailmarketing
npm install
```

### 2. Configure Environment Variables
```bash
# .env.local
OPENAI_API_KEY=sk-proj-...
APIFY_API_KEY=apify_api_...
SENDER_API_KEY=...
DATABASE_URL=postgresql://...
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Chat Interface
```
http://localhost:3000/dashboard/chat
```

---

## 🎯 Quick Test (2 minutes)

### Test 1: Simple Conversation
```
You: "Hello"
AI: [Welcome message]

You: "I build websites and need clients"
AI: [Asks for details]

You: "Real estate agents in California, 100"
AI: [Shows confirmation]

You: "Yes"
AI: [Starts campaign, redirects to dashboard]
```

### Test 2: Using Form
```
You: "Help me find clients"
AI: [Shows form]

[Fill form]:
- Business: "Marketing services"
- Target: "Small businesses"
- Location: "Texas"
- Count: 200

[Submit]
AI: [Confirms and starts]
```

---

## 📁 Key Files

### Main Files:
1. **`lib/agents/conversational-agent.ts`** - AI logic
2. **`app/api/chat/agent/route.ts`** - API endpoint
3. **`app/(dashboard)/dashboard/chat/page.tsx`** - UI

### Documentation:
1. **`CONVERSATIONAL_AI_SYSTEM.md`** - Complete docs
2. **`TESTING_GUIDE.md`** - Test scenarios
3. **`SYSTEM_FLOW_DIAGRAM.md`** - Visual diagrams
4. **`IMPLEMENTATION_SUMMARY.md`** - Overview

---

## 🎨 Customization

### Change Business Context:
Edit `lib/agents/conversational-agent.ts`:
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

### Add Form Fields:
In `generateFormFields()` method:
```typescript
fields.push({
  name: 'industry',
  label: 'What industry?',
  type: 'select',
  required: true,
  options: ['Real Estate', 'Healthcare', 'Tech']
})
```

---

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Dev server running
- [ ] Chat page loads
- [ ] AI responds to messages
- [ ] Forms appear when needed
- [ ] Campaign creates successfully
- [ ] Dashboard shows updates

---

## 🐛 Quick Troubleshooting

### AI not responding?
```bash
# Check OpenAI key
echo $OPENAI_API_KEY

# Check console
# Browser DevTools → Console
```

### Form not showing?
- Clear browser cache
- Check console for errors
- Verify API response

### Campaign not starting?
- Check database connection
- Verify API keys
- Review backend logs

---

## 📚 Learn More

- **Full Documentation**: `CONVERSATIONAL_AI_SYSTEM.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **System Diagrams**: `SYSTEM_FLOW_DIAGRAM.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`

---

## 🎉 You're Ready!

The system is complete and ready to use. Just:
1. ✅ Configure your API keys
2. ✅ Test the chat interface
3. ✅ Customize as needed
4. ✅ Deploy to production

**Happy chatting! 🤖**
