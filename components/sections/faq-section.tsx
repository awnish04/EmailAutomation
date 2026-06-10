"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BlurFade } from "@/components/ui/blur-fade"

const faqs = [
  {
    id: "f-1",
    question: "What is Autonity and how does it work?",
    answer:
      "Autonity is an AI-powered email automation platform. You connect your email provider, build workflows using our visual drag-and-drop builder, and let AI handle sending, personalisation, and optimisation. Emails go out at the right time to the right person — automatically.",
  },
  {
    id: "f-2",
    question: "Which email providers does Autonity support?",
    answer:
      "Autonity works with Gmail, Outlook, SMTP, SendGrid, Mailgun, Amazon SES, and more. You can connect multiple providers and switch between them without changing your workflows.",
  },
  {
    id: "f-3",
    question: "How does AI personalisation work?",
    answer:
      "Our AI analyses subscriber behaviour — opens, clicks, time spent, purchase history — and dynamically adjusts email content, subject lines, and send times for each individual. No manual segmentation required.",
  },
  {
    id: "f-4",
    question: "Can I import my existing contacts and templates?",
    answer:
      "Yes. You can import contacts via CSV, connect your CRM directly, or use our API. Existing HTML email templates can be imported and edited in our visual builder.",
  },
  {
    id: "f-5",
    question: "What AI models does Autonity use?",
    answer:
      "Autonity integrates with OpenAI (GPT-4), Anthropic (Claude), Google (Gemini), Mistral, and more. You can choose which model powers each workflow, or let Autonity automatically select the best one for the task.",
  },
  {
    id: "f-6",
    question: "Is my data secure?",
    answer:
      "Yes. All data is encrypted in transit and at rest. We are SOC 2 Type II compliant and GDPR-ready. Your subscriber data is never used to train AI models or shared with third parties.",
  },
  {
    id: "f-7",
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. No contracts, no lock-in. Cancel from your account settings at any time and you retain access until the end of your billing period.",
  },
  {
    id: "f-8",
    question: "Do you offer a free trial?",
    answer:
      "Yes — all paid plans include a 7-day free trial with full feature access. No credit card required to start. The Free plan is also available indefinitely with up to 500 emails per month.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="section bg-background">
      <div className="container-page max-w-3xl">
        <BlurFade inView className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
            FAQ
          </div>
          <h2 className="text-balance text-foreground">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Everything you need to know about Autonity. Can&apos;t find the
            answer?{" "}
            <a href="#contact" className="text-primary hover:underline">
              Talk to us.
            </a>
          </p>
        </BlurFade>

        <BlurFade inView delay={0.1}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="rounded-xl border border-border bg-card px-5 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="py-4 text-left text-sm font-semibold text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </BlurFade>
      </div>
    </section>
  )
}
