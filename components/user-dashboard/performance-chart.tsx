"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  sent: {
    label: "Sent",
    color: "var(--chart-1)",
  },
  opened: {
    label: "Opened",
    color: "var(--chart-2)",
  },
  clicked: {
    label: "Clicked",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

interface PerformanceChartProps {
  data: {
    date: string
    sent: number
    opened: number
    clicked: number
  }[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card className="flex h-full flex-col bg-background/50 border-white/10">
      <CardHeader>
        <CardTitle>Email Performance Last 30 Days</CardTitle>
        <CardDescription>
          Daily aggregate of emails sent, opened, and clicked.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeOpacity={0.1} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px] bg-background border-white/10"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Line
              dataKey="sent"
              type="monotone"
              stroke="var(--color-sent)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="opened"
              type="monotone"
              stroke="var(--color-opened)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="clicked"
              type="monotone"
              stroke="var(--color-clicked)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
