"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  abbreviate?: boolean
  duration?: number
}

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  abbreviate = false,
  duration = 2000,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  const formatNumber = (num: number): string => {
    if (abbreviate) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M"
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K"
      }
    }
    return num.toLocaleString()
  }

  useEffect(() => {
    if (!inView) return

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      setCount(Math.floor(easeOutQuart * value))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(value)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [inView, value, duration])

  return (
    <span ref={ref} className="inline-block">
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  )
}
