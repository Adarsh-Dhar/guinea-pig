"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Users, Clock, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import ParticleBackground from "@/components/particle-background"
import ConnectWalletButton from "@/components/connect-wallet-button"

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      try {
        const res = await fetch("/api/experiments")
        if (!res.ok) throw new Error("Failed to fetch projects")
        const data = await res.json()
        // console.log("data", data)
        setProjects(data.projects || [])
      } catch (e) {
        setProjects([])
      }
      setLoading(false)
    }
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((project) => {
    const category = (project.category || "Other").toLowerCase();
    const selected = selectedCategory.toLowerCase();
    const title = project.title || project.name || "Untitled Project";
    const matchesCategory = selected === "all" || category === selected;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
    <div className="min-h-screen bg-[#fdf6f1] overflow-hidden">
      <ParticleBackground />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="border-b border-[#e5ded7] bg-[#fdf6f1]/80 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/assets/hamster3.png"
                alt="Guinea Pig Logo"
                width={32}
                height={32}
                className="rounded-full bg-[#e5ded7] p-1 shadow-md"
                priority
              />
              <span className="text-xl font-bold text-[#3d2c1e] font-serif">guinea pig</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/create">
                <Button className="bg-[#a68c7c] hover:bg-[#8c715c] text-white shadow-lg">Create Project</Button>
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
          <h1 className="text-4xl font-bold mb-4 text-[#a68c7c]">Research Projects</h1>
          <p className="text-[#3d2c1e]/80 text-lg">Discover and invest in cutting-edge scientific research</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a68c7c] h-5 w-5" />
            <Input
              placeholder="Search projects..."
              className="pl-10 bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] rounded-xl focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="text-[#a68c7c] h-5 w-5 flex-shrink-0" />
            <Badge
              variant={selectedCategory === "All" ? "default" : "outline"}
              className={
                selectedCategory === "All"
                  ? "bg-[#a68c7c] text-white cursor-pointer"
                  : "border-[#e5ded7] text-[#3d2c1e]/80 hover:border-[#a68c7c] cursor-pointer"
              }
              onClick={() => setSelectedCategory("All")}
            >
              All
            </Badge>
            <Badge
              variant={selectedCategory === "Longevity" ? "default" : "outline"}
              className={
                selectedCategory === "Longevity"
                  ? "bg-[#e5ded7] text-[#3d2c1e] cursor-pointer"
                  : "border-[#e5ded7] text-[#3d2c1e]/80 hover:border-[#a68c7c] cursor-pointer"
              }
              onClick={() => setSelectedCategory("Longevity")}
            >
              Longevity
            </Badge>
            <Badge
              variant={selectedCategory === "Oncology" ? "default" : "outline"}
              className={
                selectedCategory === "Oncology"
                  ? "bg-[#f3ede7] text-[#3d2c1e] cursor-pointer"
                  : "border-[#e5ded7] text-[#3d2c1e]/80 hover:border-[#a68c7c] cursor-pointer"
              }
              onClick={() => setSelectedCategory("Oncology")}
            >
              Oncology
            </Badge>
            <Badge
              variant={selectedCategory === "Neuroscience" ? "default" : "outline"}
              className={
                selectedCategory === "Neuroscience"
                  ? "bg-[#fdf6f1] text-[#3d2c1e] cursor-pointer"
                  : "border-[#e5ded7] text-[#3d2c1e]/80 hover:border-[#a68c7c] cursor-pointer"
              }
              onClick={() => setSelectedCategory("Neuroscience")}
            >
              Neuroscience
            </Badge>
            <Badge
              variant={selectedCategory === "Microbiome" ? "default" : "outline"}
              className={
                selectedCategory === "Microbiome"
                  ? "bg-[#a68c7c] text-white cursor-pointer"
                  : "border-[#e5ded7] text-[#3d2c1e]/80 hover:border-[#a68c7c] cursor-pointer"
              }
              onClick={() => setSelectedCategory("Microbiome")}
            >
              Microbiome
            </Badge>
            <Badge
              variant={selectedCategory === "Other" ? "default" : "outline"}
              className={
                selectedCategory === "Other"
                  ? "bg-[#d1bfa3] text-[#3d2c1e] cursor-pointer"
                  : "border-[#e5ded7] text-[#3d2c1e]/80 hover:border-[#a68c7c] cursor-pointer"
              }
              onClick={() => setSelectedCategory("Other")}
            >
              Other
            </Badge>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center text-[#3d2c1e]/70 py-12">Loading projects from IPFS...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-2 text-center text-[#3d2c1e]/70 py-12">No projects found.</div>
          ) : (
            filteredProjects.map((project, idx) => {
              const category = project.category || "Other"
              const color = "[#a68c7c]"
              const status = "Active"
              const title = project.title || `Project #${idx+1}`
              const description = project.description || "No description."
              const token = project.tokenSymbol || "$TOKEN"
              const raised = Number(project.currentFunding) || 0
              const target = Number(project.totalFunding) || 1000000
              const investors = 0
              const phase = "Phase 1"
              const roi = "+0%"
              const id = project.id || idx
              return (
                <motion.div key={id} variants={item} whileHover={{ y: -5 }} className="h-full">
                  <Link href={`/projects/${id}`} className="block h-full">
                    <Card
                      className={`h-full bg-[#f3ede7] border border-[#e5ded7] hover:border-[#a68c7c] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#a68c7c]/20`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-[#a68c7c] text-white px-3 py-1 rounded-full text-xs font-medium">
                          {category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            status === "Active"
                              ? "border-[#d1bfa3] text-[#d1bfa3] px-3 py-1 rounded-full text-xs font-medium"
                              : "border-cyan-400 text-cyan-400 px-3 py-1 rounded-full text-xs font-medium"
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                      <h3 className="text-[#3d2c1e] text-xl font-bold mb-2">{title}</h3>
                      <p className="text-[#3d2c1e]/70 mb-4 line-clamp-2">{description}</p>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[#a68c7c] font-mono font-bold">{token}</span>
                        <span className="text-[#d1bfa3] font-bold">{roi}</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#3d2c1e]/70">Funding Progress</span>
                          <span className="text-[#3d2c1e]">
                            ${raised.toLocaleString()} / ${target.toLocaleString()}
                          </span>
                        </div>
                        <div className="relative h-2 w-full bg-[#e5ded7] rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-[#a68c7c] rounded-full"
                            style={{ width: `${target > 0 ? (raised / target) * 100 : 0}%` }}
                          >
                            <div
                              className="absolute top-0 left-0 h-full w-full bg-[#a68c7c] animate-pulse opacity-60"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-[#a68c7c] hover:bg-[#8c715c] text-white shadow-lg transition-all duration-300"
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
