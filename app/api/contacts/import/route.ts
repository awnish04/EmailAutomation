import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, checkLimit } from '@/lib/auth'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()

    const formData = await req.formData()
    const file = formData.get('file') as File
    const listId = formData.get('listId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)

    if (lines.length < 2) {
      return NextResponse.json({ error: 'File is empty or missing headers' }, { status: 400 })
    }

    const headers = lines[0].toLowerCase().split(',').map((h) => h.trim())
    const emailIndex = headers.indexOf('email')

    if (emailIndex === -1) {
      return NextResponse.json({ error: 'CSV must contain an "email" column' }, { status: 400 })
    }

    const firstNameIndex = headers.findIndex(h => h === 'first_name' || h === 'firstname' || h === 'first name')
    const lastNameIndex = headers.findIndex(h => h === 'last_name' || h === 'lastname' || h === 'last name')
    const tagsIndex = headers.indexOf('tags')

    const currentLimit = await checkLimit('contacts')
    const maxAllowedNew = currentLimit.max - currentLimit.current

    let imported = 0
    let updated = 0
    let skipped = 0
    const errors: string[] = []

    const validRows = []

    // Parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      // Basic CSV split, doesn't handle escaped commas in quotes perfectly, but sufficient for simple imports
      // A more robust solution for server-side would be csv-parse or similar
      const cols = lines[i].split(',').map((c) => c.trim())
      
      const email = cols[emailIndex]?.toLowerCase()
      if (!email || !z.string().email().safeParse(email).success) {
        errors.push(`Row ${i + 1}: Invalid email "${email}"`)
        continue
      }

      const firstName = firstNameIndex !== -1 ? cols[firstNameIndex] || undefined : undefined
      const lastName = lastNameIndex !== -1 ? cols[lastNameIndex] || undefined : undefined
      const tags = tagsIndex !== -1 && cols[tagsIndex] 
        ? cols[tagsIndex].split(';').map(t => t.trim()).filter(Boolean) 
        : []

      // Any remaining headers go to metadata
      const metadata: Record<string, any> = {}
      headers.forEach((header, idx) => {
        if (idx !== emailIndex && idx !== firstNameIndex && idx !== lastNameIndex && idx !== tagsIndex) {
          if (cols[idx]) metadata[header] = cols[idx]
        }
      })

      validRows.push({ email, firstName, lastName, tags, metadata })
    }

    // Process valid rows
    for (const row of validRows) {
      const existingContact = await prisma.contact.findUnique({
        where: {
          userId_email: {
            userId: user.id,
            email: row.email,
          }
        }
      })

      if (existingContact) {
        // Update existing contact
        await prisma.contact.update({
          where: { id: existingContact.id },
          data: {
            firstName: row.firstName || existingContact.firstName,
            lastName: row.lastName || existingContact.lastName,
            // Merge tags
            tags: [...new Set([...existingContact.tags, ...row.tags])],
            // Merge metadata
            metadata: {
              ...(existingContact.metadata as Record<string, any> || {}),
              ...row.metadata
            },
            contactLists: listId ? {
              connectOrCreate: {
                where: {
                  contactId_listId: {
                    contactId: existingContact.id,
                    listId
                  }
                },
                create: {
                  listId
                }
              }
            } : undefined
          }
        })
        updated++
      } else {
        // Create new contact if within limits
        if (imported >= maxAllowedNew) {
          skipped++
          continue
        }

        await prisma.contact.create({
          data: {
            userId: user.id,
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            tags: row.tags,
            metadata: Object.keys(row.metadata).length > 0 ? row.metadata : undefined,
            source: 'import',
            contactLists: listId ? {
              create: {
                listId
              }
            } : undefined
          }
        })
        imported++
      }
    }

    return NextResponse.json({
      imported,
      updated,
      skipped,
      errors
    })

  } catch (error) {
    console.error('Error importing contacts:', error)
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    )
  }
}
