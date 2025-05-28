"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, TrendingUp, DollarSign, Activity, Vote, Bell, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ParticleBackground from "@/components/particle-background"
import ConnectWalletButton from "@/components/connect-wallet-button"
import { useAccount, useBalance } from "wagmi"

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })

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
              <Button variant="outline" className="border-white/20 text-white/80 hover:bg-white/5">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
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
            Dashboard
          </h1>
          <p className="text-white/80 text-lg">Manage your research projects and investments</p>
        </motion.div>

        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-8"
          >
            <Card className="bg-white/5 backdrop-blur-lg border border-fuchsia-500/50 rounded-xl p-8">
              <div className="text-center">
                <Wallet className="h-16 w-16 text-fuchsia-400 mx-auto mb-4" />
                <h3 className="text-white text-2xl font-bold mb-4">Connect Your Wallet</h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  Connect your wallet to view your portfolio, manage investments, and participate in governance
                </p>
                <ConnectWalletButton />
              </div>
            </Card>
          </motion.div>
        )}

        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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
                  value="projects"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg"
                >
                  My Projects
                </TabsTrigger>
                <TabsTrigger
                  value="investments"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
                >
                  Investments
                </TabsTrigger>
                <TabsTrigger
                  value="governance"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white rounded-lg"
                >
                  Governance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Wallet Info */}
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-xl font-bold">Wallet Information</h3>
                    <Badge className="bg-gradient-to-r from-green-600 to-green-400 text-white">Connected</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="text-white/70 text-sm mb-1">Wallet Address</div>
                      <div className="text-white font-mono text-sm">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="text-white/70 text-sm mb-1">ETH Balance</div>
                      <div className="text-white font-bold">
                        {balance
                          ? `${Number.parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                          : "0.0000 ETH"}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/70 text-sm">Total Portfolio Value</p>
                            <p className="text-2xl font-bold text-white">$12,450</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-fuchsia-400" />
                        </div>
                        <p className="text-green-400 text-sm mt-2">+23.5% this month</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/70 text-sm">Active Projects</p>
                            <p className="text-2xl font-bold text-white">3</p>
                          </div>
                          <Activity className="h-8 w-8 text-cyan-400" />
                        </div>
                        <p className="text-cyan-400 text-sm mt-2">2 funding, 1 research</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/70 text-sm">Total Investments</p>
                            <p className="text-2xl font-bold text-white">7</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-purple-400" />
                        </div>
                        <p className="text-green-400 text-sm mt-2">+15.2% avg ROI</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/70 text-sm">Pending Votes</p>
                            <p className="text-2xl font-bold text-white">4</p>
                          </div>
                          <Vote className="h-8 w-8 text-fuchsia-400" />
                        </div>
                        <p className="text-yellow-400 text-sm mt-2">Action required</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-400/30 rounded-xl"
                    >
                      <div>
                        <p className="text-white font-medium">New milestone reached: Longevity Research</p>
                        <p className="text-blue-200 text-sm">Phase 2 completed successfully</p>
                      </div>
                      <span className="text-blue-400 text-sm">2h ago</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-400/30 rounded-xl"
                    >
                      <div>
                        <p className="text-white font-medium">Dividend received: $NEURAL tokens</p>
                        <p className="text-green-200 text-sm">+$234.50 from royalty distribution</p>
                      </div>
                      <span className="text-green-400 text-sm">1d ago</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border border-yellow-400/30 rounded-xl"
                    >
                      <div>
                        <p className="text-white font-medium">Governance proposal: Cancer Research</p>
                        <p className="text-yellow-200 text-sm">Vote on Phase 3 funding allocation</p>
                      </div>
                      <span className="text-yellow-400 text-sm">2d ago</span>
                    </motion.div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">My Research Projects</h2>
                  <Link href="/create">
                    <Button className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white">
                      Create New Project
                    </Button>
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Badge className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 text-white">
                            Longevity
                          </Badge>
                          <Badge className="border-green-400 text-green-400" variant="outline">
                            Active
                          </Badge>
                        </div>
                        <CardTitle className="text-white">Anti-Aging Compounds</CardTitle>
                        <CardDescription className="text-white/70">
                          Testing novel compounds for extending lifespan
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">Funding Progress</span>
                            <span className="text-white">$450K / $750K</span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-white/70">Investors</span>
                            <div className="text-white font-bold">234</div>
                          </div>
                          <div>
                            <span className="text-white/70">Token Price</span>
                            <div className="text-white font-bold">$1.89</div>
                          </div>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white">
                          Manage Project
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="investments" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Investment Portfolio</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <span className="text-fuchsia-400 font-mono font-bold">$LONGEVITY</span>
                          <span className="text-green-400 font-bold">+127%</span>
                        </div>
                        <CardTitle className="text-white text-lg">Anti-Aging Research</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/70">Holdings</span>
                          <span className="text-white">1,250 tokens</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Value</span>
                          <span className="text-white">$2,362.50</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Profit/Loss</span>
                          <span className="text-green-400">+$1,325.00</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-400 font-mono font-bold">$NEURAL</span>
                          <span className="text-green-400 font-bold">+203%</span>
                        </div>
                        <CardTitle className="text-white text-lg">Neural Interface Tech</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/70">Holdings</span>
                          <span className="text-white">500 tokens</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Value</span>
                          <span className="text-white">$3,015.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Profit/Loss</span>
                          <span className="text-green-400">+$2,020.00</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="governance" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Governance & Voting</h2>

                <div className="space-y-4">
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white">Proposal #3: Proceed to Mouse Trials</CardTitle>
                            <CardDescription className="text-white/70">Longevity Research Project</CardDescription>
                          </div>
                          <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-white">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-white/70">
                          Based on positive results in fruit flies showing 34% lifespan increase, should we allocate
                          $200K for Phase 3 mouse trials?
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-400">Yes: 67% (1,340 votes)</span>
                            <span className="text-red-400">No: 33% (660 votes)</span>
                          </div>
                          <Progress value={67} className="h-2" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">Ends in 2 days</span>
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
                            >
                              Vote Yes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-400 text-red-400 hover:bg-red-400/10"
                            >
                              Vote No
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  )
}
