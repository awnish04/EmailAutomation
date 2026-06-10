/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, injectTracking } from '@/lib/resend'
import { evaluateSegment } from '@/lib/segment-evaluator'
import { Client } from '@upstash/qstash'

// Optional: Upstash QStash client for scheduling 'wait' steps
const qstash = process.env.QSTASH_TOKEN 
  ? new Client({ token: process.env.QSTASH_TOKEN }) 
  : null

export async function POST(req: NextRequest) {
  try {
    const { enrollmentId, stepDepth = 0 } = await req.json()

    if (!enrollmentId) {
      return NextResponse.json({ error: 'enrollmentId is required' }, { status: 400 })
    }

    // Safety limit to prevent infinite loops in a single execution thread
    if (stepDepth > 20) {
      return NextResponse.json({ error: 'Max step depth reached' }, { status: 400 })
    }

    const enrollment = await prisma.automationEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        automation: true,
        contact: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    if (enrollment.status !== 'ACTIVE') {
      return NextResponse.json({ message: 'Enrollment is no longer active' }, { status: 200 })
    }

    const steps = enrollment.automation.steps as any[]
    const currentStep = steps.find(s => s.id === enrollment.currentStepId)

    if (!currentStep) {
      // Step not found, meaning automation changed or logic error
      await completeEnrollment(enrollmentId, 'FAILED', enrollment.stepHistory, enrollment.automationId)
      return NextResponse.json({ error: 'Current step not found in automation' }, { status: 500 })
    }

    // Prepare history update
    const stepHistory = Array.isArray(enrollment.stepHistory) ? [...enrollment.stepHistory] : []
    const executedAt = new Date().toISOString()
    let nextStepId: string | undefined = undefined

    // Execute step logic
    try {
      switch (currentStep.type) {
        case 'send_email': {
          const templateId = currentStep.config.templateId
          if (!templateId) throw new Error('Template ID missing')
          
          const template = await prisma.emailTemplate.findUnique({
            where: { id: templateId }
          })

          if (!template) throw new Error('Template not found')

          // Replace variables
          let html = template.htmlContent
          html = html.replace(/{{first_name}}/gi, enrollment.contact.firstName || '')
          html = html.replace(/{{last_name}}/gi, enrollment.contact.lastName || '')
          html = html.replace(/{{email}}/gi, enrollment.contact.email)

          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          html = injectTracking(html, enrollment.automationId, enrollment.contactId, baseUrl)

          // Send email
          // In a real app, you would need fromName and fromEmail configured either on the template or automation
          await sendEmail({
            to: enrollment.contact.email,
            subject: template.subject,
            html,
          })

          // Record event
          await prisma.emailEvent.create({
            data: {
              userId: enrollment.automation.userId,
              type: 'SENT',
              contactId: enrollment.contactId,
              automationId: enrollment.automationId,
            }
          })

          nextStepId = currentStep.nextStepId
          stepHistory.push({ stepId: currentStep.id, executedAt, result: 'email_sent' })
          break
        }

        case 'wait': {
          const durationSeconds = currentStep.config.durationSeconds || 0
          if (durationSeconds > 0) {
            // Schedule callback via QStash
            if (qstash) {
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
              await qstash.publishJSON({
                url: `${baseUrl}/api/automations/execute`,
                body: { enrollmentId, stepDepth: 0 }, // Reset depth for new execution thread
                delay: durationSeconds,
              })
            } else {
              // Fallback for local dev without QStash (not for production!)
              setTimeout(() => {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                fetch(`${baseUrl}/api/automations/execute`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ enrollmentId, stepDepth: 0 })
                }).catch(console.error)
              }, durationSeconds * 1000)
            }
          }
          
          // IMPORTANT: Update history and current step to the NEXT step now, 
          // but DO NOT recursively call execute yet. The webhook callback will pick it up from there.
          stepHistory.push({ stepId: currentStep.id, executedAt, result: `wait_${durationSeconds}s` })
          
          if (currentStep.nextStepId) {
            await prisma.automationEnrollment.update({
              where: { id: enrollmentId },
              data: {
                currentStepId: currentStep.nextStepId,
                stepHistory: stepHistory as any,
              }
            })
          } else {
            // Wait was the last step
            await completeEnrollment(enrollmentId, 'COMPLETED', stepHistory, enrollment.automationId)
          }

          return NextResponse.json({ message: 'Wait step scheduled', nextStepId: currentStep.nextStepId })
        }

        case 'condition': {
          const filters = currentStep.config.filters || []
          const isMatch = evaluateSegment(filters, enrollment.contact)
          
          nextStepId = isMatch ? currentStep.truePathStepId : currentStep.falsePathStepId
          stepHistory.push({ stepId: currentStep.id, executedAt, result: isMatch ? 'true_path' : 'false_path' })
          break
        }

        case 'add_tag': {
          const tag = currentStep.config.tag
          if (tag && !enrollment.contact.tags.includes(tag)) {
            await prisma.contact.update({
              where: { id: enrollment.contactId },
              data: { tags: { push: tag } }
            })
          }
          nextStepId = currentStep.nextStepId
          stepHistory.push({ stepId: currentStep.id, executedAt, result: `added_tag_${tag}` })
          break
        }

        case 'remove_tag': {
          const tagToRemove = currentStep.config.tag
          if (tagToRemove && enrollment.contact.tags.includes(tagToRemove)) {
            const newTags = enrollment.contact.tags.filter((t: string) => t !== tagToRemove)
            await prisma.contact.update({
              where: { id: enrollment.contactId },
              data: { tags: newTags }
            })
          }
          nextStepId = currentStep.nextStepId
          stepHistory.push({ stepId: currentStep.id, executedAt, result: `removed_tag_${tagToRemove}` })
          break
        }

        case 'end': {
          stepHistory.push({ stepId: currentStep.id, executedAt, result: 'ended' })
          await completeEnrollment(enrollmentId, 'COMPLETED', stepHistory, enrollment.automationId)
          return NextResponse.json({ message: 'Automation completed' })
        }

        default:
          throw new Error(`Unknown step type: ${currentStep.type}`)
      }

      // If we didn't return early (e.g. on wait or end) and have a next step, update and recurse
      if (nextStepId) {
        await prisma.automationEnrollment.update({
          where: { id: enrollmentId },
          data: {
            currentStepId: nextStepId,
            stepHistory: stepHistory as any,
          }
        })

        // Recursively execute next step immediately
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        fetch(`${baseUrl}/api/automations/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollmentId, stepDepth: stepDepth + 1 })
        }).catch(console.error)

      } else {
        // No next step defined, implicit end
        await completeEnrollment(enrollmentId, 'COMPLETED', stepHistory, enrollment.automationId)
      }

    } catch (stepError) {
      console.error(`Error executing step ${currentStep.id}:`, stepError)
      stepHistory.push({ 
        stepId: currentStep.id, 
        executedAt, 
        result: `error: ${stepError instanceof Error ? stepError.message : 'Unknown error'}` 
      })
      await completeEnrollment(enrollmentId, 'FAILED', stepHistory, enrollment.automationId)
    }

    return NextResponse.json({ message: 'Step executed successfully', stepType: currentStep.type })
  } catch (error) {
    console.error('Error in execute endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function completeEnrollment(enrollmentId: string, status: 'COMPLETED' | 'FAILED', stepHistory: any, automationId: string) {
  await prisma.automationEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status,
      completedAt: new Date(),
      stepHistory: stepHistory as any,
    }
  })

  if (status === 'COMPLETED') {
    await prisma.automation.update({
      where: { id: automationId },
      data: { totalCompleted: { increment: 1 } }
    })
  }
}
