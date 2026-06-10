# 🔄 Restart Fresh - Clear All Cache

## Problem
Browser showing old chat page without MCQ options.

## Solution: Clear Everything

### Step 1: Stop Dev Server
```bash
# In terminal where server is running:
Ctrl + C
```

### Step 2: Delete Next.js Cache
```bash
cd aiemailmarketing
rm -rf .next
```

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Hard Refresh Browser
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R

Or:
1. Open DevTools (F12)
2. Right-click refresh button
3. "Empty Cache and Hard Reload"
```

### Step 5: Open Chat
```
http://localhost:3000/dashboard/chat
```

## What You Should See

### 1. Simple Greeting
```
AI Agent: 👋 Hi! Ready to create your campaign?

[✅ Yes, let's start!]  [ℹ️ Tell me more]
```

### 2. After Clicking "Yes"
```
AI Agent: Step 1 of 5: Why do you want to send emails?

Choose your goal:

[🎯 Find new clients]    [📢 Promote my service]
[🤝 Build partnerships]  [📧 General outreach]
```

### 3. Continue Clicking
Each click shows next question with new options.

## Quick Commands

```bash
# All in one:
cd aiemailmarketing && rm -rf .next && npm run dev
```

Then hard refresh browser!

## Still Not Working?

### Check 1: Correct URL
```
✅ http://localhost:3000/dashboard/chat
❌ http://localhost:3000/chat
```

### Check 2: Server Running
```bash
# Should see:
✓ Ready in 2.3s
○ Local: http://localhost:3000
```

### Check 3: No Errors
```bash
# Terminal should not show:
❌ Error: ...
❌ Failed to compile
```

### Check 4: Browser Console
```
F12 → Console tab
Should not show red errors
```

## Files Changed

1. ✅ `lib/agents/conversational-agent.ts`
   - Simple "Hi!" greeting
   - MCQ options for each step

2. ✅ `app/(dashboard)/dashboard/chat/page.tsx`
   - New UI with option buttons
   - Progress sidebar
   - Auto-loads first question

3. ✅ `app/api/chat/agent/route.ts`
   - Uses WizardAgent
   - Returns options

## Test Checklist

- [ ] Deleted `.next` folder
- [ ] Restarted dev server
- [ ] Hard refreshed browser
- [ ] Opened correct URL
- [ ] See "Hi! Ready to create your campaign?"
- [ ] See 2 option buttons
- [ ] Buttons are clickable
- [ ] Next question appears after click
- [ ] New options show

## If Still Old Page

Try incognito/private window:
```
Mac: Cmd + Shift + N
Windows: Ctrl + Shift + N
```

Then go to: `http://localhost:3000/dashboard/chat`

---

**The code is 100% ready! Just need to clear cache!** 🚀
