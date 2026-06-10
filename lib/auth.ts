import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'
import type { Plan } from '@prisma/client'

// ─── Plan Limits ────────────────────────────────────────────────────────────

export interface PlanLimits {
  plan: Plan
  maxContacts: number
  maxEmailsPerMonth: number
  hasAutomations: boolean
}

const PLAN_LIMITS: Record<Plan, Omit<PlanLimits, 'plan'>> = {
  FREE: {
    maxContacts: 500,
    maxEmailsPerMonth: 1000,
    hasAutomations: false,
  },
  PRO: {
    maxContacts: 10_000,
    maxEmailsPerMonth: 50_000,
    hasAutomations: true,
  },
  BUSINESS: {
    maxContacts: 999_999,
    maxEmailsPerMonth: 500_000,
    hasAutomations: true,
  },
}

// ─── Auth Helpers ───────────────────────────────────────────────────────────

/**
 * Get the current authenticated user from the database.
 * Returns the user or null if not found.
 */
export async function getCurrentUser() {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  })

  return user
}

/**
 * Require an authenticated user. Redirects to /login if not found.
 * Use in server components and server actions that require auth.
 */
export async function requireUser() {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  })

  if (!user) {
    // Clerk user exists but DB user doesn't — likely webhook hasn't fired yet.
    // Try to create from Clerk data as a fallback.
    const clerkUser = await currentUser()

    if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
      redirect('/login')
    }

    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name:
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
          null,
      },
    })

    return newUser
  }

  return user
}

/**
 * Get the current user's plan with its associated limits.
 */
export async function getUserPlan(): Promise<PlanLimits | null> {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return {
    plan: user.plan,
    ...PLAN_LIMITS[user.plan],
  }
}

/**
 * Check if the user has exceeded a specific limit.
 */
export async function checkLimit(
  type: 'contacts' | 'emails'
): Promise<{ allowed: boolean; current: number; max: number }> {
  const user = await requireUser()
  const limits = PLAN_LIMITS[user.plan]

  if (type === 'contacts') {
    const count = await prisma.contact.count({
      where: { userId: user.id },
    })
    return {
      allowed: count < limits.maxContacts,
      current: count,
      max: limits.maxContacts,
    }
  }

  // emails
  return {
    allowed: user.emailsSentThisMonth < limits.maxEmailsPerMonth,
    current: user.emailsSentThisMonth,
    max: limits.maxEmailsPerMonth,
  }
}
