"use client"

import Link from "next/link"
import { BlurFade } from "./ui/blur-fade"
import { WorldMap } from "@/components/ui/map"
import { ArrowRight, Zap } from "lucide-react"

const MAP_DOTS = [
  { start: { lat: 64.2, lng: -149.49 }, end: { lat: 34.05, lng: -118.24 } },
  { start: { lat: 64.2, lng: -149.49 }, end: { lat: -15.8, lng: -47.89 } },
  { start: { lat: -15.8, lng: -47.89 }, end: { lat: 38.72, lng: -9.14 } },
  { start: { lat: 51.51, lng: -0.13 }, end: { lat: 28.61, lng: 77.21 } },
  { start: { lat: 28.61, lng: 77.21 }, end: { lat: 43.13, lng: 131.91 } },
  { start: { lat: 28.61, lng: 77.21 }, end: { lat: -1.29, lng: 36.82 } },
  { start: { lat: 40.71, lng: -74.01 }, end: { lat: 51.51, lng: -0.13 } },
  { start: { lat: 35.68, lng: 139.69 }, end: { lat: 1.35, lng: 103.82 } },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden pt-(--navbar-height)">

      {/* ── World map — full bleed behind content ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="w-full min-w-[860px]">
            <WorldMap
              dots={MAP_DOTS}
              lineColor="var(--primary)"
              loop
              animationDuration={2}
            />
          </div>
        </div>
      </div>

      {/* ── Edge vignettes ── */}
      <div className="pointer-events-none absolute inset-0 z-1">
        <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-background via-background/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-background to-transparent" />
        <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-background to-transparent" />
      </div>

      {/* ── Ambient glow ── */}
      <div className="pointer-events-none absolute inset-0 z-2">
        <div className="absolute top-1/2 left-1/2 h-[520px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[150px]" />
      </div>

      {/* ── Hero content ── */}
      <div className="container-page relative z-10 flex min-h-[calc(100vh-var(--navbar-height))] flex-col items-center justify-center py-20 text-center">
        <BlurFade delay={0} className="flex flex-col items-center gap-6">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold tracking-widest text-primary uppercase backdrop-blur-sm">
            <Zap className="h-3 w-3 fill-primary" />
            AI-powered email automation
          </div>

          {/* Headline */}
          <h1 className="max-w-[22ch] text-balance leading-[1.12] tracking-tight">
            <span className="block font-medium text-foreground/60">
              Send smarter emails.
            </span>
            <span className="block bg-linear-to-r from-primary via-chart-2 to-primary bg-clip-text font-extrabold text-transparent">
              Automate everything.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-[38ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            Connect any trigger to any email action. Route contacts through
            AI-personalised workflows —{" "}
            <span className="font-medium text-foreground/80">
              no code, no limits.
            </span>
          </p>

          {/* CTAs */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="btn-base btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.03] hover:shadow-primary/40"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how-it-works"
              className="btn-base btn-outline rounded-full px-7 py-3 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-accent"
            >
              See how it works
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
            {[
              ["10M+",   "Emails delivered"],
              ["99.99%", "Uptime SLA"],
              ["<2 min", "Setup time"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 rounded-2xl border border-border/40 bg-background/60 px-4 py-4 shadow-sm backdrop-blur-md sm:px-6"
              >
                <span className="text-xl font-black text-foreground sm:text-2xl">
                  {value}
                </span>
                <span className="text-[11px] leading-tight text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </BlurFade>

        {/* ── Trusted by ── */}
        <BlurFade delay={0.3} className="mt-12 w-full max-w-xl">
          <div className="rounded-3xl border border-border/40 bg-background/50 px-6 py-5 shadow-sm backdrop-blur-md sm:px-8">
            <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Trusted by modern teams worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {["AlphaWave", "Boltshift", "Clandestine", "ContrastAI", "Leapyear", "Lign"].map(
                (brand) => (
                  <span
                    key={brand}
                    className="text-sm font-semibold tracking-tight text-foreground/40 transition-colors hover:text-foreground/80"
                  >
                    {brand}
                  </span>
                )
              )}
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
