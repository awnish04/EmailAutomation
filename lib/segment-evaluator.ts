import { Contact } from '@prisma/client'
import { prisma } from './prisma'

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'exists'
  | 'not_exists'

export interface FilterCondition {
  field: string // e.g., 'tags', 'status', 'email', 'firstName', 'lastName', 'metadata.key'
  operator: FilterOperator
  value?: any
}

/**
 * Evaluates a single contact against a set of segment filters.
 * Returns true if the contact matches ALL filters (AND logic).
 */
export function evaluateSegment(
  filters: FilterCondition[] | any,
  contact: Partial<Contact>
): boolean {
  if (!Array.isArray(filters) || filters.length === 0) {
    return true // Empty segment includes everyone by default
  }

  // All conditions must match (AND logic)
  return filters.every((filter) => {
    const { field, operator, value } = filter

    // Extract the contact value based on the field path
    let contactValue: any

    if (field.startsWith('metadata.')) {
      const metaKey = field.replace('metadata.', '')
      // Need to safely access JSON metadata
      const meta =
        typeof contact.metadata === 'string'
          ? JSON.parse(contact.metadata)
          : contact.metadata
      contactValue = meta && typeof meta === 'object' ? (meta as any)[metaKey] : undefined
    } else {
      contactValue = (contact as any)[field]
    }

    // Evaluate based on operator
    switch (operator) {
      case 'equals':
        return String(contactValue).toLowerCase() === String(value).toLowerCase()

      case 'not_equals':
        return String(contactValue).toLowerCase() !== String(value).toLowerCase()

      case 'contains':
        if (Array.isArray(contactValue)) {
          // E.g., tags contains 'vip'
          return contactValue.some(
            (v) => String(v).toLowerCase() === String(value).toLowerCase()
          )
        }
        // E.g., email contains 'gmail.com'
        return String(contactValue)
          .toLowerCase()
          .includes(String(value).toLowerCase())

      case 'not_contains':
        if (Array.isArray(contactValue)) {
          return !contactValue.some(
            (v) => String(v).toLowerCase() === String(value).toLowerCase()
          )
        }
        return !String(contactValue)
          .toLowerCase()
          .includes(String(value).toLowerCase())

      case 'exists':
        return contactValue !== undefined && contactValue !== null && contactValue !== ''

      case 'not_exists':
        return contactValue === undefined || contactValue === null || contactValue === ''

      default:
        return false // Unknown operator
    }
  })
}

/**
 * Fetches all contacts for a user that match a specific segment.
 *
 * This implementation fetches all active contacts and evaluates them in-memory.
 * For very large lists (100k+), this would ideally be translated to Prisma/SQL queries.
 */
export async function getContactsInSegment(
  userId: string,
  segmentId: string
): Promise<Contact[]> {
  // Get the segment definition
  const segment = await prisma.segment.findUnique({
    where: { id: segmentId, userId },
  })

  if (!segment) {
    throw new Error('Segment not found')
  }

  const filters = segment.filters as unknown as FilterCondition[]

  // For simplicity and flexibility with complex JSON filters,
  // we fetch all active contacts and evaluate in-memory.
  // Optimization: If no metadata filters are used, this could be translated to Prisma `where` clauses.
  const allContacts = await prisma.contact.findMany({
    where: {
      userId,
      status: 'ACTIVE', // Usually only send to active contacts
    },
  })

  // Filter contacts based on segment rules
  return allContacts.filter((contact) => evaluateSegment(filters, contact))
}
