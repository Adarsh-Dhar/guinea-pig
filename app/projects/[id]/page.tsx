"use client"

import { useState, useEffect } from "react"
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
import { useParams } from "next/navigation"
import { client, publicClient, walletClient } from "@/lib/config"
import { parseEther } from "viem"
import { useAccount } from "wagmi"
import { erc20Abi } from "viem"
import { aeneid } from "@story-protocol/core-sdk";
import { storyAeneid } from "viem/chains"

// Helper for BigInt exponentiation (works in all JS targets)
function bigIntPow(base: bigint, exp: number): bigint {
  let result = BigInt(1);
  for (let i = 0; i < exp; i++) result *= base;
  return result;
}

// Minimal ERC721 ABI for safeTransferFrom
const erc721Abi = [
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [voteAnimation, setVoteAnimation] = useState(false);
  const { address: userWalletAddress, isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/experiments/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch project data");
        return res.json();
      })
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#0f172a] to-purple-950">
        <span className="text-white text-xl animate-pulse">Loading project...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#0f172a] to-purple-950">
        <span className="text-red-400 text-xl">{error}</span>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const p = project.project || {};

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

  const handleBuy = async () => {
    const recipientAddress = "0xf76daC24BaEf645ee0b3dfAc1997c6b838eF280D";
    if (!userWalletAddress) {
      console.log("Please connect your wallet first.");
      return;
    }
    try {
      // 1. Send ETH proportional to quantity
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: userWalletAddress,
              to: recipientAddress,
              value: parseEther(quantity.toString()).toString(16), // hex string, quantity * 1 ETH
            },
          ],
        });
        console.log(`${quantity} ETH sent to recipient (IP tx sent via wallet). Check your wallet for the transaction hash.`);
      } else {
        console.error("No Ethereum provider found.");
        return;
      }
      // 2. Transfer royalty tokens (RT/IP) proportional to quantity using SDK
      if (project?.project?.ipId && project?.project?.royaltyToken?.address) {
        const royaltyTokenAddress = project.project.royaltyToken.address;
        // Get decimals
        const decimals = await publicClient.readContract({
          address: royaltyTokenAddress,
          abi: erc20Abi,
          functionName: "decimals",
        });
        const oneToken = bigIntPow(BigInt(10), Number(decimals)); // 1 token
        const totalAmount = oneToken * BigInt(quantity); // Multiply by quantity
        const response = await client.ipAccount.transferErc20({
          ipId: project.project.ipId,
          tokens: [{
            address: royaltyTokenAddress,
            amount: totalAmount,
            target: userWalletAddress,
          }],
          txOptions: {
            waitForTransaction: true,
          },
        });
        console.log(`${quantity} royalty token(s) (IP) transferred. Tx hash: ${response.txHash}`);
        if (response.receipt) {
          console.log(`Transaction confirmed in block: ${response.receipt.blockNumber}`);
        }
      } else {
        console.error("No ipId or royalty token address found for this project.");
      }
    } catch (error) {
      console.error(`Error sending ETH or transferring IP(s):`, error);
    }
  };

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
              {p.category || "-"}
            </Badge>
            <Badge className="border-green-400 text-green-400 px-3 py-1 rounded-full" variant="outline">
              Active
            </Badge>
            <motion.span
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="text-fuchsia-400 font-mono font-bold bg-fuchsia-400/10 px-3 py-1 rounded-full"
            >
              {p.tokenSymbol ? `$${p.tokenSymbol}` : "-"}
            </motion.span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400">
            {p.title || "Untitled Project"}
          </h1>
          <p className="text-white/80 text-lg max-w-3xl">
            {p.description || "No description provided."}
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
                  <h3 className="text-white text-xl font-bold mb-4">Milestones</h3>
                  <div className="space-y-4">
                    {Array.isArray(p.milestones) && p.milestones.length > 0 ? (
                      p.milestones.map((m: any, i: number) => (
                        <motion.div
                          key={m.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-400/30 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-green-400/20 flex items-center justify-center mr-3">
                              <Sparkles className="h-5 w-5 text-green-400" />
                            </div>
                            <span className="text-green-400 font-medium">{m.title}</span>
                          </div>
                          <Badge className="bg-green-500 text-white">{m.funding}</Badge>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-white/60">No milestones available.</div>
                    )}
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
                        {p.nftContract || "-"}
                      </motion.span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Story Protocol License:</span>
                      <Badge className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white">
                        {p.licenseType || "-"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Royalty Rate:</span>
                      <span className="text-white font-bold">{p.royaltyRate ? `${p.royaltyRate}%` : "-"}</span>
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
                  <div className="text-white/70">No live data available.</div>
                </Card>
              </TabsContent>

              <TabsContent value="governance" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Vote className="h-6 w-6 text-purple-400 mr-2" />
                    <h3 className="text-white text-xl font-bold">Active Proposals</h3>
                  </div>
                  <div className="text-white/70">No governance proposals available.</div>
                </Card>
              </TabsContent>

              <TabsContent value="tokenomics" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <h3 className="text-white text-xl font-bold mb-4">Tokenomics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Token Symbol</span>
                      <span className="text-fuchsia-400 font-bold">{p.tokenSymbol || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Total Supply</span>
                      <span className="text-fuchsia-400 font-bold">{p.totalSupply || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Initial Price</span>
                      <span className="text-fuchsia-400 font-bold">{p.initialPrice || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Total Funding</span>
                      <span className="text-fuchsia-400 font-bold">{p.totalFunding || "-"}</span>
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
                    <span className="text-white">{p.currentFunding ? `$${p.currentFunding} / $${p.totalFunding}` : `0 / $${p.totalFunding || '-'}`}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-white/5 rounded-lg text-center">
                    <div className="text-white/70 mb-1">Token Price</div>
                    <div className="text-white text-lg font-bold">{p.initialPrice || '-'}</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-white/5 rounded-lg text-center">
                    <div className="text-white/70 mb-1">24h Change</div>
                    <div className="text-green-400 text-lg font-bold">-</div>
                  </motion.div>
                </div>
                <div className="p-4 bg-gradient-to-r from-fuchsia-900/20 to-fuchsia-800/10 border border-fuchsia-400/30 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">Your Investment</span>
                    <span className="text-fuchsia-400 font-mono">-</span>
                  </div>
                  <div className="text-white/70 text-sm">Connect your wallet to invest</div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="px-3 py-1 rounded-l-lg bg-fuchsia-700/30 text-white font-bold text-lg hover:bg-fuchsia-700/50 transition disabled:opacity-50"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity === 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-fuchsia-900/30 text-white font-mono text-lg border border-fuchsia-700/40">
                    {quantity}
                  </span>
                  <button
                    className="px-3 py-1 rounded-r-lg bg-fuchsia-700/30 text-white font-bold text-lg hover:bg-fuchsia-700/50 transition"
                    onClick={() => setQuantity(q => q + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  <Button className="flex-1 ml-4 bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-700/20 transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-700/30"
                    onClick={handleBuy}
                  >
                    Buy {p.tokenSymbol ? `$${p.tokenSymbol}` : "Tokens"}
                  </Button>
                </div>
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
                <div className="text-white/60">No stats available.</div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
