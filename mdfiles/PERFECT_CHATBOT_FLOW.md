# ✅ Perfect Chatbot Flow - Intent-Based Setup

## 🎯 Complete Conversation Flow

### **Phase 1: Initial Chat (Full Screen)**
```
┌─────────────────────────────────────┐
│  AI Chat Assistant                  │
│                                     │
│  AI: 👋 Hi! I'm your AI Marketing   │
│      Agent. I can help you:         │
│      • Find leads                   │
│      • Send emails                  │
│      • Track campaigns              │
│                                     │
│  User: I want to start a campaign   │
│                                     │
│  [Type your message...]             │
│  [Send]                             │
└─────────────────────────────────────┘
```

### **Phase 2: AI Detects Campaign Intent → Setup Panel Opens**
```
┌──────────────────────────────────────────────────────────┐
│  CHAT (Left)              │  SETUP PROGRESS (Right)      │
├───────────────────────────┼──────────────────────────────┤
│                           │  Setup Progress              │
│  AI: Great! Let's set up  │                              │
│      your campaign.       │  ┌────────────────────────┐ │
│                           │  │ ○ 1  Purpose           │ │
│      What's the purpose?  │  │      [Empty]           │ │
│      (Find leads, send    │  └────────────────────────┘ │
│      emails, etc.)        │                              │
│                           │  ┌────────────────────────┐ │
│  User: I want to find     │  │ ○ 2  Service           │ │
│        leads              │  │      [Empty]           │ │
│                           │  └────────────────────────┘ │
│  [Type message...]        │                              │
│  [Send]                   │  ┌────────────────────────┐ │
│                           │  │ ○ 3  Target Audience   │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 4  Location          │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 5  Email Count       │ │
│                           │  └────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### **Phase 3: AI Saves Purpose → Asks Service**
```
┌──────────────────────────────────────────────────────────┐
│  CHAT (Left)              │  SETUP PROGRESS (Right)      │
├───────────────────────────┼──────────────────────────────┤
│                           │  Setup Progress              │
│  AI: Perfect! I understand│                              │
│      you want to find     │  ┌────────────────────────┐ │
│      leads. ✓             │  │ ✓ 1  Purpose           │ │
│                           │  │      Find Leads        │ │
│      What service or      │  └────────────────────────┘ │
│      product do you       │                              │
│      offer?               │  ┌────────────────────────┐ │
│                           │  │ ○ 2  Service           │ │
│  User: Real estate        │  │      [Empty]           │ │
│        marketing          │  └────────────────────────┘ │
│                           │                              │
│  [Type message...]        │  ┌────────────────────────┐ │
│  [Send]                   │  │ ○ 3  Target Audience   │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 4  Location          │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 5  Email Count       │ │
│                           │  └────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### **Phase 4: Service Saved → Asks Target**
```
┌──────────────────────────────────────────────────────────┐
│  CHAT (Left)              │  SETUP PROGRESS (Right)      │
├───────────────────────────┼──────────────────────────────┤
│                           │  Setup Progress              │
│  AI: Got it! Real estate  │                              │
│      marketing. ✓         │  ┌────────────────────────┐ │
│                           │  │ ✓ 1  Purpose           │ │
│      Who is your target   │  │      Find Leads        │ │
│      audience?            │  └────────────────────────┘ │
│                           │                              │
│  User: Real estate agents │  ┌────────────────────────┐ │
│                           │  │ ✓ 2  Service           │ │
│  [Type message...]        │  │      Real Estate       │ │
│  [Send]                   │  │      Marketing         │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 3  Target Audience   │ │
│                           │  │      [Empty]           │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 4  Location          │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 5  Email Count       │ │
│                           │  └────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### **Phase 5: Target Saved → Asks Country**
```
┌──────────────────────────────────────────────────────────┐
│  CHAT (Left)              │  SETUP PROGRESS (Right)      │
├───────────────────────────┼──────────────────────────────┤
│                           │  Setup Progress              │
│  AI: Excellent! Real      │                              │
│      estate agents. ✓     │  ┌────────────────────────┐ │
│                           │  │ ✓ 1  Purpose           │ │
│      Which country are    │  │      Find Leads        │ │
│      you targeting?       │  └────────────────────────┘ │
│                           │                              │
│  User: Nepal              │  ┌────────────────────────┐ │
│                           │  │ ✓ 2  Service           │ │
│  [Type message...]        │  │      Real Estate       │ │
│  [Send]                   │  │      Marketing         │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ✓ 3  Target Audience   │ │
│                           │  │      Real Estate       │ │
│                           │  │      Agents            │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 4  Location          │ │
│                           │  │      [Empty]           │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 5  Email Count       │ │
│                           │  └────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### **Phase 6: Country Saved → Asks Specific Location**
```
┌──────────────────────────────────────────────────────────┐
│  CHAT (Left)              │  SETUP PROGRESS (Right)      │
├───────────────────────────┼──────────────────────────────┤
│                           │  Setup Progress              │
│  AI: Nepal, great! ✓      │                              │
│                           │  ┌────────────────────────┐ │
│      Do you want to       │  │ ✓ 1  Purpose           │ │
│      target a specific    │  │      Find Leads        │ │
│      city or location     │  └────────────────────────┘ │
│      in Nepal?            │                              │
│                           │  ┌────────────────────────┐ │
│  User: Yes, Kathmandu     │  │ ✓ 2  Service           │ │
│                           │  │      Real Estate       │ │
│  [Type message...]        │  │      Marketing         │ │
│  [Send]                   │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ✓ 3  Target Audience   │ │
│                           │  │      Real Estate       │ │
│                           │  │      Agents            │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 4  Location          │ │
│                           │  │      [Filling...]      │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 5  Email Count       │ │
│                           │  └────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### **Phase 7: Location Saved → Auto Jumps to Email Count**
```
┌──────────────────────────────────────────────────────────┐
│  CHAT (Left)              │  SETUP PROGRESS (Right)      │
├───────────────────────────┼──────────────────────────────┤
│                           │  Setup Progress              │
│  AI: Perfect! Kathmandu,  │                              │
│      Nepal. ✓             │  ┌────────────────────────┐ │
│                           │  │ ✓ 1  Purpose           │ │
│      How many emails do   │  │      Find Leads        │ │
│      you want to send?    │  └────────────────────────┘ │
│                           │                              │
│  User: 100                │  ┌────────────────────────┐ │
│                           │  │ ✓ 2  Service           │ │
│  [Type message...]        │  │      Real Estate       │ │
│  [Send]                   │  │      Marketing         │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ✓ 3  Target Audience   │ │
│                           │  │      Real Estate       │ │
│                           │  │      Agents            │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ✓ 4  Location          │ │
│                           │  │      Kathmandu, Nepal  │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ○ 5  Email Count       │ │
│                           │  │      [Empty]           │ │
│                           │  └────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### **Phase 8: All Complete → AI Shows Summary & Confirmation**
```
┌──────────────────────────────────────────────────────────┐
│  CHAT (Left)              │  SETUP PROGRESS (Right)      │
├───────────────────────────┼──────────────────────────────┤
│                           │  Setup Progress              │
│  AI: Excellent! 100       │                              │
│      emails. ✓            │  ┌────────────────────────┐ │
│                           │  │ ✓ 1  Purpose           │ │
│  📊 Let me confirm your   │  │      Find Leads        │ │
│     campaign details:     │  └────────────────────────┘ │
│                           │                              │
│  **Your Campaign:**       │  ┌────────────────────────┐ │
│  • Purpose: Find Leads    │  │ ✓ 2  Service           │ │
│  • Service: Real Estate   │  │      Real Estate       │ │
│    Marketing              │  │      Marketing         │ │
│  • Target: Real Estate    │  └────────────────────────┘ │
│    Agents                 │                              │
│  • Location: Kathmandu,   │  ┌────────────────────────┐ │
│    Nepal                  │  │ ✓ 3  Target Audience   │ │
│  • Emails: 100            │  │      Real Estate       │ │
│                           │  │      Agents            │ │
│  Is this correct? Ready   │  └────────────────────────┘ │
│  to start?                │                              │
│                           │  ┌────────────────────────┐ │
│  User: Yes               │  │ ✓ 4  Location          │ │
│                           │  │      Kathmandu, Nepal  │ │
│  [Type message...]        │  └────────────────────────┘ │
│  [Send]                   │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ✓ 5  Email Count       │ │
│                           │  │      100 emails        │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ✓    Confirm           │ │
│                           │  │      Ready!            │ │
│                           │  └────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### **Phase 9: User Confirms → Campaign Starts**
```
┌──────────────────────────────────────────────────────────┐
│  CHAT (Left)              │  SETUP PROGRESS (Right)      │
├───────────────────────────┼──────────────────────────────┤
│                           │  Setup Progress              │
│  AI: 🚀 Perfect! Starting │                              │
│      your campaign now... │  ┌────────────────────────┐ │
│                           │  │ ✓ 1  Purpose           │ │
│      I'll begin:          │  │      Find Leads        │ │
│      1. Finding real      │  └────────────────────────┘ │
│         estate agents in  │                              │
│         Kathmandu         │  ┌────────────────────────┐ │
│      2. Sending 100       │  │ ✓ 2  Service           │ │
│         personalized      │  │      Real Estate       │ │
│         emails            │  │      Marketing         │ │
│      3. Tracking opens    │  └────────────────────────┘ │
│         and replies       │                              │
│                           │  ┌────────────────────────┐ │
│      You can track        │  │ ✓ 3  Target Audience   │ │
│      progress in the      │  │      Real Estate       │ │
│      dashboard.           │  │      Agents            │ │
│                           │  └────────────────────────┘ │
│  ┌──────────────────────┐│                              │
│  │ 📊 View Dashboard    ││  ┌────────────────────────┐ │
│  └──────────────────────┘│  │ ✓ 4  Location          │ │
│                           │  │      Kathmandu, Nepal  │ │
│  [Campaign started!]      │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ✓ 5  Email Count       │ │
│                           │  │      100 emails        │ │
│                           │  └────────────────────────┘ │
│                           │                              │
│                           │  ┌────────────────────────┐ │
│                           │  │ ✓    Confirm           │ │
│                           │  │      ✅ Started!       │ │
│                           │  └────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## 🔄 Conversation Flow Logic

