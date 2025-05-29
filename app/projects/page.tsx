"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Users, Clock, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import ParticleBackground from "@/components/particle-background"
import ConnectWalletButton from "@/components/connect-wallet-button"
import { getAllFilesFromPinata } from "@/lib/uploadToIpfs"

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      try {
        const files = await getAllFilesFromPinata()
        setProjects(files)
      } catch (e) {
        setProjects([])
      }
      setLoading(false)
    }
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((project) => {
    const category = project.metadata?.keyvalues?.category || "Other"
    const title = project.metadata?.name || project.name || "Untitled Project"
    const matchesCategory = selectedCategory === "All" || category === selectedCategory
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())
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
          {loading ? (
            <div className="col-span-2 text-center text-white/70 py-12">Loading projects from IPFS...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-2 text-center text-white/70 py-12">No projects found.</div>
          ) : (
            filteredProjects.map((project, idx) => {
              const category = project.metadata?.keyvalues?.category || "Other"
              const color = project.metadata?.keyvalues?.color || "fuchsia"
              const status = project.metadata?.keyvalues?.status || "Active"
              const title = project.metadata?.name || project.name || `Project #${idx+1}`
              const description = project.metadata?.keyvalues?.description || project.description || "No description."
              const token = project.metadata?.keyvalues?.token || "$TOKEN"
              const raised = Number(project.metadata?.keyvalues?.raised) || 0
              const target = Number(project.metadata?.keyvalues?.target) || 1000000
              const investors = Number(project.metadata?.keyvalues?.investors) || 0
              const phase = project.metadata?.keyvalues?.phase || "Phase 1"
              const roi = project.metadata?.keyvalues?.roi || "+0%"
              const id = project.id || project.ipfs_pin_hash || idx
              return (
                <motion.div key={id} variants={item} whileHover={{ y: -5 }} className="h-full">
                  <Link href={`/projects/${id}`} className="block h-full">
                    <Card
                      className={`h-full bg-white/5 backdrop-blur-lg border border-white/10 hover:border-${color}-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/20`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={`bg-${color}-600 text-white px-3 py-1 rounded-full text-xs font-medium`}>
                          {category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            status === "Active"
                              ? "border-green-400 text-green-400 px-3 py-1 rounded-full text-xs font-medium"
                              : "border-cyan-400 text-cyan-400 px-3 py-1 rounded-full text-xs font-medium"
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                      <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
                      <p className="text-white/70 mb-4 line-clamp-2">{description}</p>

                      <div className="flex justify-between items-center mb-4">
                        <span className={`text-${color}-400 font-mono font-bold`}>{token}</span>
                        <span className="text-green-400 font-bold">{roi}</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Funding Progress</span>
                          <span className="text-white">
                            ${raised.toLocaleString()} / ${target.toLocaleString()}
                          </span>
                        </div>
                        <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`absolute top-0 left-0 h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full`}
                            style={{ width: `${(raised / target) * 100}%` }}
                          >
                            <div
                              className={`absolute top-0 left-0 h-full w-full bg-${color}-400 animate-pulse opacity-60`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <Users className={`h-4 w-4 text-${color}-400`} />
                          <span className="text-white/70">{investors} investors</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className={`h-4 w-4 text-${color}-400`} />
                          <span className="text-white/70">{phase}</span>
                        </div>
                      </div>

                      <Button
                        className={`w-full bg-gradient-to-r from-${color}-600 to-${color}-500 hover:from-${color}-500 hover:to-${color}-400 text-white shadow-lg shadow-${color}-700/20 transition-all duration-300`}
                      >
                        View Project
                      </Button>
                    </Card>
                  </Link>
                </motion.div>
              )
            })
          )}
        </motion.div>
      </div>
    </div>
  )
}
