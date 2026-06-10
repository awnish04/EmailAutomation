"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Zap } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { cn } from "@/lib/utils"

const plans = [
  {
    id: "free",
    name: "Free",
    desc: "Perfect for getting started",
    monthly: 0,
    yearly: 0,
    highlight: false,
    features: [
      "500 emails / month",
      "1 active workflow",
      "Basic AI personalization",
      "Email support",
      "3 integrations",
      "Analytics dashboard",
    ],
    cta: "Start for free",
    ctaHref: "#get-started",
  },
  {
    id: "pro",
    name: "Pro",
    desc: "For growing teams",
    monthly: 29,
    yearly: 23,
    highlight: true,
    badge: "Most popular",
    features: [
      "50,000 emails / month",
      "Unlimited workflows",
      "Full AI suite (GPT-4, Claude)",
      "Priority support",
      "150+ integrations",
      "Advanced analytics",
      "A/B testing",
      "Custom domains",
    ],
    cta: "Start Pro trial",
    ctaHref: "#get-started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    desc: "For large-scale operations",
    monthly: null,
    yearly: null,
    highlight: false,
    features: [
      "Unlimited emails",
      "Unlimited workflows",
      "Custom AI model fine-tuning",
      "Dedicated account manager",
      "SLA guarantee (99.99%)",
      "SSO & SAML",
      "Custom integrations",
      "On-premise option",
    ],
    cta: "Contact sales",
    ctaHref: "#contact",
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="section bg-muted/20">
      <div className="container-page">
        {/* Header */}
        <BlurFade inView className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
            Pricing
          </div>
          <h2 className="text-balance text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            No hidden fees. No surprises. Start free and scale as you grow.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card px-2 py-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                !annual
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                annual
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  annual ? "bg-white/20" : "bg-primary/10 text-primary"
                )}
              >
                −20%
              </span>
            </button>
          </div>
        </BlurFade>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <BlurFade key={plan.id} inView delay={i * 0.08}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-300",
                  plan.highlight
                    ? "border-primary/50 bg-card shadow-xl ring-1 shadow-primary/10 ring-primary/20"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-lg"
                )}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                      <Zap className="h-3 w-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {plan.desc}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.monthly === null ? (
                    <div>
                      <span className="text-4xl font-black text-foreground">
                        Custom
                      </span>
                    </div>
                  ) : plan.monthly === 0 ? (
                    <div>
                      <span className="text-4xl font-black text-foreground">
                        Free
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        forever
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-foreground">
                        ${annual ? plan.yearly : plan.monthly}
                      </span>
                      <span className="mb-1 text-sm text-muted-foreground">
                        / mo
                      </span>
                      {annual && (
                        <span className="mb-1 ml-1 text-xs text-muted-foreground line-through">
                          ${plan.monthly}
                        </span>
                      )}
                    </div>
                  )}
                  {annual && plan.yearly && (
                    <p className="mt-1 text-xs text-primary">
                      Billed ${(plan.yearly * 12).toFixed(0)}/year
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={cn(
                    "mb-7 flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all",
                    plan.highlight
                      ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/30"
                      : "border border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div className="mb-5 border-t border-border" />

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
          ))}
        </div>

        {/* Bottom note */}
        <BlurFade inView className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a{" "}
            <span className="font-semibold text-foreground">
              7-day free trial
            </span>
            . No credit card required.{" "}
            <Link href="#" className="text-primary hover:underline">
              Compare all features →
            </Link>
          </p>
        </BlurFade>
      </div>
    </section>
  )
}