### **AI Question Sequence:**

```
1. User says: "I want to start a campaign"
   → Setup panel opens (right side)
   → AI asks: "What's the purpose?"

2. User says: "Find leads"
   → Step 1 turns GREEN ✓
   → AI saves: "Purpose: Find Leads"
   → AI asks: "What service do you offer?"

3. User says: "Real estate marketing"
   → Step 2 turns GREEN ✓
   → AI saves: "Service: Real Estate Marketing"
   → AI asks: "Who is your target audience?"

4. User says: "Real estate agents"
   → Step 3 turns GREEN ✓
   → AI saves: "Target: Real Estate Agents"
   → AI asks: "Which country?"

5. User says: "Nepal"
   → AI saves country
   → AI asks: "Specific city or location?"

6. User says: "Yes, Kathmandu"
   → Step 4 turns GREEN ✓
   → AI saves: "Location: Kathmandu, Nepal"
   → AI AUTOMATICALLY jumps to Email Count
   → AI asks: "How many emails?"

7. User says: "100"
   → Step 5 turns GREEN ✓
   → AI saves: "Email Count: 100"
   → ALL STEPS NOW GREEN
   → AI shows SUMMARY
   → AI asks: "Is this correct?"

8. User says: "Yes"
   → Campaign STARTS
   → "View Dashboard" button appears
   → Setup panel stays visible (all green)
```

