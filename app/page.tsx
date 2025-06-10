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
import Image from "next/image"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1000)
    return () => clearTimeout(timer)
  }, [])

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

  // Animation variants
  const heroContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.25,
      },
    },
  }
  const heroItem = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  return (
    <div className="min-h-screen bg-[#fdf6f1] overflow-hidden flex flex-col relative">
      {/* Loading Overlay */}
      {!showContent && (
        <div className="fixed inset-0 z-[999] bg-[#fdf6f1] transition-opacity duration-700"></div>
      )}

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        className="w-full bg-[#fdf6f1] border-b border-[#e5ded7] sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
          <div className="flex items-center space-x-2">
            <Image
              src="/assets/hamster3.png"
              alt="Guinea Pig Logo"
              width={32}
              height={32}
              className="rounded-full bg-[#e5ded7] p-1 shadow-md"
              priority
            />
            <span className="text-xl font-bold text-[#3d2c1e] font-serif">guinea-pig</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-[#3d2c1e] font-medium">
            <Link href="/projects" className="hover:text-[#a68c7c] transition-colors">Projects</Link>
            <Link href="/create" className="hover:text-[#a68c7c] transition-colors">Create</Link>
            <Link href="/dashboard" className="hover:text-[#a68c7c] transition-colors">Dashboard</Link>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="rounded-xl bg-[#f3ede7] px-4 py-2 text-[#3d2c1e] placeholder-[#a68c7c] focus:outline-none focus:ring-2 focus:ring-[#a68c7c] w-32 md:w-40"
              />
              <span className="absolute right-3 top-2.5 text-[#a68c7c]">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </span>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative flex-1 flex items-center justify-center py-16 md:py-28 px-4 bg-[#fdf6f1]"
        variants={heroContainer}
        initial="hidden"
        animate={showContent ? "show" : "hidden"}
      >
        {/* Left Animal Image */}
        <motion.div
          className="hidden md:block absolute left-0 bottom-0 md:top-1/2 md:-translate-y-1/2 w-64 h-80 bg-[#e5ded7] rounded-3xl overflow-hidden shadow-lg"
          variants={heroItem}
        >
          <Image
            src="/assets/hamster1.png"
            alt="Cute Hamster 1"
            width={256}
            height={320}
            className="object-contain w-full h-full"
            priority
          />
        </motion.div>
        {/* Right Animal Image */}
        <motion.div
          className="hidden md:block absolute right-0 bottom-0 md:top-1/2 md:-translate-y-1/2 w-64 h-80 bg-[#e5ded7] rounded-3xl overflow-hidden shadow-lg"
          variants={heroItem}
        >
          <Image
            src="/assets/hamster2.png"
            alt="Cute Hamster 2"
            width={256}
            height={320}
            className="object-contain w-full h-full"
            priority
          />
        </motion.div>
        {/* Paw prints */}
        <div className="absolute left-1/4 top-1/3 text-[#e5ded7] text-3xl select-none">🐾</div>
        <div className="absolute right-1/4 bottom-1/3 text-[#e5ded7] text-3xl select-none">🐾</div>
        <div className="absolute left-1/3 bottom-1/4 text-[#e5ded7] text-2xl select-none">🐾</div>
        <div className="absolute right-1/3 top-1/4 text-[#e5ded7] text-2xl select-none">🐾</div>
        <motion.div
          className="relative z-10 w-full max-w-2xl mx-auto text-center"
          variants={heroContainer}
        >
          <motion.h1 className="text-5xl md:text-6xl font-extrabold font-serif text-[#3d2c1e] mb-6 leading-tight" variants={heroItem}>
            Fund Science, Own the Future
          </motion.h1>
          <motion.p className="text-lg md:text-xl text-[#a68c7c] mb-8 font-medium" variants={heroItem}>
            Join a global community funding and governing scientific breakthroughs.
          </motion.p>
          <motion.div variants={heroItem}>
            <Button className="bg-[#a68c7c] hover:bg-[#8c715c] text-white text-lg px-8 py-4 rounded-xl shadow-md font-bold transition-all duration-300">
              Book Now
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Gap before DNA Divider */}
      <div className="mt-24" />

      {/* Animated Divider */}
      <div className="relative h-24 w-full overflow-hidden">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#e5ded7] to-transparent animate-pulse" />
        </div>
        <div className="absolute inset-0 flex justify-center items-center">
          <Dna className="h-12 w-12 text-black animate-spin-slow" />
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[#fdf6f1]" ref={ref}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-[#a68c7c] font-serif">How It Works</h2>

          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={item}>
              <GlowingCard
                icon={<Sparkles className="h-12 w-12 text-black" />}
                title="Register IP Assets"
                description="Turn your research into digital assets on Story Protocol with automatic ownership tracking"
                glowColor="beige"
              />
            </motion.div>

            <motion.div variants={item}>
              <GlowingCard
                icon={<Zap className="h-12 w-12 text-black" />}
                title="Token Fundraising"
                description="Sell project tokens to fund research phases and share future success with investors"
                glowColor="black"
              />
            </motion.div>

            <motion.div variants={item}>
              <GlowingCard
                icon={<Atom className="h-12 w-12 text-black" />}
                title="Live Data Streaming"
                description="Stream experiment results in real-time to the blockchain for transparent progress tracking"
                glowColor="white"
              />
            </motion.div>

            <motion.div variants={item}>
              <GlowingCard
                icon={<Dna className="h-12 w-12 text-black" />}
                title="Community Governance"
                description="Token holders vote on project progression and funding allocation decisions"
                glowColor="beige"
              />
            </motion.div>

            <motion.div variants={item}>
              <GlowingCard
                icon={<ArrowRight className="h-12 w-12 text-black" />}
                title="Auto Royalties"
                description="Automatic profit distribution to researchers, investors, and contributors via smart contracts"
                glowColor="black"
              />
            </motion.div>

            <motion.div variants={item}>
              <GlowingCard
                icon={<Beaker className="h-12 w-12 text-black" />}
                title="Cross-Chain Support"
                description="Connect to multiple blockchains for optimal trading and investment opportunities"
                glowColor="white"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-[#f3ede7]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-8 bg-[#fdf6f1] rounded-2xl border border-[#e5ded7] shadow-sm">
              <div className="text-4xl md:text-5xl font-serif font-medium text-[#3d2c1e] mb-2">
                <AnimatedCounter value={2400000} prefix="$" abbreviate />
              </div>
              <div className="text-base md:text-lg font-serif font-medium text-[#3d2c1e] opacity-80">Total Funding Raised</div>
            </div>
            <div className="p-8 bg-[#fdf6f1] rounded-2xl border border-[#e5ded7] shadow-sm">
              <div className="text-4xl md:text-5xl font-serif font-medium text-[#3d2c1e] mb-2">
                <AnimatedCounter value={127} />
              </div>
              <div className="text-base md:text-lg font-serif font-medium text-[#3d2c1e] opacity-80">Active Projects</div>
            </div>
            <div className="p-8 bg-[#fdf6f1] rounded-2xl border border-[#e5ded7] shadow-sm">
              <div className="text-4xl md:text-5xl font-serif font-medium text-[#3d2c1e] mb-2">
                <AnimatedCounter value={3421} />
              </div>
              <div className="text-base md:text-lg font-serif font-medium text-[#3d2c1e] opacity-80">Researchers</div>
            </div>
            <div className="p-8 bg-[#fdf6f1] rounded-2xl border border-[#e5ded7] shadow-sm">
              <div className="text-4xl md:text-5xl font-serif font-medium text-[#3d2c1e] mb-2">
                <AnimatedCounter value={89} suffix="%" />
              </div>
              <div className="text-base md:text-lg font-serif font-medium text-[#3d2c1e] opacity-80">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5ded7] bg-[#fdf6f1] py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Beaker className="h-6 w-6 text-[#a68c7c]" />
            <span className="text-xl font-bold text-[#a68c7c] font-serif">guinea pig</span>
          </div>
          <p className="text-[#a68c7c]">
            Empowering global research through decentralized funding and transparent ownership.
          </p>
        </div>
      </footer>
    </div>
  )
}
