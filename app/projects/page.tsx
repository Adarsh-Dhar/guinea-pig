"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Users, Clock, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import ParticleBackground from "@/components/particle-background"
import ConnectWalletButton from "@/components/connect-wallet-button"

const projects = [
  {
    id: 1,
    title: "Longevity Research: Anti-Aging Compounds",
    description: "Testing novel compounds for extending lifespan in model organisms",
    token: "$LONGEVITY",
    raised: 450000,
    target: 750000,
    investors: 234,
    phase: "Phase 2: Fruit Flies",
    status: "Active",
    roi: "+127%",
    category: "Longevity",
    color: "fuchsia",
  },
  {
    id: 2,
    title: "Cancer Immunotherapy Enhancement",
    description: "Developing enhanced CAR-T cell therapies for solid tumors",
    token: "$IMMUNO",
    raised: 890000,
    target: 1200000,
    investors: 456,
    phase: "Phase 1: Cell Culture",
    status: "Active",
    roi: "+89%",
    category: "Oncology",
    color: "cyan",
  },
  {
    id: 3,
    title: "Neural Interface Technology",
    description: "Brain-computer interfaces for treating paralysis",
    token: "$NEURAL",
    raised: 1200000,
    target: 1200000,
    investors: 678,
    phase: "Phase 3: Human Trials",
    status: "Funded",
    roi: "+203%",
    category: "Neuroscience",
    color: "purple",
  },
  {
    id: 4,
    title: "Microbiome Therapeutics",
    description: "Engineered probiotics for metabolic disorders",
    token: "$MICROB",
    raised: 320000,
    target: 600000,
    investors: 189,
    phase: "Phase 1: Preclinical",
    status: "Active",
    roi: "+45%",
    category: "Microbiome",
    color: "fuchsia",
  },
]

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
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
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-fuchsia-400" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                PUMP.SCIENCE
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/create">
                <Button className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-700/20">
                  Create Project
                </Button>
              </Link>
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            Research Projects
          </h1>
          <p className="text-white/80 text-lg">Discover and invest in cutting-edge scientific research</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <Input
              placeholder="Search projects..."
              className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="text-white/50 h-5 w-5 flex-shrink-0" />
            <Badge
              variant={selectedCategory === "All" ? "default" : "outline"}
              className={
                selectedCategory === "All"
                  ? "bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white cursor-pointer"
                  : "border-white/20 text-white/80 hover:border-fuchsia-400 cursor-pointer"
              }
              onClick={() => setSelectedCategory("All")}
            >
              All
            </Badge>
            <Badge
              variant={selectedCategory === "Longevity" ? "default" : "outline"}
              className={
                selectedCategory === "Longevity"
                  ? "bg-fuchsia-600 text-white cursor-pointer"
                  : "border-white/20 text-white/80 hover:border-fuchsia-400 cursor-pointer"
              }
              onClick={() => setSelectedCategory("Longevity")}
            >
              Longevity
            </Badge>
            <Badge
              variant={selectedCategory === "Oncology" ? "default" : "outline"}
              className={
                selectedCategory === "Oncology"
                  ? "bg-cyan-600 text-white cursor-pointer"
                  : "border-white/20 text-white/80 hover:border-cyan-400 cursor-pointer"
              }
              onClick={() => setSelectedCategory("Oncology")}
            >
              Oncology
            </Badge>
            <Badge
              variant={selectedCategory === "Neuroscience" ? "default" : "outline"}
              className={
                selectedCategory === "Neuroscience"
                  ? "bg-purple-600 text-white cursor-pointer"
                  : "border-white/20 text-white/80 hover:border-purple-400 cursor-pointer"
              }
              onClick={() => setSelectedCategory("Neuroscience")}
            >
              Neuroscience
            </Badge>
            <Badge
              variant={selectedCategory === "Microbiome" ? "default" : "outline"}
              className={
                selectedCategory === "Microbiome"
                  ? "bg-fuchsia-600 text-white cursor-pointer"
                  : "border-white/20 text-white/80 hover:border-fuchsia-400 cursor-pointer"
              }
              onClick={() => setSelectedCategory("Microbiome")}
            >
              Microbiome
            </Badge>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <motion.div key={project.id} variants={item} whileHover={{ y: -5 }} className="h-full">
              <Link href={`/projects/${project.id}`} className="block h-full">
                <Card
                  className={`h-full bg-white/5 backdrop-blur-lg border border-white/10 hover:border-${project.color}-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-${project.color}-500/20`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <Badge className={`bg-${project.color}-600 text-white px-3 py-1 rounded-full text-xs font-medium`}>
                      {project.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        project.status === "Active"
                          ? "border-green-400 text-green-400 px-3 py-1 rounded-full text-xs font-medium"
                          : "border-cyan-400 text-cyan-400 px-3 py-1 rounded-full text-xs font-medium"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-white/70 mb-4 line-clamp-2">{project.description}</p>

                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-${project.color}-400 font-mono font-bold`}>{project.token}</span>
                    <span className="text-green-400 font-bold">{project.roi}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Funding Progress</span>
                      <span className="text-white">
                        ${project.raised.toLocaleString()} / ${project.target.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r from-${
                          project.color
                        }-500 to-${project.color}-400 rounded-full`}
                        style={{ width: `${(project.raised / project.target) * 100}%` }}
                      >
                        <div
                          className={`absolute top-0 left-0 h-full w-full bg-${project.color}-400 animate-pulse opacity-60`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className={`h-4 w-4 text-${project.color}-400`} />
                      <span className="text-white/70">{project.investors} investors</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className={`h-4 w-4 text-${project.color}-400`} />
                      <span className="text-white/70">{project.phase}</span>
                    </div>
                  </div>

                  <Button
                    className={`w-full bg-gradient-to-r from-${project.color}-600 to-${project.color}-500 hover:from-${project.color}-500 hover:to-${project.color}-400 text-white shadow-lg shadow-${project.color}-700/20 transition-all duration-300`}
                  >
                    View Project
                  </Button>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
