"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Beaker, Sparkles, Zap, Atom, Dna } from "lucide-react"
import { Button } from "@/components/ui/button"
import ParticleBackground from "@/components/particle-background"
import GlowingCard from "@/components/glowing-card"
import AnimatedCounter from "@/components/animated-counter"
import ConnectWalletButton from "@/components/connect-wallet-button"
import { useInView } from "react-intersection-observer"

export default function HomePage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-purple-950 overflow-hidden">
      <ParticleBackground />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Beaker className="h-8 w-8 text-fuchsia-400" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                PUMP.SCIENCE
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/projects" className="text-white/80 hover:text-fuchsia-400 transition-colors">
                Projects
              </Link>
              <Link href="/create" className="text-white/80 hover:text-fuchsia-400 transition-colors">
                Create Project
              </Link>
              <Link href="/dashboard" className="text-white/80 hover:text-fuchsia-400 transition-colors">
                Dashboard
              </Link>
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400">
                Decentralized Science
              </span>
              <span className="block text-white">Funding Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              Turn your research into IP Assets, raise funds through tokens, and share profits automatically with Story
              Protocol
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/projects">
              <Button
                size="lg"
                className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-lg px-8 py-6 rounded-xl shadow-lg shadow-fuchsia-700/20 transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-700/30"
              >
                Explore Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/create">
              <Button
                size="lg"
                variant="outline"
                className="border-fuchsia-400 text-fuchsia-400 hover:bg-fuchsia-400/10 text-lg px-8 py-6 rounded-xl transition-all duration-300"
              >
                Start Your Research
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Animated Divider */}
      <div className="relative h-24 w-full overflow-hidden">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent animate-pulse" />
        </div>
        <div className="absolute inset-0 flex justify-center items-center">
          <Dna className="h-12 w-12 text-fuchsia-400 animate-spin-slow" />
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4" ref={ref}>
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400"
          >
            How It Works
          </motion.h2>

          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={item}>
              <GlowingCard
                icon={<Sparkles className="h-12 w-12 text-fuchsia-400" />}
                title="Register IP Assets"
                description="Turn your research into digital assets on Story Protocol with automatic ownership tracking"
                glowColor="fuchsia"
              />
            </motion.div>

            <motion.div variants={item}>
              <GlowingCard
                icon={<Zap className="h-12 w-12 text-cyan-400" />}
                title="Token Fundraising"
                description="Sell project tokens to fund research phases and share future success with investors"
                glowColor="cyan"
              />
            </motion.div>

            <motion.div variants={item}>
              <GlowingCard
                icon={<Atom className="h-12 w-12 text-purple-400" />}
                title="Live Data Streaming"
                description="Stream experiment results in real-time to the blockchain for transparent progress tracking"
                glowColor="purple"
              />
            </motion.div>

            <motion.div variants={item}>
              <GlowingCard
                icon={<Dna className="h-12 w-12 text-fuchsia-400" />}
                title="Community Governance"
                description="Token holders vote on project progression and funding allocation decisions"
                glowColor="fuchsia"
              />
            </motion.div>

            <motion.div variants={item}>
              <GlowingCard
                icon={<ArrowRight className="h-12 w-12 text-cyan-400" />}
                title="Auto Royalties"
                description="Automatic profit distribution to researchers, investors, and contributors via smart contracts"
                glowColor="cyan"
              />
            </motion.div>

            <motion.div variants={item}>
              <GlowingCard
                icon={<Beaker className="h-12 w-12 text-purple-400" />}
                title="Cross-Chain Support"
                description="Connect to multiple blockchains for optimal trading and investment opportunities"
                glowColor="purple"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-black/40 via-fuchsia-900/20 to-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6 backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 hover:border-fuchsia-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/20">
              <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={2400000} prefix="$" abbreviate />
              </div>
              <div className="text-fuchsia-300">Total Funding Raised</div>
            </div>
            <div className="p-6 backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={127} />
              </div>
              <div className="text-cyan-300">Active Projects</div>
            </div>
            <div className="p-6 backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={3421} />
              </div>
              <div className="text-purple-300">Researchers</div>
            </div>
            <div className="p-6 backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 hover:border-fuchsia-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/20">
              <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={89} suffix="%" />
              </div>
              <div className="text-fuchsia-300">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Beaker className="h-6 w-6 text-fuchsia-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
              PUMP.SCIENCE
            </span>
          </div>
          <p className="text-white/60">Powered by Story Protocol • Decentralized Science Funding</p>
        </div>
      </footer>
    </div>
  )
}
