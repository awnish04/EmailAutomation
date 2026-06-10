"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Check,
  Zap,
  Eye,
  GitBranch,
  Layers,
  Mail,
  Users,
  Clock,
  Filter,
  Send,
  AlertCircle,
} from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { BlurFade } from "../ui/blur-fade"

// ─── Shared variants ──────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const itemFade: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Check className="h-4 w-4 shrink-0 text-primary" />
          {item}
        </li>
      ))}
    </ul>
  )
}

// ─── Layout constants (SVG units) ─────────────────────────────────────────────
const SVG_W = 560,
  SVG_H = 300
const PILL_W = 155,
  PILL_H = 44,
  PILL_RX = 22
const LEFT_X = 6,
  HUB_X = 200,
  HUB_W = 156,
  HUB_RX = 22,
  RIGHT_X = 392
// 4 rows evenly spaced; hub is vertically centred across middle two rows
const ROW_Y = [24, 84, 148, 208]
const HUB_TOP = 108 // top of hub pill = between rows 1 and 2

const triggers = [
  { label: "New Signup", sub: "someone joins", Icon: Users, color: "#34d399" },
  { label: "Link Clicked", sub: "email opened", Icon: Mail, color: "#94a3b8" },
  { label: "Payment Done", sub: "purchase made", Icon: Zap, color: "#94a3b8" },
  {
    label: "Unsubscribe",
    sub: "contact opts out",
    Icon: Filter,
    color: "#94a3b8",
  },
]
const outputs = [
  { label: "Wait 1 Day", sub: "then continue", Icon: Clock, color: "#fbbf24" },
  { label: "Send Welcome", sub: "free users", Icon: Send, color: "#6ee7b7" },
  { label: "Send Upgrade", sub: "paid users", Icon: Filter, color: "#c4b5fd" },
  { label: "Remove Tag", sub: "clean list", Icon: Users, color: "#94a3b8" },
]
const leftColors = ["#34d399", "#94a3b8", "#94a3b8", "#94a3b8"]
const rightColors = ["#fbbf24", "#6ee7b7", "#c4b5fd", "#94a3b8"]

