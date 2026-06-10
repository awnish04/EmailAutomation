"use client"

import { Handshake, Bot, Lock, Settings, BarChart2, Link2 } from "lucide-react"
import { BlurFade } from "./ui/blur-fade"

const features = [
  {
    name: "Real-time Collaboration",
    description:
      "Work together instantly with live updates, shared workspaces, and conflict-free syncing across your entire team.",
    icon: Handshake,
    // theme colors only — primary tint
    cardClass: "border-primary/20 bg-primary/5 hover:border-primary/40",
    iconClass: "border-primary/20 bg-primary/10 text-primary",
    glowClass: "ring-primary/20",
  },
  {
    name: "AI-Powered Automation",
    description:
      "Automate repetitive tasks with intelligent bots that learn your workflows and adapt over time.",
    icon: Bot,
    cardClass: "border-chart-2/20 bg-chart-2/5 hover:border-chart-2/40",
    iconClass: "border-chart-2/20 bg-chart-2/10 text-chart-2",
    glowClass: "ring-chart-2/20",
  },
  {
    name: "Secure Data Storage",
    description:
      "End-to-end encryption for all your data, with SOC 2 compliance and zero-knowledge architecture.",
    icon: Lock,
    cardClass: "border-chart-3/20 bg-chart-3/5 hover:border-chart-3/40",
    iconClass: "border-chart-3/20 bg-chart-3/10 text-chart-3",
    glowClass: "ring-chart-3/20",
  },
  {
    name: "Custom Workflows",
    description:
      "Build tailored pipelines for any process with a visual drag-and-drop builder — no code required.",
    icon: Settings,
    cardClass: "border-chart-4/20 bg-chart-4/5 hover:border-chart-4/40",
    iconClass: "border-chart-4/20 bg-chart-4/10 text-chart-4",
    glowClass: "ring-chart-4/20",
  },
  {
    name: "Analytics Dashboard",
    description:
      "Gain deep insights with real-time metrics, custom reports, and AI-generated performance summaries.",
    icon: BarChart2,
    cardClass: "border-chart-5/20 bg-chart-5/5 hover:border-chart-5/40",
    iconClass: "border-chart-5/20 bg-chart-5/10 text-chart-5",
    glowClass: "ring-chart-5/20",
  },
  {
    name: "150+ Integrations",
    description:
      "Connect with your favorite tools instantly — Slack, Notion, Salesforce, HubSpot, and many more.",
    icon: Link2,
    cardClass: "border-chart-1/20 bg-chart-1/5 hover:border-chart-1/40",
    iconClass: "border-chart-1/20 bg-chart-1/10 text-chart-1",
    glowClass: "ring-chart-1/20",
  },
]

export function FeaturesSection() {
  return (
    <section className="section bg-background">
      <div className="container-page">
        {/* Section header */}
        <BlurFade inView className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
            Why Autonity
          </div>
          <h2 className="text-balance text-foreground">
            Everything you need to automate
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            A premium, no-code automation platform that blends AI, security, and
            flexibility — built for modern teams.
          </p>
        </BlurFade>

        {/* Feature grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <BlurFade key={feature.name} inView delay={i * 0.08}>
                <div
                  className={`group relative h-full overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${feature.cardClass}`}
                >
                  {/* Icon container */}
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${feature.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Text */}
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {feature.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>

                  {/* Hover ring glow */}
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 transition-opacity duration-300 group-hover:opacity-100 ${feature.glowClass}`}
                  />
                </div>
              </BlurFade>
            )
          })}
        </div>
      </div>
    </section>
  )
}
