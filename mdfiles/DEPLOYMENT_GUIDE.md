# Vercel Deployment Guide - AI Email Marketing

## ✅ Changes Made

### 1. Removed Subdomain System
- **Before**: Each user had a unique subdomain (e.g., `john.aiemailmarketing.com`)
- **After**: Users send emails directly from their own email address
- **Why**: Much simpler! No need to manage DNS, subdomains, or complex email routing

### 2. Updated Database Schema
- Removed: `subdomain`, `fromEmail` fields from User model
- Added: `emailVerified` (Boolean), kept `fromName` (String)
- Users now use their actual email address from Clerk authentication

### 3. Email Service Integration
- Created `/lib/email-service.ts` with Resend integration
- Emails sent using user's actual email address
- Simple verification process through Resend dashboard

## 🚨 Current Issue: Prisma Build Error

The project uses **Prisma Postgres** (`prisma+postgres://`) which requires special configuration for deployment.

### Solution Options:

#### Option 1: Use Regular PostgreSQL (Recommended for Vercel)
1. Get a PostgreSQL database from:
   - **Vercel Postgres** (easiest - integrated with Vercel)
   - **Neon** (https://neon.tech) - Free tier available
   - **Supabase** (https://supabase.com) - Free tier available

2. Update `.env` with regular PostgreSQL URL:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

3. Run migrations:
```bash
npx prisma db push
npx prisma generate
```

#### Option 2: Configure Prisma Postgres for Production
If you want to keep using Prisma Postgres, you need to:
1. Set up Prisma Accelerate
2. Add adapter configuration
3. Update environment variables

## 📋 Deployment Steps

### 1. Prepare Database

**Using Vercel Postgres (Easiest):**
```bash
# After creating Vercel project
vercel env pull .env.production
# This will download DATABASE_URL automatically
```

**Using Neon or Supabase:**
1. Create a new database
2. Copy the connection string
3. Update `.env` and `.env.production`

### 2. Set Environment Variables in Vercel

Go to your Vercel project settings and add:

```env
# Database
DATABASE_URL=your_postgresql_url_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Resend Email
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_MAIN_DOMAIN=aiemailmarketing.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. Deploy to Vercel

```bash
# Login to Vercel (already done)
vercel login

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 📧 Email Setup with Resend

### Step 1: Sign up for Resend
1. Go to https://resend.com
2. Create an account
3. Get your API key

### Step 2: Verify Domain (Optional but Recommended)
1. Add your domain in Resend dashboard
2. Add DNS records (MX, TXT, CNAME)
3. Wait for verification

### Step 3: For Gmail/Outlook Users
If users want to send from Gmail/Outlook:
1. They need to verify their email in Resend
2. Or use Resend's domain (e.g., `user@resend.dev`)

## 🔧 Quick Fix for Local Development

To fix the build error locally:

1. **Option A**: Use a regular PostgreSQL database
   ```bash
   # Install PostgreSQL locally or use Docker
   docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
   
   # Update .env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/aiemailmarketing"
   
   # Push schema
   npx prisma db push
   npx prisma generate
   ```

2. **Option B**: Keep Prisma Postgres but skip build for now
   ```bash
   # Just deploy - Vercel will use production database
   vercel --prod
   ```

## 📝 Summary

**What Changed:**
- ❌ No more subdomain system
- ✅ Users send from their own email
- ✅ Simpler setup with Resend
- ✅ Database schema updated

**What's Needed:**
1. Regular PostgreSQL database URL (not `prisma+postgres://`)
2. Resend API key
3. Clerk credentials
4. Deploy to Vercel

**Next Steps:**
1. Choose a PostgreSQL provider (Vercel Postgres recommended)
2. Update DATABASE_URL
3. Run `npx prisma db push`
4. Deploy with `vercel --prod`

## 🎯 Benefits of New System

1. **Simpler**: No DNS configuration needed
2. **Faster**: No subdomain setup delays
3. **Cheaper**: No subdomain hosting costs
4. **Better deliverability**: Emails from verified personal domains
5. **Easier maintenance**: Less infrastructure to manage

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Resend Docs: https://resend.com/docs
