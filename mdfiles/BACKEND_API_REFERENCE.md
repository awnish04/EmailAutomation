# 🔌 Backend API Reference

## Base URL
```
Production:  https://api.aiemailmarketing.com
Development: http://localhost:8000
```

## Authentication
All API requests (except auth endpoints) require JWT token:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Sign Up
```http
POST /api/auth/signup
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Smith",
  "company_name": "ABC Realty",
  "plan": "pro"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "full_name": "John Smith",
    "company_name": "ABC Realty",
    "sender_email": "abcrealty@mail.aiemailmarketing.com",
    "plan": "pro"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.2 Login
```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.3 Get Current User
```http
GET /api/auth/me
```

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "full_name": "John Smith",
  "company_name": "ABC Realty",
  "sender_email": "abcrealty@mail.aiemailmarketing.com",
  "plan": "pro",
  "plan_limits": {
    "leads": 2000,
    "emails": 2000
  }
}
```

---

## 2. Campaign Endpoints

### 2.1 Create Campaign
```http
POST /api/campaigns
```

**Request Body**:
```json
{
  "name": "Real Estate Agents NYC",
  "target_niche": "real estate agents",
  "location": "New York, USA",
  "lead_count": 200,
  "email_template": "Hi {{name}},\n\nI noticed you're a real estate agent in {{city}}...",
  "email_tone": "casual",
  "follow_up_enabled": true,
  "follow_up_days": 3
}
```

**Response** (201 Created):
```json
{
  "id": "campaign-uuid",
  "name": "Real Estate Agents NYC",
  "status": "draft",
  "created_at": "2025-05-17T10:00:00Z"
}
```

### 2.2 Get All Campaigns
```http
GET /api/campaigns
```

**Query Parameters**:
- `status` (optional): filter by status (draft, active, paused, completed)
- `page` (optional): page number (default: 1)
- `limit` (optional): items per page (default: 20)

**Response** (200 OK):
```json
{
  "campaigns": [
    {
      "id": "uuid",
      "name": "Real Estate Agents NYC",
      "status": "active",
      "lead_count": 200,
      "emails_sent": 180,
      "emails_opened": 89,
      "emails_replied": 12,
      "created_at": "2025-05-17T10:00:00Z",
      "launched_at": "2025-05-17T11:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

### 2.3 Get Campaign Details
```http
GET /api/campaigns/{campaign_id}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "Real Estate Agents NYC",
  "target_niche": "real estate agents",
  "location": "New York, USA",
  "status": "active",
  "stats": {
    "leads_found": 200,
    "emails_sent": 180,
    "emails_delivered": 175,
    "emails_opened": 89,
    "emails_clicked": 34,
    "emails_replied": 12,
    "emails_bounced": 5,
    "open_rate": 0.49,
    "reply_rate": 0.07
  },
  "created_at": "2025-05-17T10:00:00Z",
  "launched_at": "2025-05-17T11:00:00Z"
}
```

### 2.4 Launch Campaign
```http
POST /api/campaigns/{campaign_id}/launch
```

**Response** (200 OK):
```json
{
  "message": "Campaign launched successfully",
  "campaign_id": "uuid",
  "status": "scraping"
}
```

### 2.5 Pause Campaign
```http
POST /api/campaigns/{campaign_id}/pause
```

**Response** (200 OK):
```json
{
  "message": "Campaign paused",
  "campaign_id": "uuid",
  "status": "paused"
}
```

### 2.6 Delete Campaign
```http
DELETE /api/campaigns/{campaign_id}
```

**Response** (204 No Content)

---

## 3. Lead Endpoints

### 3.1 Get Campaign Leads
```http
GET /api/campaigns/{campaign_id}/leads
```

**Query Parameters**:
- `status` (optional): filter by email status
- `page` (optional): page number
- `limit` (optional): items per page

**Response** (200 OK):
```json
{
  "leads": [
    {
      "id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah@kellerwilliams.com",
      "phone": "+1 212-555-0123",
      "company": "Keller Williams",
      "city": "Manhattan",
      "email_status": "opened",
      "opened_at": "2025-05-17T14:30:00Z",
      "replied": false
    }
  ],
  "total": 200,
  "page": 1,
  "pages": 10
}
```

### 3.2 Get All Leads
```http
GET /api/leads
```

**Response**: Same format as above, but across all campaigns

### 3.3 Export Leads
```http
GET /api/campaigns/{campaign_id}/leads/export
```

**Query Parameters**:
- `format`: csv or excel (default: csv)

**Response**: File download (CSV or Excel)

---

## 4. Email Endpoints

### 4.1 Get Email Details
```http
GET /api/emails/{email_id}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "campaign_id": "uuid",
  "lead": {
    "name": "Sarah Johnson",
    "email": "sarah@kellerwilliams.com"
  },
  "subject": "Quick question, Sarah",
  "body": "Hi Sarah,\n\nI noticed you're with Keller Williams...",
  "status": "opened",
  "sent_at": "2025-05-17T12:00:00Z",
  "delivered_at": "2025-05-17T12:00:05Z",
  "opened_at": "2025-05-17T14:30:00Z",
  "open_count": 3,
  "click_count": 1,
  "follow_up_count": 0
}
```

### 4.2 Get Replies
```http
GET /api/emails/replies
```

**Response** (200 OK):
```json
{
  "replies": [
    {
      "id": "uuid",
      "campaign_name": "Real Estate Agents NYC",
      "lead": {
        "name": "Mike Chen",
        "email": "mike@example.com"
      },
      "original_subject": "Quick question, Mike",
      "reply_subject": "Re: Quick question, Mike",
      "reply_body": "Hi John,\n\nYes, I'm interested! Can we schedule a call?",
      "replied_at": "2025-05-17T15:00:00Z"
    }
  ]
}
```

---

## 5. Analytics Endpoints

### 5.1 Get Dashboard Stats
```http
GET /api/analytics/dashboard
```

**Response** (200 OK):
```json
{
  "total_campaigns": 5,
  "active_campaigns": 2,
  "total_leads": 1000,
  "total_emails_sent": 850,
  "total_opens": 425,
  "total_clicks": 170,
  "total_replies": 68,
  "overall_open_rate": 0.50,
  "overall_reply_rate": 0.08,
  "this_month": {
    "leads_scraped": 500,
    "emails_sent": 450,
    "leads_remaining": 1500,
    "emails_remaining": 1550
  }
}
```

### 5.2 Get Campaign Analytics
```http
GET /api/analytics/campaigns/{campaign_id}
```

**Response** (200 OK):
```json
{
  "campaign_id": "uuid",
  "timeline": [
    {
      "date": "2025-05-17",
      "sent": 50,
      "opened": 25,
      "clicked": 10,
      "replied": 3
    }
  ],
  "top_performing_emails": [
    {
      "subject": "Quick question, Sarah",
      "open_rate": 0.75,
      "reply_rate": 0.15
    }
  ],
  "engagement_by_time": {
    "9am": 15,
    "10am": 25,
    "11am": 30,
    "12pm": 20
  }
}
```

---

## 6. Settings Endpoints

### 6.1 Update Profile
```http
PATCH /api/settings/profile
```

**Request Body**:
```json
{
  "full_name": "John Smith",
  "sender_name": "John from ABC Realty",
  "email_signature": "Best regards,\nJohn Smith\nABC Realty"
}
```

**Response** (200 OK):
```json
{
  "message": "Profile updated successfully"
}
```

### 6.2 Get Usage Stats
```http
GET /api/settings/usage
```

**Response** (200 OK):
```json
{
  "current_month": "2025-05",
  "plan": "pro",
  "limits": {
    "leads": 2000,
    "emails": 2000
  },
  "usage": {
    "leads_scraped": 500,
    "emails_sent": 450
  },
  "remaining": {
    "leads": 1500,
    "emails": 1550
  },
  "percentage_used": {
    "leads": 25,
    "emails": 22.5
  }
}
```

---

## 7. Webhook Endpoints

### 7.1 Resend Webhook
```http
POST /api/webhooks/resend
```

**Request Body** (from Resend):
```json
{
  "type": "email.opened",
  "created_at": "2025-05-17T14:30:00Z",
  "data": {
    "email_id": "resend-email-id",
    "from": "sender@example.com",
    "to": ["recipient@example.com"],
    "subject": "Quick question"
  }
}
```

**Response** (200 OK):
```json
{
  "status": "ok"
}
```

### 7.2 Stripe Webhook
```http
POST /api/webhooks/stripe
```

**Request Body** (from Stripe):
```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_xxxxx",
      "customer": "cus_xxxxx",
      "status": "active"
    }
  }
}
```

**Response** (200 OK):
```json
{
  "status": "ok"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": {
    "email": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Campaign not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded your plan limits",
  "retry_after": 3600
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong. Please try again later."
}
```

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Campaign creation**: 10 requests per hour
- **Other endpoints**: 100 requests per minute

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1621234567
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Headers**:
```
X-Total-Count: 500
X-Page: 1
X-Per-Page: 20
X-Total-Pages: 25
```

---

**Last Updated**: May 17, 2025
**API Version**: 1.0
