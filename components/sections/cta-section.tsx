"use client"

import Link from "next/link"
import { BlurFade } from "@/components/ui/blur-fade"
import { ArrowRight, Zap } from "lucide-react"

export function CtaSection() {
  return (
    <section className="section relative overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/5 via-card to-chart-2/5 px-8 py-16 text-center shadow-xl sm:px-16">
          
          <BlurFade
            delay={0}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary backdrop-blur-sm">
              <Zap className="h-3 w-3" />
              Start automating today
            </div>

            {/* Heading */}
            <h2 className="max-w-2xl text-balance text-foreground">
              Ready to put your email on{" "}
              <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                autopilot?
              </span>
            </h2>

            {/* Subtext */}
            <p className="mx-auto max-w-lg text-base text-muted-foreground">
              Join thousands of teams using Autonity to send smarter emails,
              save hours every week, and grow faster — without the manual work.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#get-started"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition-all hover:scale-[1.03] hover:bg-primary/90"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#learn-more"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-7 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                Book a demo
              </Link>
            </div>

            {/* Trust note */}
            <p className="text-xs text-muted-foreground">
              No credit card required · Free plan available · Setup in under 2
              minutes
            </p>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
