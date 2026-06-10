# 🚀 Quick Setup Guide - Training & Workflow System

## Step 1: Update Database Schema

### 1.1 Open your `prisma/schema.prisma` file

### 1.2 Add these models at the end:

```prisma
// Training Data for Chatbot
model TrainingData {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  category    String
  question    String   @db.Text
  answer      String   @db.Text
  keywords    String[]
  
  isActive    Boolean  @default(true)
  priority    Int      @default(0)
  
  usageCount  Int      @default(0)
  lastUsedAt  DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId, category])
  @@index([keywords])
}

// Workflow Definitions
model Workflow {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name        String
  description String?  @db.Text
  trigger     String
  triggerData Json?
  
  steps       Json
  isActive    Boolean  @default(true)
  
  executionCount Int   @default(0)
  lastExecutedAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  executions  WorkflowExecution[]
  
  @@index([userId, isActive])
}

// Workflow Execution History
model WorkflowExecution {
  id          String   @id @default(cuid())
  workflowId  String
  workflow    Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  status      String
  currentStep Int      @default(0)
  
  input       Json?
  output      Json?
  stepResults Json[]
  
  error       String?  @db.Text
  
  startedAt   DateTime @default(now())
  completedAt DateTime?
  
  @@index([workflowId, status])
  @@index([userId, startedAt])
}

// Conversation Context & Memory
model ConversationContext {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  sessionId   String   @unique
  
  currentIntent    String?
  currentWorkflow  String?
  pendingActions   Json[]
  
  preferences      Json     @default("{}")
  shortTermMemory  Json[]   @default([])
  longTermMemory   Json     @default("{}")
  
  summary          String?  @db.Text
  
  lastInteraction  DateTime @default(now())
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  messages         ChatMessage[]
  
  @@index([userId, sessionId])
  @@index([lastInteraction])
}

// Chat Messages with Enhanced Tracking
model ChatMessage {
  id          String   @id @default(cuid())
  contextId   String
  context     ConversationContext @relation(fields: [contextId], references: [id], onDelete: Cascade)
  
  role        String
  content     String   @db.Text
  
  intent      String?
  entities    Json?
  sentiment   String?
  
  actionsTaken Json[]  @default([])
  
  wasHelpful  Boolean?
  feedback    String?  @db.Text
  
  timestamp   DateTime @default(now())
  
  @@index([contextId, timestamp])
}

// Agent Learning & Feedback
model AgentFeedback {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  messageId   String?
  
  feedbackType String
  rating      Int?
  
  userMessage  String  @db.Text
  agentResponse String @db.Text
  
  comment     String?  @db.Text
  
  issueCategory String?
  
  resolved    Boolean  @default(false)
  resolution  String?  @db.Text
  
  createdAt   DateTime @default(now())
  
  @@index([userId, feedbackType])
  @@index([resolved])
}

// Agent Performance Metrics
model AgentMetrics {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  date        DateTime @default(now())
  
  totalMessages      Int @default(0)
  successfulIntents  Int @default(0)
  failedIntents      Int @default(0)
  
  avgResponseTime    Float @default(0)
  avgSentiment       Float @default(0)
  
  helpfulCount       Int @default(0)
  notHelpfulCount    Int @default(0)
  avgRating          Float @default(0)
  
  workflowsStarted   Int @default(0)
  workflowsCompleted Int @default(0)
  workflowsFailed    Int @default(0)
  
  @@unique([userId, date])
  @@index([date])
}
```

### 1.3 Update your User model to add relations:

Find your `model User` and add these lines at the end (inside the model):

```prisma
  trainingData         TrainingData[]
  workflows            Workflow[]
  workflowExecutions   WorkflowExecution[]
  conversationContexts ConversationContext[]
  agentFeedback        AgentFeedback[]
  agentMetrics         AgentMetrics[]
```

## Step 2: Run Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Create migration
npx prisma migrate dev --name add_training_workflow_system

