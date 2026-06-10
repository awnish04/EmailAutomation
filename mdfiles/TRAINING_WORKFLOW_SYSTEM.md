# 🤖 Training & Workflow System - Complete Guide

## Overview

Your chatbot now has an advanced training and workflow system. This system enables the chatbot to:

1. **Train from custom data** - Teach your business-specific information
2. **Execute multi-step workflows** - Automatically complete complex tasks
3. **Remember conversation context** - Store user preferences and history
4. **Track performance** - Measure agent effectiveness

---

## 🎓 Training System

### Features

- **Custom Training Data** - Add your FAQs, product info, processes
- **Semantic Search** - AI-powered relevant answer finding
- **Auto Keywords** - Automatic keyword extraction
- **Priority System** - Prioritize important answers
- **Usage Tracking** - Tracks which answers are frequently used
- **Bulk Import/Export** - Import/export data in JSON format

### API Endpoints

#### 1. Add Training Data
```http
POST /api/training
Content-Type: application/json

{
  "category": "faq",
  "question": "How do I find leads in a specific location?",
  "answer": "You can find leads by telling me: 'Find 100 [target audience] in [location]'. For example: 'Find 100 real estate agents in New York'",
  "keywords": ["leads", "location", "find", "search"],
  "priority": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "category": "faq",
    "question": "...",
    "answer": "...",
    "keywords": ["leads", "location", "find", "search"],
    "priority": 5,
    "usageCount": 0
  }
}
```

#### 2. Get All Training Data
```http
GET /api/training
```

**Response:**
```json
{
  "data": [...],
  "grouped": {
    "faq": [...],
    "product": [...],
    "workflow": [...]
  },
  "total": 25,
  "categories": ["faq", "product", "workflow"]
}
```

#### 3. Search Training Data
```http
GET /api/training?query=how to find leads
```

**Response:**
```json
{
  "results": [
    {
      "id": "...",
      "question": "How do I find leads?",
      "answer": "...",
      "score": 0.89,
      "keywords": [...]
    }
  ]
}
```

#### 4. Update Training Data
```http
PATCH /api/training
Content-Type: application/json

{
  "id": "clxxx...",
  "answer": "Updated answer...",
  "priority": 10
}
```

#### 5. Delete Training Data
```http
DELETE /api/training?id=clxxx...
```

#### 6. Bulk Import
```http
POST /api/training/bulk
Content-Type: application/json

{
  "data": [
    {
      "category": "faq",
      "question": "...",
      "answer": "..."
    },
    {
      "category": "product",
      "question": "...",
      "answer": "..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "imported": 45,
  "failed": 2,
  "results": [...]
}
```

#### 7. Export All Data
```http
GET /api/training/bulk
```

**Response:**
```json
{
  "exportedAt": "2025-05-18T10:00:00Z",
  "totalRecords": 47,
  "data": [...]
}
```

### Training Categories

- **faq** - Frequently Asked Questions
- **product** - Product/Service Information
- **workflow** - Process Instructions
- **custom** - Custom Categories

### Example Training Data

```json
[
  {
    "category": "faq",
    "question": "What is the best time to send cold emails?",
    "answer": "The best time to send cold emails is Tuesday-Thursday, between 10 AM - 11 AM or 2 PM - 3 PM in the recipient's timezone. Avoid Mondays (too busy) and Fridays (weekend mode).",
    "keywords": ["email", "timing", "best time", "send"],
    "priority": 8
  },
  {
    "category": "product",
    "question": "What is your pricing?",
    "answer": "We have 3 plans: Starter ($49/mo - 500 leads), Pro ($99/mo - 2000 leads), and Enterprise ($299/mo - unlimited). All plans include AI email generation and tracking.",
    "keywords": ["pricing", "cost", "plans", "subscription"],
    "priority": 10
  },
  {
    "category": "workflow",
    "question": "How do I create a campaign?",
    "answer": "To create a campaign: 1) Tell me your target audience and location, 2) I'll find leads, 3) Review the leads, 4) I'll send personalized emails, 5) Track results in dashboard.",
    "keywords": ["campaign", "create", "process", "steps"],
    "priority": 7
  }
]
```