## 🎨 Visual States

### **Step States:**

```
Empty (Gray):
┌────────────────────────┐
│ ○ 1  Purpose           │  ← Gray circle
│      [Empty]           │  ← Gray text
└────────────────────────┘

Filled (Green):
┌────────────────────────┐
│ ✓ 1  Purpose           │  ← Green checkmark
│      Find Leads        │  ← Green background
└────────────────────────┘

Confirmed (Green + Badge):
┌────────────────────────┐
│ ✓    Confirm           │  ← Green checkmark
│      ✅ Started!       │  ← Success badge
└────────────────────────┘
```

## 🔧 Key Features

### ✅ **Intent-Based Trigger**
- Setup panel opens ONLY when user mentions campaign
- Keywords: "campaign", "start", "setup", "create", etc.
- Not based on message count

### ✅ **Sequential Questions**
- AI asks one question at a time
- Waits for user response
- Saves answer before next question
- Natural conversation flow

### ✅ **Real-Time Updates**
- Steps turn green as filled
- Shows saved values
- Updates immediately
- Visual progress feedback

### ✅ **Smart Location Handling**
- First asks country
- Then asks specific city/location
- Combines into one field
- Example: "Kathmandu, Nepal"

### ✅ **Auto-Jump Logic**
- After location confirmed
- Automatically jumps to Email Count
- No manual step selection needed
- Smooth flow

