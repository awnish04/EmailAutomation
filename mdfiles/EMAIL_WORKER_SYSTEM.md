# Email Worker System - 24/7 Monitoring

## Overview
This system monitors email events 24/7 and automatically updates lead status.

## Architecture

### 1. **Resend Subdomain Email System**
- Unique email for each user: `username@yourdomain.com`
- Automatic setup on user registration
- Professional branding

### 2. **Real-time Webhook System**
```
Resend → Webhook → /api/webhooks/resend → Process Event → Update Database
```

**Events Tracked:**
- ✅ Email Sent
- ✅ Email Delivered
- ✅ Email Opened
- ✅ Email Clicked
- ✅ Email Bounced
- ✅ Email Replied

### 3. **Background Cron Jobs**

#### Job 1: Email Monitor (Every 5 minutes)
```
/api/cron/email-monitor
- Check new email replies
- Update campaign statistics
- Calculate engagement scores
- Identify hot leads
```

#### Job 2: Daily Cleanup (2 AM daily)
```
/api/cron/daily-cleanup
- Delete old bounced emails
- Archive completed campaigns
- Clean temporary data
```

## Setup Instructions

### Step 1: Configure Resend Domain

1. **Add Domain in Resend Dashboard**
   ```
   Go to: https://resend.com/domains
   Add domain: yourdomain.com
   ```

2. **Add DNS Records**
   ```
   Type: TXT
   Name: @
   Value: [Resend verification code]
   
   Type: MX
   Name: @
   Value: feedback-smtp.us-east-1.amazonses.com
   Priority: 10
   ```

3. **Verify Domain**
   - Wait 5-10 minutes for DNS propagation
   - Click "Verify" in Resend dashboard

### Step 2: Setup Webhook

1. **Add Webhook in Resend**
   ```
   URL: https://yourdomain.com/api/webhooks/resend
   Events: All email events
   ```

2. **Add Environment Variable**
   ```bash
   WEBHOOK_SECRET=your_webhook_secret_here
   ```

### Step 3: Setup Vercel Cron Jobs

1. **Add Cron Secret**
   ```bash
   vercel env add CRON_SECRET
   # Enter a random secret string
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Verify Cron Jobs**
   ```
   Go to: Vercel Dashboard → Project → Cron Jobs
   You should see:
   - email-monitor (every 5 minutes)
   - daily-cleanup (daily at 2 AM)
   ```

### Step 4: Test the System

#### Test Webhook
```bash
curl -X POST https://yourdomain.com/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.delivered",
    "data": {
      "email_id": "test-123",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }'
```

#### Test Cron Job (Manual)
```bash
curl https://yourdomain.com/api/cron/email-monitor \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Database Schema Updates

Add these fields to your Prisma schema:

```prisma
model Email {
  id            String   @id @default(cuid())
  campaignId    String
  leadId        String
  status        String   @default("pending") // sent, delivered, opened, clicked, bounced, replied
  lastEventAt   DateTime?
  events        Json[]   @default([])
  createdAt     DateTime @default(now())
  
  campaign      Campaign @relation(fields: [campaignId], references: [id])
  lead          Lead     @relation(fields: [leadId], references: [id])
}

model Lead {
  id                String   @id @default(cuid())
  email             String
  status            String   @default("new") // new, contacted, replied, hot, invalid
  engagementScore   Int      @default(0)
  lastEngagedAt     DateTime?
  
  emails            Email[]
}

model EmailReply {
  id            String   @id @default(cuid())
  campaignId    String
  leadId        String
  fromEmail     String
  subject       String
  body          String
  processedAt   DateTime?
  createdAt     DateTime @default(now())
}

model Campaign {
  id        String   @id @default(cuid())
  userId    String
  status    String   @default("draft") // draft, active, completed
  stats     Json     @default("{}")
  
  emails    Email[]
  leads     Lead[]
}
```

Run migration:
```bash
npx prisma migrate dev --name add_email_monitoring
```

## How It Works

### 1. User Sends Campaign
```typescript
// User creates campaign
Campaign created → Emails queued

// System sends emails via Resend
for each lead:
  send email from user@yourdomain.com
  track email_id in database
```

### 2. Real-time Event Processing
```typescript
// Resend sends webhook
Email opened → Webhook received → Update database

// Update lead engagement
Lead engagement score += 10
If score > 70 → Mark as "hot lead"
```

### 3. Background Monitoring
```typescript
// Every 5 minutes
Check for new replies
Update campaign statistics
Calculate open/click rates
```

### 4. User Dashboard
```typescript
// Real-time stats
- Total sent: 100
- Delivered: 95
- Opened: 45 (47%)
- Clicked: 12 (26%)
- Replied: 3 (3%)
- Hot leads: 8
```

## Monitoring & Debugging

### Check Webhook Logs
```bash
# Vercel logs
vercel logs --follow

# Filter webhook logs
vercel logs | grep "webhooks/resend"
```

### Check Cron Job Logs
```bash
# View cron execution
vercel logs | grep "cron"
```

### Database Queries
```sql
-- Check email events
SELECT status, COUNT(*) 
FROM Email 
GROUP BY status;

-- Find hot leads
SELECT * FROM Lead 
WHERE engagementScore > 70 
ORDER BY lastEngagedAt DESC;

-- Campaign performance
SELECT 
  c.id,
  COUNT(e.id) as total_sent,
  SUM(CASE WHEN e.status = 'opened' THEN 1 ELSE 0 END) as opened
FROM Campaign c
LEFT JOIN Email e ON e.campaignId = c.id
GROUP BY c.id;
```

## Performance Optimization

### 1. Rate Limiting
```typescript
// Limit emails per minute
const RATE_LIMIT = 50; // emails per minute

// Use queue system
import { Queue } from 'bullmq';
const emailQueue = new Queue('emails');
```

### 2. Batch Processing
```typescript
// Process events in batches
const BATCH_SIZE = 100;
await processEmailEventsInBatches(events, BATCH_SIZE);
```

### 3. Caching
```typescript
// Cache campaign stats
import { redis } from '@/lib/redis';
await redis.set(`campaign:${id}:stats`, stats, 'EX', 300); // 5 min cache
```

## Troubleshooting

### Issue: Webhook not receiving events
**Solution:**
1. Check Resend webhook configuration
2. Verify URL is publicly accessible
3. Check webhook signature verification

### Issue: Cron jobs not running
**Solution:**
1. Verify `vercel.json` configuration
2. Check `CRON_SECRET` environment variable
3. View logs in Vercel dashboard

### Issue: High database load
**Solution:**
1. Add database indexes
2. Implement batch processing
3. Use Redis for caching

## Cost Estimation

### Resend Pricing
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Scale: Custom pricing

### Vercel Pricing
- Hobby: Free (includes cron jobs)
- Pro: $20/month (more cron executions)

### Database (Neon)
- Free: 0.5 GB storage
- Pro: $19/month for 10 GB

## Next Steps

1. ✅ Setup Resend domain
2. ✅ Configure webhook
3. ✅ Deploy cron jobs
4. ⏳ Test with real campaign
5. ⏳ Monitor performance
6. ⏳ Optimize based on usage

## Support

For issues or questions:
- Resend Docs: https://resend.com/docs
- Vercel Cron: https://vercel.com/docs/cron-jobs
- GitHub Issues: [Your repo]
