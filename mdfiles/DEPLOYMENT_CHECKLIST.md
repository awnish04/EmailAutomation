# 📋 Deployment Checklist - Email Worker System

## Pre-Deployment

### 1. Environment Setup
- [ ] Update `NEXT_PUBLIC_MAIN_DOMAIN` in `.env.local`
- [ ] Run `./scripts/setup-email-worker.sh`
- [ ] Verify all secrets are generated
- [ ] Check `.env.local` has all required variables

### 2. Database
- [ ] Run `npx prisma migrate dev --name add_email_monitoring`
- [ ] Run `npx prisma generate`
- [ ] Verify database connection
- [ ] Test queries work

### 3. Code Review
- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] All imports working
- [ ] Build succeeds: `npm run build`

## Resend Configuration

### 1. Domain Setup
- [ ] Go to https://resend.com/domains
- [ ] Add your domain
- [ ] Copy DNS records

### 2. DNS Configuration (in your domain provider)
- [ ] Add TXT record for verification
- [ ] Add MX record for email receiving
- [ ] Add TXT record for DKIM
- [ ] Wait 5-10 minutes for propagation
- [ ] Verify domain in Resend

### 3. Webhook Setup
- [ ] Go to https://resend.com/webhooks
- [ ] Add webhook URL: `https://yourdomain.com/api/webhooks/resend`
- [ ] Select all email events
- [ ] Add webhook secret from `.env.local`
- [ ] Save webhook

## Vercel Deployment

### 1. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `DATABASE_URL`
- [ ] `OPENAI_API_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_MAIN_DOMAIN`
- [ ] `WEBHOOK_SECRET`
- [ ] `CRON_SECRET`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### 2. Deploy
```bash
vercel --prod
```

- [ ] Deployment successful
- [ ] No build errors
- [ ] Site is accessible

### 3. Verify Cron Jobs
- [ ] Go to Vercel Dashboard → Project → Cron Jobs
- [ ] Verify `email-monitor` is scheduled (every 5 minutes)
- [ ] Verify `daily-cleanup` is scheduled (daily at 2 AM)

## Post-Deployment Testing

### 1. Test Webhook
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
- [ ] Returns `{"success":true}`
- [ ] No errors in logs

### 2. Test Cron Job
```bash
curl https://yourdomain.com/api/cron/email-monitor \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
- [ ] Returns success response
- [ ] Check logs for execution

### 3. Test Campaign Flow
- [ ] Create new campaign
- [ ] Add test lead (your email)
- [ ] Send campaign
- [ ] Verify email received
- [ ] Open email
- [ ] Click link in email
- [ ] Check dashboard shows "opened" status
- [ ] Check dashboard shows "clicked" status
- [ ] Verify engagement score updated

### 4. Test User Registration
- [ ] Sign up new user
- [ ] Verify subdomain email created
- [ ] Check welcome email received
- [ ] Verify user can send campaigns

## Monitoring Setup

### 1. Vercel Logs
```bash
vercel logs --follow
```
- [ ] Logs are accessible
- [ ] No critical errors

### 2. Database Monitoring
```sql
-- Check email events
SELECT status, COUNT(*) FROM emails GROUP BY status;
```
- [ ] Query works
- [ ] Data is being recorded

### 3. Email Metrics
- [ ] Dashboard shows campaign stats
- [ ] Hot leads are identified
- [ ] Engagement scores calculated

## Security Checklist

- [ ] All secrets are in environment variables (not in code)
- [ ] Webhook signature verification enabled
- [ ] Cron job authentication working
- [ ] Database connection is secure (SSL)
- [ ] HTTPS only (no HTTP)
- [ ] CORS configured correctly

## Performance Checklist

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Caching enabled

## Documentation

- [ ] `README.md` updated
- [ ] `EMAIL_WORKER_SYSTEM.md` reviewed
- [ ] `QUICK_START.md` tested
- [ ] `SYSTEM_ARCHITECTURE.md` accurate
- [ ] API documentation complete

## Backup & Recovery

- [ ] Database backup enabled (Neon automatic backups)
- [ ] Environment variables backed up
- [ ] Code in Git repository
- [ ] Deployment rollback plan ready

## Support & Maintenance

- [ ] Error tracking setup
- [ ] Alert system configured
- [ ] Support email configured
- [ ] Maintenance schedule planned

## Final Checks

- [ ] All features working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete

## Go-Live

- [ ] Announce to users
- [ ] Monitor for first 24 hours
- [ ] Check error rates
- [ ] Verify cron jobs running
- [ ] Monitor email delivery rates

## Post-Launch (First Week)

### Day 1
- [ ] Monitor logs every hour
- [ ] Check email delivery rate
- [ ] Verify cron jobs executed
- [ ] Check for errors

### Day 2-3
- [ ] Monitor logs twice daily
- [ ] Review campaign performance
- [ ] Check hot leads accuracy
- [ ] Verify webhook events

### Day 4-7
- [ ] Monitor logs daily
- [ ] Review weekly stats
- [ ] Optimize based on usage
- [ ] Plan improvements

## Troubleshooting Guide

### Issue: Emails not sending
1. Check Resend API key
2. Verify domain is verified
3. Check DNS records
4. Review Resend dashboard for errors

### Issue: Webhook not working
1. Verify webhook URL is correct
2. Check webhook secret matches
3. Review Vercel logs
4. Test webhook manually

### Issue: Cron jobs not running
1. Check `vercel.json` configuration
2. Verify `CRON_SECRET` is set
3. Check Vercel dashboard
4. Review cron job logs

### Issue: Database errors
1. Check `DATABASE_URL` is correct
2. Run `npx prisma generate`
3. Run migrations
4. Verify database connection

## Success Metrics

Track these metrics after launch:

### Week 1
- [ ] Email delivery rate > 95%
- [ ] Bounce rate < 5%
- [ ] Open rate > 20%
- [ ] No critical errors

### Month 1
- [ ] 100+ campaigns sent
- [ ] 1,000+ emails delivered
- [ ] 50+ hot leads identified
- [ ] User satisfaction > 80%

## Next Steps After Launch

1. **Gather Feedback**
   - User surveys
   - Feature requests
   - Bug reports

2. **Optimize Performance**
   - Database queries
   - API response times
   - Email delivery rates

3. **Add Features**
   - A/B testing
   - Email templates
   - Advanced analytics

4. **Scale Infrastructure**
   - Add Redis caching
   - Implement queue system
   - Optimize database

---

## Sign-Off

- [ ] Development Team: _______________
- [ ] QA Team: _______________
- [ ] Product Owner: _______________
- [ ] DevOps: _______________

**Deployment Date:** _______________
**Deployed By:** _______________
**Version:** 1.0.0

---

**Status:** Ready for Production ✅
**Last Updated:** May 18, 2026
