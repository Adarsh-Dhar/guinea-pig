"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface GlowingCardProps {
  icon: ReactNode
  title: string
  description: string
  glowColor: "beige" | "black" | "white"
}

export default function GlowingCard({ icon, title, description, glowColor }: GlowingCardProps) {
  const glowColorMap = {
    beige: "group-hover:shadow-[rgba(231,203,169,0.4)] from-[#e7cba9] to-white",
    black: "group-hover:shadow-black/40 from-black to-[#e7cba9]",
    white: "group-hover:shadow-white/40 from-white to-[#e7cba9]",
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`group p-6 backdrop-blur-lg bg-[#e7cba9]/10 border border-[#e7cba9]/30 hover:border-black/50 rounded-xl transition-all duration-300 hover:shadow-lg ${
        glowColorMap[glowColor]
      }`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-black text-xl font-bold mb-2">{title}</h3>
      <p className="text-black/70">{description}</p>
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-r ${
          glowColorMap[glowColor]
        } opacity-0 group-hover:opacity-10 rounded-xl blur-xl transition-opacity duration-500`}
      />
    </motion.div>
  )
}