---

## ⚙️ Workflow System

### Features

- **Multi-Step Workflows** - Complex automation with multiple steps
- **Conditional Logic** - If/else branching
- **AI Decisions** - Let AI choose the best path
- **Delays** - Wait between steps
- **Variable Substitution** - Dynamic data in workflows
- **Execution Tracking** - Monitor workflow progress
- **Pre-built Templates** - Ready-to-use workflows

### Workflow Step Types

1. **Action** - Execute an action (find leads, send emails, etc.)
2. **Condition** - If/else logic
3. **Delay** - Wait for specified time
4. **Input** - Wait for user input
5. **AI Decision** - Let AI decide next step

### API Endpoints

#### 1. Get Workflow Templates
```http
GET /api/workflows?templates=true
```

**Response:**
```json
{
  "templates": [
    {
      "id": "lead_generation_campaign",
      "name": "Lead Generation Campaign",
      "description": "Find leads and send personalized emails",
      "trigger": "manual",
      "steps": [...]
    }
  ]
}
```

#### 2. Create Workflow from Template
```http
POST /api/workflows
Content-Type: application/json

{
  "templateId": "lead_generation_campaign",
  "name": "My Lead Campaign"
}
```

#### 3. Create Custom Workflow
```http
POST /api/workflows
Content-Type: application/json

{
  "name": "Custom Workflow",
  "description": "My custom automation",
  "trigger": "manual",
  "steps": [
    {
      "id": "step1",
      "type": "action",
      "name": "Find Leads",
      "config": {
        "action": "find_leads",
        "params": {
          "targetAudience": "{{targetAudience}}",
          "location": "{{location}}",
          "leadCount": 100
        }
      },
      "nextStep": "step2"
    },
    {
      "id": "step2",
      "type": "delay",
      "name": "Wait 5 minutes",
      "config": {
        "duration": 300000
      },
      "nextStep": "step3"
    },
    {
      "id": "step3",
      "type": "action",
      "name": "Send Emails",
      "config": {
        "action": "send_emails",
        "params": {
          "campaignId": "{{campaignId}}"
        }
      }
    }
  ]
}
```

#### 4. Execute Workflow
```http
POST /api/workflows/execute
Content-Type: application/json

{
  "workflowId": "clxxx...",
  "input": {
    "targetAudience": "real estate agents",
    "location": "New York",
    "leadCount": 200
  }
}
```

**Response:**
```json
{
  "success": true,
  "executionId": "exec_xxx...",
  "message": "Workflow execution started"
}
```

#### 5. Check Execution Status
```http
GET /api/workflows/execute?executionId=exec_xxx...
```

**Response:**
```json
{
  "execution": {
    "id": "exec_xxx...",
    "workflowId": "...",
    "status": "running",
    "currentStep": 2,
    "stepResults": [
      {
        "stepId": "step1",
        "stepName": "Find Leads",
        "result": { "campaignId": "...", "leadsFound": 200 },
        "timestamp": "..."
      }
    ],
    "startedAt": "...",
    "completedAt": null
  }
}
```

#### 6. Get All User Workflows
```http
GET /api/workflows
```

#### 7. Update Workflow
```http
PATCH /api/workflows
Content-Type: application/json

{
  "id": "clxxx...",
  "name": "Updated Name",
  "steps": [...]
}
```

#### 8. Delete Workflow
```http
DELETE /api/workflows?id=clxxx...
```

#### 9. Cancel Execution
```http
DELETE /api/workflows/execute?executionId=exec_xxx...
```

### Available Actions

- **find_leads** - Find leads using Apify
- **send_emails** - Send emails to leads
- **create_campaign** - Create new campaign
- **update_campaign** - Update campaign data
- **send_notification** - Send notification (future)

