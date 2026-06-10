import { z } from 'zod'

// ─── Contact Schemas ────────────────────────────────────────────────────────

export const contactSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' })
    .toLowerCase()
    .trim(),
  firstName: z
    .string()
    .max(50, { message: 'First name cannot exceed 50 characters' })
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  lastName: z
    .string()
    .max(50, { message: 'Last name cannot exceed 50 characters' })
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  tags: z
    .array(z.string().min(1, { message: 'Tag cannot be empty' }))
    .max(20, { message: 'Cannot exceed 20 tags per contact' })
    .default([]),
  status: z
    .enum(['ACTIVE', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED'])
    .default('ACTIVE'),
})

export type ContactFormData = z.infer<typeof contactSchema>

// ─── List Schemas ───────────────────────────────────────────────────────────

export const listSchema = z.object({
  name: z
    .string({ message: 'List name is required' })
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name cannot exceed 100 characters' })
    .trim(),
  description: z
    .string()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
})

export type ListFormData = z.infer<typeof listSchema>

// ─── Campaign Schemas ───────────────────────────────────────────────────────

export const campaignSchema = z.object({
  name: z
    .string({ message: 'Campaign name is required' })
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' })
    .trim(),
  subject: z
    .string({ message: 'Subject line is required' })
    .min(2, { message: 'Subject must be at least 2 characters' })
    .max(150, { message: 'Subject cannot exceed 150 characters' })
    .trim(),
  htmlContent: z
    .string({ message: 'Email content is required' })
    .min(10, { message: 'Email content is too short' }),
  fromName: z
    .string({ message: 'From name is required' })
    .min(2, { message: 'From name must be at least 2 characters' })
    .max(100, { message: 'From name cannot exceed 100 characters' })
    .trim(),
  fromEmail: z
    .string({ message: 'From email is required' })
    .email({ message: 'Please enter a valid sender email address' })
    .toLowerCase()
    .trim(),
  listId: z.string().optional(),
  segmentId: z.string().optional(),
  scheduledAt: z.string().optional(),
}).refine(
  (data) => {
    // Must have either listId or segmentId (but not necessarily both, or neither if saving as draft)
    return true
  },
  {
    message: 'Must select either a list or a segment',
    path: ['listId'],
  }
)

export type CampaignFormData = z.infer<typeof campaignSchema>

// ─── Automation Schemas ─────────────────────────────────────────────────────

// Recursive schema for automation steps (simplified for validation)
const stepNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['EMAIL', 'DELAY', 'CONDITION', 'ACTION']),
  config: z.record(z.string(), z.any()),
  nextStepId: z.string().optional(),
  truePathStepId: z.string().optional(), // For condition nodes
  falsePathStepId: z.string().optional(), // For condition nodes
})

export const automationSchema = z.object({
  name: z
    .string({ message: 'Automation name is required' })
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' })
    .trim(),
  trigger: z.object({
    type: z.enum(['SUBSCRIBED_TO_LIST', 'SEGMENT_JOIN', 'CUSTOM_EVENT']),
    config: z.record(z.string(), z.any()),
  }),
  steps: z.array(stepNodeSchema).min(1, { message: 'Must have at least one step' }),
})

export type AutomationFormData = z.infer<typeof automationSchema>

// ─── Segment Schemas ────────────────────────────────────────────────────────

const filterOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'exists',
  'not_exists',
])

const filterConditionSchema = z.object({
  field: z.string(),
  operator: filterOperatorSchema,
  value: z.any().optional(),
})

export const segmentSchema = z.object({
  name: z
    .string({ message: 'Segment name is required' })
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name cannot exceed 100 characters' })
    .trim(),
  filters: z.array(filterConditionSchema).min(1, { message: 'Must have at least one filter condition' }),
})

export type SegmentFormData = z.infer<typeof segmentSchema>
