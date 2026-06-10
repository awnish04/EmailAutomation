# 🧙‍♂️ Step-by-Step Wizard Chatbot - Implementation Guide

## ✅ What I Created

I've created a **step-by-step wizard system** where:
- ✅ One question shows at a time
- ✅ User clicks an option button
- ✅ Next question appears automatically
- ✅ Easy, guided flow
- ✅ No typing needed (unless "Type my own")

## 📁 Files Created

### 1. Wizard Agent (`lib/agents/conversational-agent-wizard.ts`)
- Step-by-step logic
- 6 steps total
- Clickable options for each step
- Custom input support

### 2. Updated API (`app/api/chat/agent/route.ts`)
- Uses WizardAgent instead of ConversationalAgent
- Handles option selections
- Handles custom text input

## 🎯 Wizard Flow

```
Step 1: INTRO
"Welcome! Ready to start?"
[✅ Yes, let's start!] [ℹ️ Tell me more]
↓

Step 2: ASK_PURPOSE  
"Why do you want to send emails?"
[🎯 Find new clients] [📢 Promote service] [🤝 Build partnerships]
↓

Step 3: ASK_SERVICE
"What service do you offer?"
[💻 Website Dev] [📱 App Dev] [📊 Marketing] [✍️ Type my own]
↓

Step 4: ASK_TARGET
"Who do you want to reach?"
[🏢 Real Estate] [🍽️ Restaurants] [💼 Small Business] [✍️ Type my own]
↓

Step 5: ASK_LOCATION
"Where are they located?"
[🗽 New York] [🌴 California] [🤠 Texas] [✍️ Type my own]
↓

Step 6: ASK_COUNT
"How many emails?"
[50] [100] [200] [500] [✍️ Type my own]
↓

Step 7: CONFIRMING
"Confirm your campaign?"
Shows all details
[🚀 Start campaign!] [✏️ Edit]
↓

Step 8: EXECUTING
"Campaign started!"
Redirects to dashboard
```

## 🎨 UI Implementation Needed

You need to update `/app/(dashboard)/dashboard/chat/page.tsx` to show **clickable option buttons** instead of forms.

### Current UI (Form-based):
```tsx
<form>
  <input type="text" />
  <input type="text" />
  <button>Submit</button>
</form>
```

### New UI Needed (Button-based):
```tsx
<div className="options-grid">
  {options.map(option => (
    <button 
      key={option.value}
      onClick={() => handleOptionClick(option.value)}
      className="option-button"
    >
      {option.icon} {option.label}
    </button>
  ))}
</div>
```

## 📝 Example UI Code

Here's what the chat page should look like:

```tsx
'use client'

import { useState } from 'react'

export default function WizardChatPage() {
  const [messages, setMessages] = useState([])
  const [currentOptions, setCurrentOptions] = useState([])
  const [showOptions, setShowOptions] = useState(false)

  const handleOptionClick = async (value: string) => {
    // Send selection to API
    const response = await fetch('/api/chat/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selection: value })
    })

    const data = await response.json()

    // Add AI message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: data.message
    }])

    // Show new options
    if (data.showOptions) {
      setCurrentOptions(data.options)
      setShowOptions(true)
    }

    // Redirect if campaign started
    if (data.readyToExecute) {
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }
  }

  return (
    <div>
      {/* Messages */}
      {messages.map((msg, i) => (
        <div key={i} className="message">
          {msg.content}
        </div>
      ))}

      {/* Options */}
      {showOptions && (
        <div className="options-grid">
          {currentOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="option-button"
            >
              <span className="icon">{option.icon}</span>
              <span className="label">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

## 🎨 CSS Styling

```css
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.option-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-button:hover {
  border-color: #10b981;
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.option-button .icon {
  font-size: 24px;
}

.option-button .label {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}
```

## 🚀 How It Works

### 1. User Opens Chat
```
API Response:
{
  message: "Welcome! Ready to start?",
  step: "INTRO",
  showOptions: true,
  options: [
    { label: "✅ Yes, let's start!", value: "yes", icon: "✅" },
    { label: "ℹ️ Tell me more", value: "more", icon: "ℹ️" }
  ]
}
```

### 2. User Clicks "Yes, let's start!"
```
API Request:
{
  selection: "yes"
}

API Response:
{
  message: "Step 1 of 5: Why do you want to send emails?",
  step: "ASK_PURPOSE",
  showOptions: true,
  options: [
    { label: "🎯 Find new clients", value: "Find new clients" },
    { label: "📢 Promote my service", value: "Promote my service" },
    ...
  ]
}
```

### 3. User Clicks "Find new clients"
```
API Request:
{
  selection: "Find new clients"
}

API Response:
{
  message: "Step 2 of 5: What service do you offer?",
  step: "ASK_SERVICE",
  showOptions: true,
  options: [
    { label: "💻 Website Development", value: "Website Development" },
    ...
  ]
}
```

### 4. Continue Until Confirmation
Each click moves to the next step automatically.

### 5. Final Confirmation
```
API Response:
{
  message: "✅ Perfect! Confirm your campaign?
           
           Goal: Find new clients
           Service: Website Development
           Target: Real Estate Agents
           Location: California
           Emails: 100",
  step: "CONFIRMING",
  showOptions: true,
  options: [
    { label: "🚀 Yes, start campaign!", value: "yes" },
    { label: "✏️ Edit details", value: "edit" }
  ]
}
```

### 6. Campaign Starts
```
API Response:
{
  message: "🚀 Campaign Started!...",
  step: "EXECUTING",
  readyToExecute: true,
  campaignId: "clx123..."
}
```

## 📊 API Contract

### Request Format:
```typescript
{
  selection?: string      // Option value clicked
  customInput?: string    // Custom text (if "Type my own")
  field?: string         // Which field (service, target, location, count)
}
```

### Response Format:
```typescript
{
  message: string                    // AI message to display
  step: WizardStep                   // Current step
  campaignInfo: CampaignInfo         // Collected data
  showOptions: boolean               // Show option buttons?
  options: Array<{                   // Option buttons
    label: string                    // Button text
    value: string                    // Value to send
    icon?: string                    // Emoji icon
  }>
  readyToExecute?: boolean          // Campaign starting?
  campaignId?: string               // Campaign ID (if started)
}
```

## ✅ Benefits

### Old Way (Form):
- ❌ All questions at once
- ❌ Overwhelming
- ❌ Requires typing
- ❌ No guidance

### New Way (Wizard):
- ✅ One question at a time
- ✅ Easy to follow
- ✅ Click to select
- ✅ Guided flow
- ✅ Progress indicator (Step X of 5)

## 🎯 Next Steps

1. **Update Chat UI** (`app/(dashboard)/dashboard/chat/page.tsx`)
   - Remove form
   - Add option buttons
   - Handle clicks
   - Show progress

2. **Test Flow**
   - Click through all steps
   - Try "Type my own" options
   - Confirm campaign starts
   - Check dashboard redirect

3. **Style Options**
   - Make buttons attractive
   - Add hover effects
   - Show icons clearly
   - Responsive design

## 📝 Complete Example

See the wizard agent file for complete implementation:
`lib/agents/conversational-agent-wizard.ts`

The API is already updated and ready to use!

---

**🎉 The backend is complete! Just need to update the UI to show clickable options instead of forms.**