### Workflow Example: Conditional Outreach

```json
{
  "name": "Smart Outreach",
  "trigger": "manual",
  "steps": [
    {
      "id": "step1",
      "type": "action",
      "name": "Find Leads",
      "config": {
        "action": "find_leads",
        "params": {
          "targetAudience": "{{targetAudience}}",
          "location": "{{location}}",
          "leadCount": "{{leadCount}}"
        }
      },
      "nextStep": "step2"
    },
    {
      "id": "step2",
      "type": "condition",
      "name": "Check Lead Count",
      "config": {
        "variable": "leadsFound",
        "operator": "greater_than",
        "value": 50
      },
      "onSuccess": "step3",
      "onFailure": "step4"
    },
    {
      "id": "step3",
      "type": "action",
      "name": "Bulk Email Campaign",
      "config": {
        "action": "send_emails",
        "params": {
          "campaignId": "{{campaignId}}",
          "template": "bulk"
        }
      }
    },
    {
      "id": "step4",
      "type": "action",
      "name": "Personalized Outreach",
      "config": {
        "action": "send_emails",
        "params": {
          "campaignId": "{{campaignId}}",
          "template": "personalized"
        }
      }
    }
  ]
}
```

---

## 💬 Enhanced Chat API

### Endpoint
```http
POST /api/chat/enhanced
```

### Features

- Uses training data automatically
- Can execute workflows
- Remembers conversation context
- Saves user preferences
- Tracks metrics

### Request
```json
{
  "message": "Find 100 real estate agents in New York",
  "sessionId": "session_xxx..."
}
```

### Response
```json
{
  "message": "🚀 I'm starting to find 100 real estate agents in New York...",
  "intent": "FIND_LEADS",
  "actionsTaken": [
    {
      "type": "workflow_execution",
      "workflowId": "...",
      "executionId": "...",
      "workflowName": "Lead Generation Campaign"
    }
  ],
  "trainingDataUsed": true,
  "stats": {
    "totalLeads": 500,
    "totalSent": 400,
    "totalOpened": 200,
    "totalReplied": 50
  },
  "sessionId": "session_xxx..."
}
```

### How It Works

1. **User sends message** → System searches training data
2. **Finds relevant answers** → Includes in AI prompt
3. **AI generates response** → Uses training data + context
4. **Detects intent** → Can trigger workflows automatically
5. **Saves to context** → Remembers for future conversations
6. **Records metrics** → Tracks performance

---

## 📊 Context & Memory System

### Features

- **Short-term Memory** - Last 10 messages
- **Long-term Memory** - Persistent data across sessions
- **User Preferences** - Saved preferences
- **Conversation Summary** - AI-generated summaries
- **Entity Extraction** - Names, locations, dates, etc.
- **Sentiment Analysis** - Positive/neutral/negative

### Usage in Code

```typescript
import { ContextManager } from '@/lib/context/context-manager'

// Get or create context
const context = await ContextManager.getOrCreateContext(userId, sessionId)

// Add message
await ContextManager.addMessage(sessionId, {
  role: 'user',
  content: 'Find leads in New York',
  intent: 'FIND_LEADS'
})

// Save preference
await ContextManager.updatePreferences(sessionId, {
  preferredLocation: 'New York',
  preferredLeadCount: 100
})

// Get preferences
const prefs = await ContextManager.getPreferences(sessionId)

// Save long-term memory
await ContextManager.updateLongTermMemory(sessionId, 'lastCampaign', {
  name: 'NYC Campaign',
  date: new Date()
})

// Generate summary
const summary = await ContextManager.generateSummary(sessionId)
```

---

## 📈 Metrics & Analytics

### Tracked Metrics

- Total messages
- Successful intents
- Failed intents
- Average response time
- Average sentiment
- Helpful/not helpful count
- Average rating
- Workflows started/completed/failed

### Database Schema