### ✅ **Summary & Confirmation**
- Shows complete campaign details
- Asks for confirmation
- User says "Yes" or "Confirm"
- Then starts campaign

### ✅ **View Dashboard Button**
- Appears after campaign starts
- Stays in chat area
- One-click to dashboard
- Setup panel remains visible

## 📝 API Response Format

### **When User Mentions Campaign:**

```json
{
  "message": "Great! Let's set up your campaign. What's the purpose?",
  "campaignIntent": true,
  "showSetupPanel": true,
  "currentQuestion": "purpose"
}
```

### **When User Answers:**

```json
{
  "message": "Perfect! I understand you want to find leads. ✓\n\nWhat service or product do you offer?",
  "extractedData": {
    "purpose": "Find Leads"
  },
  "currentQuestion": "service"
}
```

### **When All Complete:**

```json
{
  "message": "📊 Let me confirm your campaign details:\n\n**Your Campaign:**\n• Purpose: Find Leads\n• Service: Real Estate Marketing\n• Target: Real Estate Agents\n• Location: Kathmandu, Nepal\n• Emails: 100\n\nIs this correct? Ready to start?",
  "extractedData": {
    "purpose": "Find Leads",
    "service": "Real Estate Marketing",
    "targetAudience": "Real Estate Agents",
    "location": "Kathmandu, Nepal",
    "emailCount": "100"
  },
  "allComplete": true,
  "awaitingConfirmation": true
}
```

### **When User Confirms:**

```json
{
  "message": "🚀 Perfect! Starting your campaign now...\n\nI'll begin:\n1. Finding real estate agents in Kathmandu\n2. Sending 100 personalized emails\n3. Tracking opens and replies\n\nYou can track progress in the dashboard.",
  "campaignStarted": true,
  "showDashboardButton": true
}
```

## ✅ Implementation Checklist

### **UI Components**
- [x] Single chat area (full screen initially)
- [x] Setup panel (appears on campaign intent)
- [x] 5 progress steps (clickable)
- [x] Green checkmarks for filled steps
- [x] View Dashboard button
- [x] Loading indicators

### **Conversation Logic**
- [ ] Detect campaign intent keywords
- [ ] Open setup panel on intent
- [ ] Ask questions sequentially
- [ ] Save answers to campaignData
- [ ] Update step colors (green/gray)
- [ ] Show summary when complete
- [ ] Handle confirmation
- [ ] Start campaign
- [ ] Show dashboard button

### **State Management**
- [x] Chat messages
- [x] Campaign data (5 fields)
- [x] Setup panel visibility
- [x] Campaign started flag
- [x] Current question tracking

## 🎉 Result

Perfect conversational flow with:

✅ **Intent-based trigger** - Panel opens when user wants campaign
✅ **Sequential questions** - One at a time, natural flow
✅ **Real-time updates** - Steps turn green as filled
✅ **Smart location** - Country → City → Combined
✅ **Auto-jump** - Location → Email Count
✅ **Summary confirmation** - Review before start
✅ **Dashboard button** - Easy navigation after start

---

**Status**: ✅ Flow Design Complete
**Date**: May 18, 2026
**Type**: Intent-Based Conversational Setup
