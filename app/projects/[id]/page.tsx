"use client"

import { useState, useEffect, useRef } from "react"
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
import { parseEther, encodeFunctionData } from "viem"
import { useAccount } from "wagmi"
import { erc20Abi } from "viem"
import { aeneid } from "@story-protocol/core-sdk";
import { storyAeneid } from "viem/chains"
import ReviewModal from "@/components/ui/review-modal"
import { CONTRACT_ADDRESS } from "@/lib/contract/address"
import { TOKEN_FACTORY_ABI } from "@/lib/contract/abi"

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

const IP_ASSET_REGISTRY = "0x77319B4031e6eF1250907aa00018B8B1c67a244b"
const TOKEN_FACTORY_RECIPIENT = "0xf76daC24BaEf645ee0b3dfAc1997c6b838eF280D"

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

  // Governance state
  const [proposals, setProposals] = useState<any[]>([]);
  const [govLoading, setGovLoading] = useState(false);
  const [govError, setGovError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [voting, setVoting] = useState<string | null>(null); // proposalId being voted on
  const [userTokenBalance, setUserTokenBalance] = useState<number>(0);
  const [userTokenDecimals, setUserTokenDecimals] = useState<number>(18);
  const [refreshGov, setRefreshGov] = useState(0);
  const proposalTitleRef = useRef<HTMLInputElement>(null);

  // Peer Review state
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

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

  useEffect(() => {
    const logRoyaltyTokenBalance = async () => {
      if (
        isConnected &&
        userWalletAddress &&
        project?.project?.royaltyToken?.address
      ) {
        try {
          const royaltyTokenAddress = project.project.royaltyToken.address;
          const balance = await publicClient.readContract({
            address: royaltyTokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [userWalletAddress],
          });
          const decimals = await publicClient.readContract({
            address: royaltyTokenAddress,
            abi: erc20Abi,
            functionName: "decimals",
          });
          // Convert balance to readable format
          const formatted = Number(balance) / Math.pow(10, Number(decimals));
          console.log(`User has ${formatted} royalty tokens (${royaltyTokenAddress})`);
        } catch (err) {
          console.error("Failed to fetch royalty token balance", err);
        }
      }
    };
    logRoyaltyTokenBalance();
  }, [isConnected, userWalletAddress, project]);

  // Fetch proposals for this project
  useEffect(() => {
    if (!project?.project?.id) return;
    setGovLoading(true);
    fetch(`/api/governance/proposals?projectId=${project.project.id}`)
      .then(res => res.json())
      .then(data => {
        setProposals(data.proposals || []);
        setGovLoading(false);
      })
      .catch(err => {
        setGovError("Failed to fetch proposals");
        setGovLoading(false);
      });
  }, [ refreshGov]);

  // Fetch user token balance for eligibility
  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && userWalletAddress && project?.project?.royaltyToken?.address) {
        try {
          const decimals = await publicClient.readContract({
            address: project.project.royaltyToken.address,
            abi: erc20Abi,
            functionName: "decimals",
          });
          setUserTokenDecimals(Number(decimals));
          const balance = await publicClient.readContract({
            address: project.project.royaltyToken.address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [userWalletAddress],
          });
          setUserTokenBalance(Number(balance) / Math.pow(10, Number(decimals)));
        } catch (err) {
          setUserTokenBalance(0);
        }
      }
    };
    fetchBalance();
  }, [isConnected, userWalletAddress, project?.project?.royaltyToken?.address, refreshGov]);

  // Fetch reviews
  const fetchReviews = async () => {
    if (!project?.project?.id) return;
    const res = await fetch(`/api/reviews?projectId=${project.project.id}`);
    const data = await res.json();
    setReviews(data.reviews || []);
  };
  useEffect(() => { fetchReviews(); }, [project?.project?.id, refreshGov]);

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
    if (!userWalletAddress || !project?.project?.ipId) {
      console.log("Please connect your wallet and ensure project is loaded.");
      return;
    }
    try {
      const data = encodeFunctionData({
        abi: TOKEN_FACTORY_ABI,
        functionName: "sendTokens",
        args: [
          TOKEN_FACTORY_RECIPIENT,
          project.project.ipId,
        ],
      });
      // Send transaction using MetaMask or any injected wallet
      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: userWalletAddress,
            to: CONTRACT_ADDRESS,
            value: parseEther(quantity.toString()).toString(16), // hex string
            data,
          },
        ],
      });
      console.log("Tokens sent and royalty minted. Tx hash:", tx);
      // Optionally, show a toast or update UI state here
    } catch (error) {
      console.error("Error sending tokens/minting royalty:", error);
      // Optionally, show error to user
    }
  };

  // Create proposal handler
  const handleCreateProposal = async () => {
    setCreating(true);
    setGovError(null);
    try {
      const res = await fetch("/api/governance/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          title: newProposal.title,
          description: newProposal.description,
          creatorAddress: userWalletAddress,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setGovError(data.error || "Failed to create proposal");
      } else {
        setShowCreate(false);
        setNewProposal({ title: "", description: "" });
        setRefreshGov(r => r + 1);
      }
    } catch (err) {
      setGovError("Failed to create proposal");
    }
    setCreating(false);
  };

  // Vote handler
  const handleVote = async (proposalId: string, choice: "for" | "against") => {
    setVoting(proposalId);
    setGovError(null);
    try {
      const res = await fetch("/api/governance/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          userAddress: userWalletAddress,
          choice,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setGovError(data.error || "Failed to vote");
      } else {
        setRefreshGov(r => r + 1);
      }
    } catch (err) {
      setGovError("Failed to vote");
    }
    setVoting(null);
  };

  // Submit review
  const submitReview = async (content: string, rating: number) => {
    setSubmittingReview(true);
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          reviewerId: userWalletAddress,
          content,
          rating,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setReviewError(data.error || "Failed to submit review");
      } else {
        setShowReviewModal(false);
        fetchReviews();
      }
    } catch {
      setReviewError("Failed to submit review");
    }
    setSubmittingReview(false);
  };

  // Vote on review
  const voteReview = async (reviewId: string, value: number) => {
    try {
      const res = await fetch("/api/reviews/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          voterId: userWalletAddress,
          value,
        }),
      });
      if (res.ok) fetchReviews();
    } catch {}
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
                <TabsTrigger
                  value="peer-review"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-600 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white rounded-lg"
                >
                  Peer Review
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
                    {isConnected && userTokenBalance >= 5 && (
                      <Button className="ml-auto bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white" onClick={() => setShowCreate(true)}>
                        Create Proposal
                      </Button>
                    )}
                  </div>
                  {govError && <div className="text-red-400 mb-2">{govError}</div>}
                  {showCreate && (
                    <div className="mb-6 p-4 bg-black/40 rounded-xl border border-fuchsia-700/30">
                      <input
                        ref={proposalTitleRef}
                        className="w-full mb-2 px-3 py-2 rounded bg-white/10 text-white placeholder:text-white/40 border border-fuchsia-700/30 focus:outline-none"
                        placeholder="Proposal Title"
                        value={newProposal.title}
                        onChange={e => setNewProposal({ ...newProposal, title: e.target.value })}
                        disabled={creating}
                      />
                      <textarea
                        className="w-full mb-2 px-3 py-2 rounded bg-white/10 text-white placeholder:text-white/40 border border-fuchsia-700/30 focus:outline-none"
                        placeholder="Proposal Description"
                        value={newProposal.description}
                        onChange={e => setNewProposal({ ...newProposal, description: e.target.value })}
                        disabled={creating}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white" onClick={handleCreateProposal} disabled={creating || !newProposal.title.trim()}>
                          {creating ? "Creating..." : "Submit"}
                        </Button>
                        <Button variant="outline" onClick={() => setShowCreate(false)} disabled={creating}>Cancel</Button>
                      </div>
                    </div>
                  )}
                  {govLoading ? (
                    <div className="text-white/70">Loading proposals...</div>
                  ) : proposals.length === 0 ? (
                    <div className="text-white/60">No governance proposals available.</div>
                  ) : (
                    <div className="space-y-6">
                      {proposals.map((proposal: any) => (
                        <Card key={proposal.id} className="bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-400/30 rounded-xl p-4">
                          <div className="flex items-center mb-2">
                            <span className="text-purple-400 font-bold text-lg mr-2">{proposal.title}</span>
                            <Badge className="ml-2 bg-purple-700/40 text-white">{proposal.status}</Badge>
                          </div>
                          <div className="text-white/80 mb-2">{proposal.description}</div>
                          <div className="flex gap-4 items-center mb-2">
                            <span className="text-white/60 text-sm">Ends: {new Date(proposal.endsAt).toLocaleString()}</span>
                          </div>
                          <div className="flex gap-4 items-center mb-2">
                            <span className="text-green-400 font-mono">For: {proposal.votes.filter((v: any) => v.choice === 'for').reduce((acc: number, v: any) => acc + Number(v.weight) / Math.pow(10, userTokenDecimals), 0)}</span>
                            <span className="text-red-400 font-mono">Against: {proposal.votes.filter((v: any) => v.choice === 'against').reduce((acc: number, v: any) => acc + Number(v.weight) / Math.pow(10, userTokenDecimals), 0)}</span>
                            <span className="text-cyan-400 font-mono">Quorum: 20</span>
                          </div>
                          {proposal.status === 'active' && isConnected && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                className="bg-gradient-to-r from-green-600 to-green-400 text-white"
                                onClick={() => handleVote(proposal.id, 'for')}
                                disabled={voting === proposal.id || proposal.votes.some((v: any) => v.userId === userWalletAddress)}
                              >
                                Vote For
                              </Button>
                              <Button
                                className="bg-gradient-to-r from-red-600 to-red-400 text-white"
                                onClick={() => handleVote(proposal.id, 'against')}
                                disabled={voting === proposal.id || proposal.votes.some((v: any) => v.userId === userWalletAddress)}
                              >
                                Vote Against
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
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

              <TabsContent value="peer-review" className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <h3 className="text-white text-xl font-bold">Open Peer Reviews</h3>
                    {isConnected && (
                      <Button className="ml-auto bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                        onClick={() => setShowReviewModal(true)}>
                        Submit Review
                      </Button>
                    )}
                  </div>
                  {reviewError && <div className="text-red-400 mb-2">{reviewError}</div>}
                  {reviews.length === 0 ? (
                    <div className="text-white/60">No reviews yet. Be the first to review!</div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <Card key={review.id} className="bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-400/30 rounded-xl p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-fuchsia-400 font-mono">{review.reviewer?.address?.slice(0, 6)}...{review.reviewer?.address?.slice(-4)}</span>
                            <span className="text-white/40 text-xs">{new Date(review.createdAt).toLocaleString()}</span>
                            {review.rewarded && <span className="ml-2 text-green-400">Rewarded</span>}
                          </div>
                          <div className="mt-2 text-white/90">{review.content}</div>
                          <div className="flex gap-2 mt-2">
                            <span className="text-yellow-400">Rating: {review.rating}/5</span>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-green-400 text-white"
                              onClick={() => voteReview(review.id, 1)}
                              disabled={review.votes.some((v: any) => v.voterId === userWalletAddress)}
                            >
                              👍
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-red-600 to-red-400 text-white"
                              onClick={() => voteReview(review.id, -1)}
                              disabled={review.votes.some((v: any) => v.voterId === userWalletAddress)}
                            >
                              👎
                            </Button>
                            <span className="text-white/60">{review.votes.reduce((acc: number, v: any) => acc + v.value, 0)} votes</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
                {showReviewModal && (
                  <ReviewModal
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={submitReview}
                    loading={submittingReview}
                  />
                )}
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