# If migration fails, try:
npx prisma db push
```

## Step 3: Import Sample Training Data

### Option A: Using API (Recommended)

```bash
# Import the example training data
curl -X POST http://localhost:3000/api/training/bulk \
  -H "Content-Type: application/json" \
  -d @training-data-examples.json
```

### Option B: Using Prisma Studio

```bash
# Open Prisma Studio
npm run db:studio

# Manually add training data through the UI
```

## Step 4: Test the System

### 4.1 Test Training API

```bash
# Get all training data
curl http://localhost:3000/api/training

# Search training data
curl "http://localhost:3000/api/training?query=how to find leads"

# Add new training data
curl -X POST http://localhost:3000/api/training \
  -H "Content-Type: application/json" \
  -d '{
    "category": "faq",
    "question": "Test question?",
    "answer": "Test answer",
    "priority": 5
  }'
```

### 4.2 Test Workflow API

```bash
# Get workflow templates
curl "http://localhost:3000/api/workflows?templates=true"

# Create workflow from template
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "lead_generation_campaign",
    "name": "My Test Workflow"
  }'
```

### 4.3 Test Enhanced Chat

```bash
# Chat with enhanced agent
curl -X POST http://localhost:3000/api/chat/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I find leads?",
    "sessionId": "test-session-123"
  }'
```

## Step 5: Update Your Frontend

### 5.1 Update Chat Component

Replace `/api/chat/agent` with `/api/chat/enhanced`:

```typescript
// Before
const response = await fetch('/api/chat/agent', {
  method: 'POST',
  body: JSON.stringify({ message, history })
})

// After
const response = await fetch('/api/chat/enhanced', {
  method: 'POST',
  body: JSON.stringify({ 
    message, 
    sessionId: generateSessionId() // Generate once per session
  })
})
```

### 5.2 Add Training Manager Page (Optional)

Create a new page: `app/(dashboard)/dashboard/training/page.tsx`

```typescript
import TrainingManager from '@/components/training-manager'

export default function TrainingPage() {
  return <TrainingManager />
}
```

## Step 6: Environment Variables

Make sure you have these in your `.env.local`:

```env
# OpenAI (required for training system)
OPENAI_API_KEY=sk-...

# Database (already configured)
DATABASE_URL=postgresql://...

# Clerk (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Step 7: Verify Everything Works

### ✅ Checklist

- [ ] Database migration successful
- [ ] Training data imported
- [ ] Training API working
- [ ] Workflow API working
- [ ] Enhanced chat API working
- [ ] Frontend updated (if applicable)

### Test Commands

```bash
# 1. Check database
npm run db:studio

# 2. Test training API
curl http://localhost:3000/api/training

# 3. Test enhanced chat
curl -X POST http://localhost:3000/api/chat/enhanced \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test"}'
```

## Troubleshooting

### Migration Fails

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or push schema without migration
npx prisma db push
```

### Import Fails

- Check JSON format in `training-data-examples.json`
- Verify you're authenticated
- Check API logs for errors

### Chat Not Using Training Data

- Verify training data exists: `curl http://localhost:3000/api/training`
- Check OpenAI API key is set
- Look at API logs for errors

### Workflow Not Executing

- Check workflow is active: `isActive: true`
- Verify user permissions
- Check execution logs in database

## Next Steps

1. **Add More Training Data** - Customize for your business
2. **Create Custom Workflows** - Automate your processes
3. **Monitor Performance** - Check agent metrics
4. **Iterate** - Improve based on usage

## Support

- Documentation: `TRAINING_WORKFLOW_SYSTEM.md`
- Example Data: `training-data-examples.json`
- Schema: `prisma/schema-update.prisma`

---

**Setup Complete!** 🎉

Your chatbot now has:
- ✅ Custom training data
- ✅ Workflow automation
- ✅ Context memory
- ✅ Performance tracking

Start chatting and see the magic! ✨