// ─── Block 1: Email Flow Diagram ─────────────────────────────────────────────
// All pills AND connectors live inside one SVG viewBox — perfect pixel alignment
function EmailFlowDiagram() {
  const hubCY = HUB_TOP + PILL_H / 2

  const leftPaths = ROW_Y.map((ry) => {
    const x1 = LEFT_X + PILL_W,
      y1 = ry + PILL_H / 2
    const x2 = HUB_X,
      y2 = hubCY
    const cp = x1 + (x2 - x1) * 0.5
    return `M${x1},${y1} C${cp},${y1} ${cp},${y2} ${x2},${y2}`
  })

  const rightPaths = ROW_Y.map((ry) => {
    const x1 = HUB_X + HUB_W,
      y1 = hubCY
    const x2 = RIGHT_X,
      y2 = ry + PILL_H / 2
    const cp = x1 + (x2 - x1) * 0.5
    return `M${x1},${y1} C${cp},${y1} ${cp},${y2} ${x2},${y2}`
  })

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      {/* Dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Header bar */}
      <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3">
        <GitBranch className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold tracking-widest text-primary uppercase">
          Your Email Flow
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-[9px] tracking-widest text-muted-foreground uppercase">
            Running
          </span>
        </span>
      </div>

      {/* SVG canvas — pills + connectors share the same coordinate space */}
      <div
        className="relative w-full"
        style={{ paddingBottom: `${(SVG_H / SVG_W) * 100}%` }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ── Connector paths with animated travelling dots ── */}
          {leftPaths.map((d, i) => (
            <g key={`lp${i}`}>
              <motion.path
                d={d}
                fill="none"
                stroke={leftColors[i]}
                strokeWidth={1.4}
                strokeOpacity={i === 0 ? 0.8 : 0.3}
                strokeDasharray={i === 0 ? "0" : "5 4"}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: "easeOut" }}
              />
              <circle
                r={i === 0 ? 3 : 2.5}
                fill={leftColors[i]}
                opacity={i === 0 ? 0.9 : 0.5}
              >
                <animateMotion
                  dur={`${1.8 + i * 0.4}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.5}s`}
                  path={d}
                />
              </circle>
            </g>
          ))}
          {rightPaths.map((d, i) => (
            <g key={`rp${i}`}>
              <motion.path
                d={d}
                fill="none"
                stroke={rightColors[i]}
                strokeWidth={1.4}
                strokeOpacity={0.65}
                strokeDasharray={i === 1 ? "0" : "5 4"}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.9,
                  delay: 0.5 + i * 0.12,
                  ease: "easeOut",
                }}
              />
              <circle r="2.5" fill={rightColors[i]} opacity="0.8">
                <animateMotion
                  dur={`${1.6 + i * 0.35}s`}
                  repeatCount="indefinite"
                  begin={`${0.3 + i * 0.45}s`}
                  path={d}
                />
              </circle>
            </g>
          ))}

          {/* ── Left trigger pills ── */}
          {triggers.map(({ label, sub, color }, i) => {
            const py = ROW_Y[i],
              cx = LEFT_X + 22,
              cy = py + PILL_H / 2
            return (
              <g key={`trig${i}`}>
                <rect
                  x={LEFT_X}
                  y={py}
                  width={PILL_W}
                  height={PILL_H}
                  rx={PILL_RX}
                  fill="var(--card)"
                  stroke="var(--border)"
                  strokeOpacity="0.7"
                  strokeWidth="1"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="13"
                  fill={`${color}18`}
                  stroke={`${color}40`}
                  strokeWidth="1"
                />
                {/* Colour dot as icon stand-in */}
                <circle cx={cx} cy={cy} r="4" fill={color} opacity="0.85" />
                <text
                  x={LEFT_X + 42}
                  y={cy - 4}
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--foreground)"
                  fontFamily="ui-sans-serif,system-ui,sans-serif"
                >
                  {label}
                </text>
                <text
                  x={LEFT_X + 42}
                  y={cy + 9}
                  fontSize="9"
                  fill="var(--muted-foreground)"
                  fontFamily="ui-sans-serif,system-ui,sans-serif"
                >
                  {sub}
                </text>
                {i === 0 && (
                  <circle
                    cx={LEFT_X + PILL_W - 10}
                    cy={cy}
                    r="3"
                    fill="#34d399"
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0.3;1"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            )
          })}

          {/* ── Hub pill (dark, centred) ── */}
          <rect
            x={HUB_X}
            y={HUB_TOP}
            width={HUB_W}
            height={PILL_H}
            rx={HUB_RX}
            fill="var(--foreground)"
            opacity="0.92"
          />
          <circle
            cx={HUB_X + 26}
            cy={HUB_TOP + PILL_H / 2}
            r="13"
            fill="var(--background)"
            opacity="0.12"
          />
          {/* Zap bolt */}
          <path
            d={`M${HUB_X + 22},${HUB_TOP + 14} L${HUB_X + 28},${HUB_TOP + 22} L${HUB_X + 25},${HUB_TOP + 22} L${HUB_X + 31},${HUB_TOP + 30}`}
            stroke="var(--background)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.85"
          />
          <text
            x={HUB_X + HUB_W / 2 + 6}
            y={HUB_TOP + PILL_H / 2 - 4}
            fontSize="11"
            fontWeight="700"
            fill="var(--background)"
            textAnchor="middle"
            fontFamily="ui-sans-serif,system-ui,sans-serif"
          >
            Autonity AI
          </text>
          <text
            x={HUB_X + HUB_W / 2 + 6}
            y={HUB_TOP + PILL_H / 2 + 9}
            fontSize="9"
            fill="var(--background)"
            textAnchor="middle"
            opacity="0.6"
            fontFamily="ui-sans-serif,system-ui,sans-serif"
          >
            workflow engine
          </text>

          {/* ── Right output pills ── */}
          {outputs.map(({ label, sub, color }, i) => {
            const py = ROW_Y[i],
              cx = RIGHT_X + 22,
              cy = py + PILL_H / 2
            return (
              <g key={`out${i}`}>
                <rect
                  x={RIGHT_X}
                  y={py}
                  width={PILL_W}
                  height={PILL_H}
                  rx={PILL_RX}
                  fill="var(--card)"
                  stroke="var(--border)"
                  strokeOpacity="0.7"
                  strokeWidth="1"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="13"
                  fill={`${color}18`}
                  stroke={`${color}40`}
                  strokeWidth="1"
                />
                <circle cx={cx} cy={cy} r="4" fill={color} opacity="0.85" />
                <text
                  x={RIGHT_X + 42}
                  y={cy - 4}
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--foreground)"
                  fontFamily="ui-sans-serif,system-ui,sans-serif"
                >
                  {label}
                </text>
                <text
                  x={RIGHT_X + 42}
                  y={cy + 9}
                  fontSize="9"
                  fill="var(--muted-foreground)"
                  fontFamily="ui-sans-serif,system-ui,sans-serif"
                >
                  {sub}
                </text>
                <circle
                  cx={RIGHT_X + PILL_W - 10}
                  cy={cy}
                  r="3"
                  fill="#34d399"
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Footer status bar */}
      <div className="flex items-center gap-4 border-t border-border/40 bg-card/60 px-5 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] tracking-widest text-muted-foreground uppercase">
            3 paths active
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="text-[9px] tracking-widest text-muted-foreground uppercase">
            Sending now
          </span>
        </div>
        <div className="ml-auto text-[9px] tracking-widest text-muted-foreground uppercase">
          312 emails today
        </div>
      </div>
    </div>
  )
}

// ─── Block 2: Live Activity Log ───────────────────────────────────────────────
const logs = [
  {
    Icon: Users,
    label: "New contact added",
    sub: "sarah@example.com joined your list",
    time: "15:42:09",
    status: "success" as const,
  },
  {
    Icon: Filter,
    label: "Sorted into Paid group",
    sub: "Tag 'paid_user' applied automatically",
    time: "15:42:11",
    status: "success" as const,
  },
  {
    Icon: Mail,
    label: "Welcome email sent",
    sub: "Delivered to inbox in 0.3s",
    time: "15:45:46",
    status: "success" as const,
  },
  {
    Icon: AlertCircle,
    label: "Email bounced — retrying",
    sub: "Will retry automatically in 1 hour",
    time: "15:47:23",
    status: "warning" as const,
    detail: true,
  },
]

function WorkflowLogs() {
  return (
    <motion.div
      className="relative w-full rounded-2xl border border-border bg-card p-5 shadow-xl"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={itemFade} className="mb-4 flex items-center gap-2">
        <Layers className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-semibold tracking-widest text-primary uppercase">
          Live Activity
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Live
        </span>
      </motion.div>

      <div className="space-y-2">
        {logs.map((log, i) => {
          const { Icon } = log
          return (
            <motion.div key={i} variants={itemFade}>
              <div
                className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors duration-200 ${
                  log.status === "warning"
                    ? "border-amber-500/25 bg-amber-500/5"
                    : "cursor-pointer border-border bg-muted/30 hover:border-primary/25 hover:bg-primary/5"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                    log.status === "warning"
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-border bg-background/70"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${log.status === "warning" ? "text-amber-400" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-foreground">
                    {log.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {log.sub}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {log.time}
                  </span>
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${log.status === "warning" ? "bg-amber-400" : "bg-emerald-400"}`}
                  />
                </div>
              </div>
              {log.detail && (
                <div className="mt-1.5 ml-4 space-y-1">
                  <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    <span className="text-[11px] text-rose-400">
                      Address not found — delivery failed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-[11px] text-primary">
                      Autonity will retry automatically in 1 hour
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Block 3: AI Models Hub ───────────────────────────────────────────────────
const aiTools = [
  {
    name: "OpenAI",
    symbol: "⊕",
    color: "#34d399",
    border: "rgba(52,211,153,0.3)",
    bg: "rgba(52,211,153,0.07)",
  },
  {
    name: "Claude",
    symbol: "✳",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.3)",
    bg: "rgba(251,191,36,0.07)",
  },
  {
    name: "Gemini",
    symbol: "✦",
    color: "#60a5fa",
    border: "rgba(96,165,250,0.3)",
    bg: "rgba(96,165,250,0.07)",
  },
  {
    name: "Mistral",
    symbol: "M",
    color: "#fb923c",
    border: "rgba(251,146,60,0.3)",
    bg: "rgba(251,146,60,0.07)",
  },
  {
    name: "Stability",
    symbol: "◈",
    color: "#c084fc",
    border: "rgba(192,132,252,0.3)",
    bg: "rgba(192,132,252,0.07)",
  },
]

const HUB3_SVG_W = 420,
  HUB3_SVG_H = 260
const HUB3_PILL_W = 128,
  HUB3_PILL_H = 40
const HUB3_LEFT_X = 4
const HUB3_HUB_CX = 268,
  HUB3_HUB_CY = 130,
  HUB3_HUB_R = 30
const HUB3_OUT_X = 322,
  HUB3_OUT_W = 90

const pilYs = Array.from(
  { length: aiTools.length },
  (_, i) => 18 + i * ((HUB3_SVG_H - 36) / (aiTools.length - 1))
)

function AIHubDiagram() {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(
      () => setActiveIdx((p) => (p + 1) % aiTools.length),
      2000
    )
    return () => clearInterval(t)
  }, [])

  const x1 = HUB3_LEFT_X + HUB3_PILL_W
  const x2 = HUB3_HUB_CX - HUB3_HUB_R
  const activePath = (() => {
    const y1 = pilYs[activeIdx],
      y2 = HUB3_HUB_CY
    const cp = x1 + (x2 - x1) * 0.5
    return `M${x1},${y1} C${cp},${y1} ${cp},${y2} ${x2},${y2}`
  })()

  const outYs = [HUB3_HUB_CY - 24, HUB3_HUB_CY + 24]
  const outPaths = outYs.map((oy) => {
    const ox1 = HUB3_HUB_CX + HUB3_HUB_R,
      ox2 = HUB3_OUT_X
    const cp = ox1 + (ox2 - ox1) * 0.5
    return `M${ox1},${HUB3_HUB_CY} C${cp},${HUB3_HUB_CY} ${cp},${oy} ${ox2},${oy}`
  })

  return (
    <div className="relative w-full" style={{ height: HUB3_SVG_H }}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${HUB3_SVG_W} ${HUB3_SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Inactive stub lines */}
        {pilYs.map((py, i) => {
          if (i === activeIdx) return null
          const cp = x1 + (x2 - x1) * 0.5
          const d = `M${x1},${py} C${cp},${py} ${cp},${HUB3_HUB_CY} ${x2},${HUB3_HUB_CY}`
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="4 5"
              opacity="0.35"
            />
          )
        })}

        {/* Active beam */}
        <path
          key={`beam-${activeIdx}`}
          d={activePath}
          fill="none"
          stroke={aiTools[activeIdx].color}
          strokeWidth="1.8"
          opacity="0.85"
        />
        <circle
          key={`dot-${activeIdx}`}
          r="3.5"
          fill={aiTools[activeIdx].color}
          opacity="0.9"
        >
          <animateMotion
            dur="1.4s"
            repeatCount="indefinite"
            path={activePath}
          />
        </circle>

        {/* Hub → output paths */}
        {outPaths.map((d, i) => (
          <g key={`out${i}`}>
            <path
              d={d}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.3"
              opacity="0.5"
              strokeDasharray={i === 0 ? "0" : "4 4"}
            />
            <circle r="2.5" fill="var(--primary)" opacity="0.7">
              <animateMotion
                dur={`${1.3 + i * 0.3}s`}
                repeatCount="indefinite"
                begin={`${i * 0.35}s`}
                path={d}
              />
            </circle>
          </g>
        ))}

        {/* Hub circle */}
        <circle
          cx={HUB3_HUB_CX}
          cy={HUB3_HUB_CY}
          r={HUB3_HUB_R}
          fill="var(--foreground)"
          opacity="0.92"
        />
        <path
          d={`M${HUB3_HUB_CX - 8},${HUB3_HUB_CY - 10} L${HUB3_HUB_CX + 3},${HUB3_HUB_CY} L${HUB3_HUB_CX - 3},${HUB3_HUB_CY} L${HUB3_HUB_CX + 8},${HUB3_HUB_CY + 10}`}
          fill="none"
          stroke="var(--background)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Output pill labels */}
        {[
          { label: "Your Email", color: "var(--primary)" },
          { label: "Auto-sent", color: "#34d399" },
        ].map(({ label, color }, i) => {
          const oy = outYs[i]
          return (
            <g key={`outlabel${i}`}>
              <rect
                x={HUB3_OUT_X}
                y={oy - 14}
                width={HUB3_OUT_W}
                height={28}
                rx="14"
                fill={`${color === "var(--primary)" ? "var(--primary)" : color}18`}
                stroke={`${color === "var(--primary)" ? "var(--primary)" : color}40`}
                strokeWidth="1"
              />
              <text
                x={HUB3_OUT_X + HUB3_OUT_W / 2}
                y={oy + 5}
                fontSize="10"
                fontWeight="600"
                fill={color}
                textAnchor="middle"
                fontFamily="ui-sans-serif,system-ui,sans-serif"
              >
                {label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Left AI tool pill buttons */}
      <div
        className="absolute top-0 bottom-0 flex flex-col justify-between"
        style={{
          left: HUB3_LEFT_X,
          width: HUB3_PILL_W,
          paddingTop: 18,
          paddingBottom: 18,
        }}
      >
        {aiTools.map((tool, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            style={{
              height: HUB3_PILL_H,
              borderColor: i === activeIdx ? tool.border : "var(--border)",
              backgroundColor: i === activeIdx ? tool.bg : "var(--card)",
            }}
            className="flex cursor-pointer items-center gap-2.5 rounded-full border px-3.5 text-left transition-all duration-200 hover:border-primary/30"
          >
            <span
              className="text-sm leading-none font-bold"
              style={{
                color: i === activeIdx ? tool.color : "var(--muted-foreground)",
              }}
            >
              {tool.symbol}
            </span>
            <span
              className="text-[11px] font-medium"
              style={{
                color: i === activeIdx ? tool.color : "var(--muted-foreground)",
              }}
            >
              {tool.name}
            </span>
          </button>
        ))}
      </div>

      {/* Active label */}
      <div className="absolute right-0 bottom-1 left-0 text-center text-[9px] tracking-widest text-muted-foreground uppercase">
        {aiTools[activeIdx].name} writing your emails
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function IntegrationsSection() {
  return (
    <section id="how-it-works" className="section overflow-hidden bg-muted/20">
      <div className="container-page">
        {/* Section heading */}
        <BlurFade inView className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
            How it works
          </div>
          <h2 className="text-balance text-foreground">
            Built for every workflow
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Set it up once and let it run. Autonity sends the right email to the
            right person at the right time — automatically, every time.
          </p>
        </BlurFade>

        <div className="space-y-28">
          {/* ── Block 1: Workflow diagram ── */}
          <motion.div
            className="grid items-center gap-12 md:grid-cols-2"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="order-2 md:order-1">
              <EmailFlowDiagram />
            </div>
            <div className="order-1 space-y-4 md:order-2">
              <Badge className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] tracking-widest text-primary uppercase">
                <GitBranch className="mr-1.5 h-3 w-3" /> Smart Routing
              </Badge>
              <h2 className="text-balance text-foreground">
                Emails That Know{" "}
                <span className="text-primary">What to Do Next</span>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Build email workflows that react to what your contacts actually
                do. When someone signs up they get a welcome email. When they
                click an upgrade link they get a personalised offer. No manual
                work, no missed moments — it all happens automatically.
              </p>
              <FeatureList
                items={[
                  "Reacts to real actions",
                  "Plain-English conditions",
                  "Different path per person",
                  "Runs 24/7 without you",
                ]}
              />
            </div>
          </motion.div>

          {/* ── Block 2: Live activity log ── */}
          <motion.div
            className="grid items-center gap-12 md:grid-cols-2"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="space-y-4">
              <Badge className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] tracking-widest text-primary uppercase">
                <Eye className="mr-1.5 h-3 w-3" /> Activity Log
              </Badge>
              <h2 className="text-balance text-foreground">
                Always Know{" "}
                <span className="text-primary">What&apos;s Happening</span>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Every email Autonity sends, every contact that joins, every
                bounce that happens — you see it all in real time. If something
                goes wrong, you&apos;ll be notified instantly and the system
                will fix it automatically. No digging through logs, no
                surprises.
              </p>
              <FeatureList
                items={[
                  "See every action live",
                  "Human-readable logs",
                  "Bounce auto-retry",
                  "Full history saved",
                ]}
              />
            </div>
            <WorkflowLogs />
          </motion.div>

          {/* ── Block 3: AI Models hub ── */}
          <motion.div
            className="grid items-center gap-12 rounded-3xl border border-border bg-card p-8 md:grid-cols-2 md:p-14"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="space-y-5">
              <Badge className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] tracking-widest text-primary uppercase">
                <Zap className="mr-1.5 h-3 w-3" /> AI Engine
              </Badge>
              <h2 className="text-balance text-foreground">
                Pick Any AI Model.{" "}
                <span className="text-primary">Write Better Emails.</span>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Autonity connects to every major AI provider — OpenAI, Claude,
                Gemini, Mistral, and more. Your AI writes personalised email
                copy for each contact based on their behaviour. Switch models
                any time without touching your workflows.
              </p>
              <FeatureList
                items={[
                  "5+ AI models included",
                  "Swap without rebuilding",
                  "AI writes the copy",
                  "Personalised per contact",
                ]}
              />
              <Button className="mt-2 w-fit cursor-pointer rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/30">
                Get Started Free
              </Button>
            </div>
            <AIHubDiagram />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
