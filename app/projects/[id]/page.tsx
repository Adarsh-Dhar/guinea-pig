"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Vote, Activity, ChevronUp, ChevronDown, Sparkles, Dna } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ParticleBackground from "@/components/particle-background"
import { LineChart } from "@/components/line-chart"
import ConnectWalletButton from "@/components/connect-wallet-button"

export default function ProjectDetailPage() {
  const [expanded, setExpanded] = useState(false)
  const [voteAnimation, setVoteAnimation] = useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  const triggerVoteAnimation = () => {
    setVoteAnimation(true)
    setTimeout(() => setVoteAnimation(false), 1000)
  }

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Token Price",
        data: [0.75, 0.9, 1.2, 1.5, 1.7, 1.89],
        borderColor: "rgb(217, 70, 239)",
        backgroundColor: "rgba(217, 70, 239, 0.2)",
        tension: 0.4,
      },
    ],
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
            <Link href="/projects" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-fuchsia-400" />
              <span className="text-xl font-bold text-white">Back to Projects</span>
            </Link>
            <ConnectWalletButton />
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Badge className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 text-white px-3 py-1 rounded-full">
              Longevity
            </Badge>
            <Badge className="border-green-400 text-green-400 px-3 py-1 rounded-full" variant="outline">
              Active
            </Badge>
            <motion.span
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="text-fuchsia-400 font-mono font-bold bg-fuchsia-400/10 px-3 py-1 rounded-full"
            >
              $LONGEVITY
            </motion.span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400">
            Longevity Research: Anti-Aging Compounds
          </h1>
          <p className="text-white/80 text-lg max-w-3xl">
            Testing novel compounds for extending lifespan in model organisms. Our research focuses on identifying and
            validating compounds that can significantly extend healthy lifespan across multiple species.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white rounded-lg"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="data"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg"
                >
                  Live Data
                </TabsTrigger>
                <TabsTrigger
                  value="governance"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
                >
                  Governance
                </TabsTrigger>
                <TabsTrigger
                  value="tokenomics"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white rounded-lg"
                >
                  Tokenomics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <h3 className="text-white text-xl font-bold mb-4">Research Phases</h3>
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-400/30 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-400/20 flex items-center justify-center mr-3">
                          <Sparkles className="h-5 w-5 text-green-400" />
                        </div>
                        <span className="text-green-400 font-medium">Phase 1: C. elegans (Worms)</span>
                      </div>
                      <Badge className="bg-green-500 text-white">Completed</Badge>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-400/30 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-400/20 flex items-center justify-center mr-3">
                          <Dna className="h-5 w-5 text-blue-400 animate-spin-slow" />
                        </div>
                        <span className="text-blue-400 font-medium">Phase 2: Drosophila (Fruit Flies)</span>
                      </div>
                      <Badge className="bg-blue-500 text-white">In Progress</Badge>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-gradient-to-r from-gray-900/20 to-gray-800/10 border border-gray-400/30 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-400/20 flex items-center justify-center mr-3">
                          <Activity className="h-5 w-5 text-gray-400" />
                        </div>
                        <span className="text-gray-400 font-medium">Phase 3: Mus musculus (Mice)</span>
                      </div>
                      <Badge variant="outline" className="border-gray-400 text-gray-400">
                        Pending
                      </Badge>
                    </motion.div>
                  </div>
                </Card>

                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <h3 className="text-white text-xl font-bold mb-4">IP Asset Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">IP Asset ID:</span>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="text-white font-mono bg-fuchsia-500/10 px-3 py-1 rounded-full"
                      >
                        0x1a2b3c4d...
                      </motion.span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Story Protocol License:</span>
                      <Badge className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white">
                        Commercial Use
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Royalty Rate:</span>
                      <span className="text-white font-bold">15%</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Activity className="h-6 w-6 text-cyan-400 mr-2" />
                    <h3 className="text-white text-xl font-bold">Live Experiment Data</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-400/30 rounded-xl"
                    >
                      <div className="text-3xl font-bold text-blue-400 mb-1">127</div>
                      <div className="text-white/70">Active Flies</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-400/30 rounded-xl"
                    >
                      <div className="text-3xl font-bold text-green-400 mb-1">+34%</div>
                      <div className="text-white/70">Lifespan Increase</div>
                    </motion.div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white font-medium">Experiment Progress</h4>
                      <span className="text-cyan-400 text-sm">Updated 2h ago</span>
                    </div>
                    <div className="h-[200px] w-full bg-white/5 rounded-xl p-4">
                      <LineChart data={chartData} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-white/70">Latest Update:</div>
                    <div className="p-3 bg-cyan-900/20 border border-cyan-400/30 rounded-lg text-white">
                      Compound XYZ-123 showing promising results in cohort B with a 34% increase in average lifespan
                      compared to control group.
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="governance" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Vote className="h-6 w-6 text-purple-400 mr-2" />
                    <h3 className="text-white text-xl font-bold">Active Proposals</h3>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 border border-purple-400/30 bg-gradient-to-r from-purple-900/20 to-purple-800/10 rounded-xl"
                  >
                    <h4 className="text-white font-semibold mb-2">Proposal #3: Proceed to Mouse Trials</h4>
                    <p className="text-white/70 text-sm mb-4">
                      Based on positive results in fruit flies, should we allocate funds for Phase 3 mouse trials?
                    </p>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-400">Yes: 67%</span>
                          <span className="text-green-400">1,340 votes</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "67%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-red-400">No: 33%</span>
                          <span className="text-red-400">660 votes</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "33%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Ends in 2 days</span>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white ${
                            voteAnimation ? "animate-pulse" : ""
                          }`}
                          onClick={triggerVoteAnimation}
                        >
                          Vote Yes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-400 text-red-400 hover:bg-red-400/10"
                          onClick={triggerVoteAnimation}
                        >
                          Vote No
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </Card>
              </TabsContent>

              <TabsContent value="tokenomics" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <h3 className="text-white text-xl font-bold mb-4">Token Distribution</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-fuchsia-900/20 to-fuchsia-800/10 border border-fuchsia-400/30 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Research Funding</span>
                        <span className="text-fuchsia-400 font-bold">75%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "75%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 rounded-full"
                        />
                      </div>
                      <div className="text-right text-white/70 text-sm mt-1">750,000 tokens</div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-cyan-800/10 border border-cyan-400/30 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Team</span>
                        <span className="text-cyan-400 font-bold">15%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "15%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                        />
                      </div>
                      <div className="text-right text-white/70 text-sm mt-1">150,000 tokens</div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-400/30 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Community</span>
                        <span className="text-purple-400 font-bold">10%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "10%" }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                        />
                      </div>
                      <div className="text-right text-white/70 text-sm mt-1">100,000 tokens</div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Investment Card */}
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">Investment Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Funding Progress</span>
                    <span className="text-white">$450K / $750K</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 rounded-full relative">
                      <div className="absolute top-0 left-0 h-full w-full bg-white/30 animate-pulse-fast" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-white/5 rounded-lg text-center">
                    <div className="text-white/70 mb-1">Token Price</div>
                    <div className="text-white text-lg font-bold">$1.89</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-white/5 rounded-lg text-center">
                    <div className="text-white/70 mb-1">24h Change</div>
                    <div className="text-green-400 text-lg font-bold">+12.4%</div>
                  </motion.div>
                </div>

                <div className="p-4 bg-gradient-to-r from-fuchsia-900/20 to-fuchsia-800/10 border border-fuchsia-400/30 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">Your Investment</span>
                    <span className="text-fuchsia-400 font-mono">0 $LONGEVITY</span>
                  </div>
                  <div className="text-white/70 text-sm">Connect your wallet to invest</div>
                </div>

                <Button className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-700/20 transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-700/30">
                  Buy $LONGEVITY Tokens
                </Button>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-xl font-bold">Project Stats</h3>
                <button onClick={toggleExpand} className="text-white/70 hover:text-white">
                  {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Total Investors</span>
                  <span className="text-white font-bold">234</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Market Cap</span>
                  <span className="text-white font-bold">$1.89M</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">ROI</span>
                  <span className="text-green-400 font-bold">+127%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Risk Level</span>
                  <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-white">Medium</Badge>
                </div>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/70">Token Holders</span>
                        <span className="text-white font-bold">412</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/70">Governance Votes</span>
                        <span className="text-white font-bold">2,000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/70">Research Citations</span>
                        <span className="text-white font-bold">7</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
