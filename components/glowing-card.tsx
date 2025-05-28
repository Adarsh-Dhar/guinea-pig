"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface GlowingCardProps {
  icon: ReactNode
  title: string
  description: string
  glowColor: "fuchsia" | "cyan" | "purple"
}

export default function GlowingCard({ icon, title, description, glowColor }: GlowingCardProps) {
  const glowColorMap = {
    fuchsia: "group-hover:shadow-fuchsia-500/40 from-fuchsia-600 to-fuchsia-400",
    cyan: "group-hover:shadow-cyan-500/40 from-cyan-600 to-cyan-400",
    purple: "group-hover:shadow-purple-500/40 from-purple-600 to-purple-400",
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`group p-6 backdrop-blur-lg bg-white/5 border border-white/10 hover:border-${glowColor}-500/50 rounded-xl transition-all duration-300 hover:shadow-lg ${
        glowColorMap[glowColor]
      }`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-r ${
          glowColorMap[glowColor]
        } opacity-0 group-hover:opacity-10 rounded-xl blur-xl transition-opacity duration-500`}
      />
    </motion.div>
  )
}
