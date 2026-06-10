"use client"

import { NumberTicker } from "@/components/ui/number-ticker"
import { BlurFade } from "@/components/ui/blur-fade"

const stats = [
  { value: 10, suffix: "M+", label: "Emails delivered" },
  { value: 98, suffix: "%", label: "Delivery rate" },
  { value: 150, suffix: "+", label: "Integrations" },
  { value: 4, suffix: ".9★", label: "Average rating" },
  { value: 99.99, suffix: "%", label: "Uptime SLA", decimals: 2 },
]

export function StatsSection() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="container-page py-10">
        <BlurFade inView>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat, i) => (
              <BlurFade key={stat.label} inView delay={i * 0.06}>
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="flex items-baseline gap-0.5">
                    <NumberTicker
                      value={stat.value}
                      decimalPlaces={stat.decimals ?? 0}
                      className="text-3xl font-black text-foreground sm:text-4xl"
                    />
                    <span className="text-xl font-bold text-primary">
                      {stat.suffix}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
