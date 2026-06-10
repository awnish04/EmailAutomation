"use client"

import { useRef, useMemo } from "react"
import { motion } from "framer-motion"
import DottedMap from "dotted-map"
import Image from "next/image"
import { useTheme } from "next-themes"

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number }
    end: { lat: number; lng: number }
  }>
  lineColor?: string
  animationDuration?: number
  loop?: boolean
}

export function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
  animationDuration = 2,
  loop = true,
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { resolvedTheme } = useTheme()

  const map = useMemo(
    () => new DottedMap({ height: 100, grid: "diagonal" }),
    []
  )

  const svgMap = useMemo(
    () =>
      map.getSVG({
        radius: 0.22,
        color: resolvedTheme === "dark" ? "#ffffff30" : "#00000025",
        shape: "circle",
        backgroundColor: "transparent",
      }),
    [map, resolvedTheme]
  )

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360)
    const y = (90 - lat) * (400 / 180)
    return { x, y }
  }

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2
    const midY = Math.min(start.y, end.y) - 50
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`
  }

  const staggerDelay = 0.3
  const totalAnimationTime = dots.length * staggerDelay + animationDuration
  const pauseTime = 2
  const fullCycleDuration = totalAnimationTime + pauseTime

  return (
    <div
      className="relative w-full overflow-hidden font-sans"
      style={{ aspectRatio: "2/1" }}
    >
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="pointer-events-none h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] object-cover select-none"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
        priority
      />

      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Animated arcs */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng)
          const endPoint = projectPoint(dot.end.lat, dot.end.lng)
          const startTime = (i * staggerDelay) / fullCycleDuration
          const endTime =
            (i * staggerDelay + animationDuration) / fullCycleDuration
          const resetTime = totalAnimationTime / fullCycleDuration

          return (
            <g key={`path-group-${i}`}>
              {/* Arc — strokeWidth 0.5 for a thin, delicate line */}
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={
                  loop ? { pathLength: [0, 0, 1, 1, 0] } : { pathLength: 1 }
                }
                transition={
                  loop
                    ? {
                        duration: fullCycleDuration,
                        times: [0, startTime, endTime, resetTime, 1],
                        ease: "easeInOut",
                        repeat: Infinity,
                      }
                    : {
                        duration: animationDuration,
                        delay: i * staggerDelay,
                        ease: "easeInOut",
                      }
                }
              />
              {/* Traveling dot along the arc */}
              {loop && (
                <motion.circle
                  r="1.5"
                  fill={lineColor}
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{
                    offsetDistance: [null, "0%", "100%", "100%", "100%"],
                    opacity: [0, 0, 1, 0, 0],
                  }}
                  transition={{
                    duration: fullCycleDuration,
                    times: [0, startTime, endTime, resetTime, 1],
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  style={{
                    offsetPath: `path('${createCurvedPath(startPoint, endPoint)}')`,
                  }}
                />
              )}
            </g>
          )
        })}

        {/* Endpoint pulse dots — small and subtle */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng)
          const endPoint = projectPoint(dot.end.lat, dot.end.lng)

          return (
            <g key={`points-group-${i}`}>
              {/* Start */}
              <circle
                cx={startPoint.x}
                cy={startPoint.y}
                r="1.5"
                fill={lineColor}
              />
              <circle
                cx={startPoint.x}
                cy={startPoint.y}
                r="1.5"
                fill={lineColor}
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  from="1.5"
                  to="5"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.4"
                  to="0"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* End */}
              <circle
                cx={endPoint.x}
                cy={endPoint.y}
                r="1.5"
                fill={lineColor}
              />
              <circle
                cx={endPoint.x}
                cy={endPoint.y}
                r="1.5"
                fill={lineColor}
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  from="1.5"
                  to="5"
                  dur="2s"
                  begin="0.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.4"
                  to="0"
                  dur="2s"
                  begin="0.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
