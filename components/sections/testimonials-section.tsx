"use client"

import { Marquee } from "@/components/ui/marquee"
import { BlurFade } from "@/components/ui/blur-fade"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Head of Growth",
    company: "Nexlify",
    avatar: "SC",
    rating: 5,
    text: "Autonity cut our email setup time from days to minutes. The AI-powered workflows are genuinely smart — they adapt based on user behaviour without us touching anything.",
  },
  {
    name: "Marcus Webb",
    role: "Founder",
    company: "LaunchPad",
    avatar: "MW",
    rating: 5,
    text: "We went from 12% to 34% open rates in 6 weeks. The conditional logic builder is the best I've used — no code, no headaches, just results.",
  },
  {
    name: "Priya Nair",
    role: "Marketing Director",
    company: "Stackwise",
    avatar: "PN",
    rating: 5,
    text: "The integrations are seamless. We connected HubSpot, Slack, and our internal CRM in under 10 minutes. The workflow logs make debugging a breeze.",
  },
  {
    name: "James Okafor",
    role: "CTO",
    company: "Vaultly",
    avatar: "JO",
    rating: 5,
    text: "99.99% uptime is not a marketing claim — we've been running mission-critical email flows for 8 months without a single incident. Incredible reliability.",
  },
  {
    name: "Elena Russo",
    role: "Product Manager",
    company: "Driftly",
    avatar: "ER",
    rating: 5,
    text: "Switching AI models mid-workflow without breaking anything is a game changer. We test Claude vs GPT-4 on the same campaign and pick the winner instantly.",
  },
  {
    name: "Tom Hargreaves",
    role: "Email Strategist",
    company: "Growthbase",
    avatar: "TH",
    rating: 5,
    text: "The analytics dashboard shows exactly where subscribers drop off. We fixed our onboarding sequence in one afternoon and saw a 22% lift in activation.",
  },
  {
    name: "Aisha Kamara",
    role: "Operations Lead",
    company: "Meridian",
    avatar: "AK",
    rating: 5,
    text: "Our team of 3 manages email automation for 50,000 subscribers. Autonity makes that possible — the automation handles 90% of the work automatically.",
  },
  {
    name: "Daniel Park",
    role: "CEO",
    company: "Loopify",
    avatar: "DP",
    rating: 5,
    text: "Best investment we made this year. ROI was positive within the first month. The drip campaign builder alone is worth the subscription price.",
  },
]

function TestimonialCard({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="relative w-72 shrink-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Stars */}
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
        ))}
      </div>

      {/* Quote */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{t.text}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {t.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t.name}</p>
          <p className="text-xs text-muted-foreground">
            {t.role} · {t.company}
          </p>
        </div>
      </div>
    </div>
  )
}

const firstRow = testimonials.slice(0, 4)
const secondRow = testimonials.slice(4)

export function TestimonialsSection() {
  return (
    <section className="section overflow-hidden bg-background">
      <div className="container-page mb-14">
        <BlurFade inView className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
            Customer stories
          </div>
          <h2 className="text-balance text-foreground">
            Loved by teams worldwide
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            From solo founders to enterprise teams — here&apos;s what they say
            about Autonity.
          </p>
        </BlurFade>
      </div>

      {/* Row 1 — left to right */}
      <Marquee pauseOnHover className="[--duration:40s]">
        {firstRow.map((t) => (
          <TestimonialCard key={t.name} t={t} />
        ))}
      </Marquee>

      {/* Row 2 — right to left */}
      <Marquee reverse pauseOnHover className="mt-4 [--duration:35s]">
        {secondRow.map((t) => (
          <TestimonialCard key={t.name} t={t} />
        ))}
      </Marquee>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-linear-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-linear-to-l from-background to-transparent" />
    </section>
  )
}