```prisma
model AgentMetrics {
  id                 String   @id @default(cuid())
  userId             String
  date               DateTime
  
  totalMessages      Int
  successfulIntents  Int
  failedIntents      Int
  
  avgResponseTime    Float
  avgSentiment       Float
  
  helpfulCount       Int
  notHelpfulCount    Int
  avgRating          Float
  
  workflowsStarted   Int
  workflowsCompleted Int
  workflowsFailed    Int
}
```

---

## 🚀 Quick Start Guide

### 1. Add Training Data

```bash
curl -X POST http://localhost:3000/api/training \
  -H "Content-Type: application/json" \
  -d '{
    "category": "faq",
    "question": "How do I find leads?",
    "answer": "Tell me: Find [count] [audience] in [location]",
    "priority": 10
  }'
```

### 2. Create Workflow

```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "lead_generation_campaign",
    "name": "My First Workflow"
  }'
```

### 3. Chat with Enhanced Agent

```bash
curl -X POST http://localhost:3000/api/chat/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Find 100 real estate agents in New York",
    "sessionId": "session_123"
  }'
```

---

## 🔧 Integration with Existing Chatbot

### Update Your Chat Component

```typescript
// Instead of /api/chat/agent
const response = await fetch('/api/chat/enhanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    sessionId: sessionId // Generate once per session
  })
})

const data = await response.json()

// data.message - AI response
// data.intent - Detected intent
// data.actionsTaken - Actions performed
// data.trainingDataUsed - Whether training data was used
```

---

## 📝 Best Practices

### Training Data

1. **Be Specific** - Write clear, detailed answers
2. **Use Keywords** - Add relevant keywords for better matching
3. **Set Priorities** - Important answers get priority 8-10
4. **Update Regularly** - Keep data current
5. **Test Searches** - Verify answers are found correctly

### Workflows

1. **Start Simple** - Begin with basic workflows
2. **Test Thoroughly** - Test each step
3. **Use Variables** - Make workflows reusable
4. **Add Delays** - Don't rush between steps
5. **Handle Errors** - Plan for failures

### Context Management

1. **Unique Session IDs** - One per conversation
2. **Clean Old Data** - Remove old contexts regularly
3. **Save Important Info** - Use long-term memory wisely
4. **Respect Privacy** - Don't store sensitive data

---

## 🐛 Troubleshooting

### Training Data Not Working

- Check if data is marked `isActive: true`
- Verify keywords are relevant
- Test search with `/api/training?query=...`
- Check priority levels

### Workflow Not Executing

- Verify workflow is `isActive: true`
- Check step configuration
- Look at execution logs
- Verify user has permissions

### Context Not Saving

- Ensure sessionId is consistent
- Check database connection
- Verify user is authenticated

---

## 📚 Database Schema

Add this schema to your existing `schema.prisma`:

```prisma
// See prisma/schema-update.prisma for complete schema
```

### Migration Commands

```bash
# Generate Prisma client
npm run db:generate

# Create migration
npx prisma migrate dev --name add_training_workflow_system

# Apply migration
npx prisma migrate deploy
```

---

## 🎯 Next Steps

1. **Add Training Data** - Start with 20-30 FAQs
2. **Create Workflows** - Use templates first
3. **Test Enhanced Chat** - Try different queries
4. **Monitor Metrics** - Check performance
5. **Iterate** - Improve based on usage

---

## 📞 Support

Questions? Issues?
- Check logs: `console.log` in API routes
- Test endpoints: Use Postman/curl
- Database: `npm run db:studio`

---

**Status:** ✅ Training & Workflow System Complete!

**Files Created:**
- `lib/training/training-manager.ts`
- `lib/workflow/workflow-engine.ts`
- `lib/context/context-manager.ts`
- `app/api/training/route.ts`
- `app/api/training/bulk/route.ts`
- `app/api/workflows/route.ts`
- `app/api/workflows/execute/route.ts`
- `app/api/chat/enhanced/route.ts`
- `prisma/schema-update.prisma`

**Ready to use!** 🚀
