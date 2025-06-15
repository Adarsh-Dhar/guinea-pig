"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Vote, Activity, ChevronUp, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ParticleBackground from "@/components/particle-background"
import ConnectWalletButton from "@/components/connect-wallet-button"
import { useParams } from "next/navigation"
import { client, publicClient } from "@/lib/config"
import { parseEther } from "viem"
import { useAccount, useWalletClient } from "wagmi"
import { erc20Abi } from "viem"
import ReviewModal from "@/components/ui/review-modal"
import Image from "next/image"
import Confetti from "react-confetti"
import { getCurrentPrice, getPriceAfterBuy } from "@/lib/dynamicPrice"
import { escrowAbi } from "@/lib/escrow/abi"
import { escrowAddress } from "@/lib/escrow/address"
import { useToast } from '@/components/ui/use-toast'

// Helper for BigInt exponentiation (works in all JS targets)
function bigIntPow(base: bigint, exp: number): bigint {
  let result = BigInt(1);
  for (let i = 0; i < exp; i++) result *= base;
  return result;
}


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

  // Add state for hamster image
  const [hamsterState, setHamsterState] = useState<'default' | 'celebrate'>("default");
  const hamsterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add state for confetti
  const [showConfetti, setShowConfetti] = useState(false);

  // Dynamic pricing state
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [lastBuyTimestamp, setLastBuyTimestamp] = useState<number>(Date.now());
  const [priceHistory, setPriceHistory] = useState<{ price: number; timestamp: number }[]>([]);

  // Pricing parameters (could be made project-specific)
  const decayRatePerHour = 0.01; // Price decays by $0.01 per hour of inactivity
  const priceImpactPerToken = 0.02; // Each token bought increases price by $0.02

  const { data: walletClient } = useWalletClient();

  // Add state to track claimed milestones
  const [claimingMilestoneId, setClaimingMilestoneId] = useState<string | null>(null);

  const { toast } = useToast();

  // Helper to trigger celebration hamster
  const triggerHamsterCelebrate = () => {
    setHamsterState('celebrate');
    if (hamsterTimeoutRef.current) clearTimeout(hamsterTimeoutRef.current);
    hamsterTimeoutRef.current = setTimeout(() => setHamsterState('default'), 5000);
  };

  // Helper to trigger confetti
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  // Handler for claiming a milestone (calls backend and interacts with escrow contract)
  const handleClaimMilestone = async (milestoneId: string, name: string) => {
    setClaimingMilestoneId(milestoneId);
    try {
      // Find the milestone index and funding amount
      const milestoneIndex = project?.project?.milestones.findIndex((m: any) => m.id === milestoneId);
      if (milestoneIndex === -1) throw new Error('Milestone not found');
      const funding = project?.project?.milestones[milestoneIndex].funding;
      if (!funding || !project?.project?.escrowId) throw new Error('Funding or escrowId missing');
      if (!walletClient) throw new Error('Wallet client not available');

      // 1. Check escrow balance
      const escrowBalance = await publicClient.readContract({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: 'getEscrowBalance',
        args: [BigInt(project.project.escrowId)],
      });
      console.log("escrowBalance", escrowBalance);
      // Ensure funding is a string or number before converting to BigInt
      const fundingBigInt = parseEther(funding.toString());
      const escrowBalanceBigInt = BigInt(String(escrowBalance));
      if (escrowBalanceBigInt < fundingBigInt) {
        toast({
          title: 'Insufficient Escrow Balance',
          description: `Escrow balance is less than required for this milestone. Please add more funds.`,
          variant: 'destructive',
        });
        setClaimingMilestoneId(null);
        return;
      }

      // 2. Withdraw funds as owner
      let txHash;
      try {
        txHash = await walletClient.writeContract({
          address: escrowAddress,
          abi: escrowAbi,
          functionName: 'ownerWithdrawFromEscrow',
          args: [BigInt(project.project.escrowId), fundingBigInt],
          account: userWalletAddress,
        });
        console.log('ownerWithdrawFromEscrow txHash:', txHash);
      } catch (err: any) {
        toast({
          title: 'Withdrawal Failed',
          description: err?.message || 'Failed to withdraw funds from escrow.',
          variant: 'destructive',
        });
        setClaimingMilestoneId(null);
        return;
      }
      // Wait for transaction receipt
      try {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } catch (err: any) {
        toast({
          title: 'Transaction Error',
          description: err?.message || 'Transaction did not complete.',
          variant: 'destructive',
        });
        setClaimingMilestoneId(null);
        return;
      }

      // 3. Update milestone as claimed in DB
      const res = await fetch('/api/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, claimed: true }),
      });
      if (!res.ok) throw new Error('Failed to claim milestone');
      // Refetch project data to update UI
      if (project?.project?.id) {
        const refreshed = await fetch(`/api/experiments/${project.project.id}`);
        const data = await refreshed.json();
        setProject(data);
      }
      toast({
        title: 'Milestone Claimed',
        description: `${name} has been successfully claimed!`,
      });
      console.log(`Claimed milestone: ${name}`);
    } catch (err: any) {
      toast({
        title: 'Claim Error',
        description: err?.message || 'Failed to claim milestone',
        variant: 'destructive',
      });
      console.error(err);
    }
    setClaimingMilestoneId(null);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/experiments/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch project data");
        return res.json();
      })
      .then((data) => {
        console.log(data);
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
  }, [project?.project?.id, refreshGov]);

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

  // Set initial price from project data
  useEffect(() => {
    if (project?.project?.initialPrice) {
      setCurrentPrice(Number(project.project.initialPrice));
      setLastBuyTimestamp(Date.now());
      setPriceHistory([{ price: Number(project.project.initialPrice), timestamp: Date.now() }]);
    }
  }, [project?.project?.initialPrice]);

  // Decay price every minute if no buys
  useEffect(() => {
    if (currentPrice === null) return;
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        if (prev === null) return null;
        const decayed = getCurrentPrice({
          currentPrice: prev,
          lastBuyTimestamp,
          basePrice: Number(project?.project?.initialPrice) || 1,
          decayRatePerHour,
        });
        if (decayed !== prev) {
          setPriceHistory((hist) => [...hist, { price: decayed, timestamp: Date.now() }]);
        }
        return decayed;
      });
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [currentPrice, lastBuyTimestamp, project?.project?.initialPrice]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6f1]">
        <span className="text-[#3d2c1e] text-xl animate-pulse">Loading project...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6f1]">
        <span className="text-[#bfa07a] text-xl">{error}</span>
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

  const handleBuy = async () => {
    if (!userWalletAddress) {
      console.log("Please connect your wallet first.");
      return;
    }
    if (!walletClient) {
      console.error("Wallet client not available");
      return;
    }
    if (!project?.project?.escrowId) {
      console.error("No escrowId found for this project.");
      return;
    }
    try {
      // 1. Send ETH to escrow contract
      const priceToPay = currentPrice !== null ? currentPrice : (project.project.tokenPrice || 0);
      const value = parseEther((priceToPay * quantity).toString());
      console.log("escrowId", BigInt(project.project.escrowId));
      // Call addFunds on the escrow contract
      const txHash = await walletClient.writeContract({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "addFunds",
        args: [
          BigInt(project.project.escrowId), // escrowId
          [], // No new milestone descriptions
          []  // No new milestone amounts
        ],
        value,
        account: userWalletAddress,
      });
      console.log("addFunds txHash:", txHash);
      // Wait for receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("addFunds receipt:", receipt);

      // 2. Mint royalty tokens to user using client.ipAccount.transferErc20 (copied code style)
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
        console.log(`${quantity} royalty token(s) (IP) minted to user. Tx hash: ${response.txHash}`);
        if (response.receipt) {
          console.log(`Mint transaction confirmed in block: ${response.receipt.blockNumber}`);
        }
      } else {
        console.error("No ipId or royalty token address found for this project.");
      }

      // Record the investment in the backend
      const investmentRes = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: userWalletAddress,
          projectId: project.project.id,
          amount: (project.project.tokenPrice * quantity).toString(),
          tokens: quantity.toString(),
        }),
      });
      const investmentData = await investmentRes.json();
      // Refresh project data to update currentFunding
      const res = await fetch(`/api/experiments/${project.project.id}`);
      const data = await res.json();
      setProject(data);
      setQuantity(1); // Reset quantity after buy
      triggerConfetti(); // Show confetti
      triggerHamsterCelebrate(); // Celebrate after buy
      // After successful buy, update price and lastBuyTimestamp
      setCurrentPrice((prev) => {
        if (prev === null) return null;
        const newPrice = getPriceAfterBuy({
          currentPrice: prev,
          amount: quantity,
          priceImpactPerToken,
        });
        setPriceHistory((hist) => [...hist, { price: newPrice, timestamp: Date.now() }]);
        return newPrice;
      });
      setLastBuyTimestamp(Date.now());
    } catch (error) {
      console.error(`Error funding escrow or minting tokens:`, error);
    }
  }

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
        triggerHamsterCelebrate(); // Celebrate after proposal
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
        triggerHamsterCelebrate(); // Celebrate after review
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

  // Calculate price change (last 24h)
  const price24hAgo = priceHistory.find(h => h.timestamp <= Date.now() - 24 * 3600 * 1000)?.price || (priceHistory.length > 0 ? priceHistory[0].price : null);
  const priceChange24h = currentPrice !== null && price24hAgo !== null ? ((currentPrice - price24hAgo) / price24hAgo) * 100 : null;

  return (
    <div className="min-h-screen bg-[#fdf6f1] overflow-hidden">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={350} gravity={0.25} />}
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
            <Link href="/projects" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-[#a68c7c]" />
              <span className="text-xl font-bold text-[#3d2c1e]">Back to Projects</span>
            </Link>
            <ConnectWalletButton />
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Badge className="bg-[#a68c7c] text-[#3d2c1e] px-3 py-1 rounded-full">
              {p.category || "-"}
            </Badge>
            <Badge className="border-fuchsia-400 text-fuchsia-400 px-3 py-1 rounded-full" variant="outline">
              Active
            </Badge>
            <motion.span
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="text-[#a68c7c] font-mono font-bold bg-[#a68c7c]/10 px-3 py-1 rounded-full"
            >
              {p.tokenSymbol ? `$${p.tokenSymbol}` : "-"}
            </motion.span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#3d2c1e]">
              {p.title || "Untitled Project"}
            </h1>
            <Image
              src={hamsterState === 'celebrate' ? "/assets/hamster4.png" : "/assets/hamster5.png"}
              alt="Hamster"
              width={hamsterState === 'celebrate' ? 180 : 100}
              height={hamsterState === 'celebrate' ? 300 : 200}
              className="drop-shadow-xl transition-all duration-500 mb-4"
              priority
            />
          </div>
          <p className="text-[#8c715c] text-lg max-w-3xl">
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
              <TabsList className="bg-[#f3ede7] border border-[#e5ded7] rounded-xl p-1">
                <TabsTrigger
                  value="overview"
                  className="text-black data-[state=active]:bg-[#a68c7c] data-[state=active]:text-[#3d2c1e] rounded-lg"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="data"
                  className="text-black data-[state=active]:bg-[#a68c7c] data-[state=active]:text-[#3d2c1e] rounded-lg"
                >
                  Live Data
                </TabsTrigger>
                <TabsTrigger
                  value="governance"
                  className="text-black data-[state=active]:bg-[#a68c7c] data-[state=active]:text-[#3d2c1e] rounded-lg"
                >
                  Governance
                </TabsTrigger>
                <TabsTrigger
                  value="tokenomics"
                  className="text-black data-[state=active]:bg-[#a68c7c] data-[state=active]:text-[#3d2c1e] rounded-lg"
                >
                  Tokenomics
                </TabsTrigger>
                <TabsTrigger
                  value="peer-review"
                  className="text-black data-[state=active]:bg-[#a68c7c] data-[state=active]:text-[#3d2c1e] rounded-lg"
                >
                  Peer Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-[#f3ede7]/5 backdrop-blur-lg border border-[#e5ded7]/10 rounded-xl p-6">
                  <h3 className="text-[#3d2c1e] text-xl font-bold mb-4">Milestones</h3>
                  <div className="space-y-4">
                    {Array.isArray(p.milestones) && p.milestones.length > 0 ? (
                      p.milestones.map((m: any, i: number) => {
                        const isClaimed = m.claimed;
                        const canClaim = i === 0 || p.milestones[i - 1]?.claimed;
                        return (
                          <motion.div
                            key={m.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-gradient-to-r from-fuchsia-900/20 to-fuchsia-800/10 border border-fuchsia-400/30 rounded-xl flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-fuchsia-400/20 flex items-center justify-center mr-3">
                                <Sparkles className="h-5 w-5 text-fuchsia-400" />
                              </div>
                              <span className="text-fuchsia-400 font-medium">{m.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-fuchsia-500 text-[#3d2c1e]">{m.funding}</Badge>
                              <Button
                                className={`ml-2 bg-[#a68c7c] hover:bg-[#8c715c] text-[#fdf6f1] ${isClaimed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!canClaim || isClaimed || claimingMilestoneId === m.id}
                                onClick={() => handleClaimMilestone(m.id, m.title)}
                                size="sm"
                              >
                                {claimingMilestoneId === m.id ? 'Claiming...' : isClaimed ? 'Claimed' : 'Claim Milestone'}
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-[#8c715c]">No milestones available.</div>
                    )}
                  </div>
                </Card>

                <Card className="bg-[#f3ede7]/5 backdrop-blur-lg border border-[#e5ded7]/10 rounded-xl p-6">
                  <h3 className="text-[#3d2c1e] text-xl font-bold mb-4">IP Asset Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-[#f3ede7]/5 rounded-lg">
                      <span className="text-[#8c715c]">IP Asset ID:</span>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="text-[#a68c7c] font-mono bg-fuchsia-500/10 px-3 py-1 rounded-full"
                      >
                        {p.nftContract || "-"}
                      </motion.span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#f3ede7]/5 rounded-lg">
                      <span className="text-[#8c715c]">Story Protocol License:</span>
                      <Badge className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-[#3d2c1e]">
                        {p.licenseType || "-"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#f3ede7]/5 rounded-lg">
                      <span className="text-[#8c715c]">Royalty Rate:</span>
                      <span className="text-[#3d2c1e] font-bold">{p.royaltyRate ? `${p.royaltyRate}%` : "-"}</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                <Card className="bg-[#f3ede7]/5 backdrop-blur-lg border border-[#e5ded7]/10 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Activity className="h-6 w-6 text-[#a68c7c] mr-2" />
                    <h3 className="text-[#3d2c1e] text-xl font-bold">Live Experiment Data</h3>
                  </div>
                  <div className="text-[#8c715c]">No live data available.</div>
                </Card>
              </TabsContent>

              <TabsContent value="governance" className="space-y-6">
                <Card className="bg-[#f3ede7]/5 backdrop-blur-lg border border-[#e5ded7]/10 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Vote className="h-6 w-6 text-[#a68c7c] mr-2" />
                    <h3 className="text-[#3d2c1e] text-xl font-bold">Active Proposals</h3>
                    {isConnected && userTokenBalance >= 5 && (
                      <Button className="ml-auto bg-[#a68c7c] hover:bg-[#8c715c] text-[#fdf6f1]" onClick={() => setShowCreate(true)}>
                        Create Proposal
                      </Button>
                    )}
                  </div>
                  {govError && <div className="text-[#bfa07a] mb-2">{govError}</div>}
                  {showCreate && (
                    <div className="mb-6 p-4 bg-black/40 rounded-xl border border-fuchsia-700/30">
                      <input
                        ref={proposalTitleRef}
                        className="w-full mb-2 px-3 py-2 rounded bg-[#f3ede7]/10 text-[#3d2c1e] placeholder:text-[#8c715c] border border-fuchsia-700/30 focus:outline-none"
                        placeholder="Proposal Title"
                        value={newProposal.title}
                        onChange={e => setNewProposal({ ...newProposal, title: e.target.value })}
                        disabled={creating}
                      />
                      <textarea
                        className="w-full mb-2 px-3 py-2 rounded bg-[#f3ede7]/10 text-[#3d2c1e] placeholder:text-[#8c715c] border border-fuchsia-700/30 focus:outline-none"
                        placeholder="Proposal Description"
                        value={newProposal.description}
                        onChange={e => setNewProposal({ ...newProposal, description: e.target.value })}
                        disabled={creating}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button className="bg-[#a68c7c] hover:bg-[#8c715c] text-[#fdf6f1]" onClick={handleCreateProposal} disabled={creating || !newProposal.title.trim()}>
                          {creating ? "Creating..." : "Submit"}
                        </Button>
                        <Button variant="outline" onClick={() => setShowCreate(false)} disabled={creating}>Cancel</Button>
                      </div>
                    </div>
                  )}
                  {govLoading ? (
                    <div className="text-[#8c715c]">Loading proposals...</div>
                  ) : proposals.length === 0 ? (
                    <div className="text-[#8c715c]">No governance proposals available.</div>
                  ) : (
                    <div className="space-y-6">
                      {proposals.map((proposal: any) => (
                        <Card key={proposal.id} className="bg-gradient-to-r from-[#a68c7c]/20 to-[#f3ede7]/10 border border-[#a68c7c]/30 rounded-xl p-4">
                          <div className="flex items-center mb-2">
                            <span className="text-[#a68c7c] font-bold text-lg mr-2">{proposal.title}</span>
                            <Badge className="ml-2 bg-[#a68c7c]/40 text-[#3d2c1e]">{proposal.status}</Badge>
                          </div>
                          <div className="text-[#8c715c] mb-2">{proposal.description}</div>
                          <div className="flex gap-4 items-center mb-2">
                            <span className="text-[#8c715c] text-sm">Ends: {new Date(proposal.endsAt).toLocaleString()}</span>
                          </div>
                          <div className="flex gap-4 items-center mb-2">
                            <span className="text-fuchsia-400 font-mono">For: {proposal.votes.filter((v: any) => v.choice === 'for').reduce((acc: number, v: any) => acc + Number(v.weight) / Math.pow(10, userTokenDecimals), 0)}</span>
                            <span className="text-red-400 font-mono">Against: {proposal.votes.filter((v: any) => v.choice === 'against').reduce((acc: number, v: any) => acc + Number(v.weight) / Math.pow(10, userTokenDecimals), 0)}</span>
                            <span className="text-[#a68c7c] font-mono">Quorum: 20</span>
                          </div>
                          {proposal.status === 'active' && isConnected && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                className="bg-[#a68c7c] hover:bg-[#8c715c] text-[#fdf6f1]"
                                onClick={() => handleVote(proposal.id, 'for')}
                                disabled={voting === proposal.id || proposal.votes.some((v: any) => v.userId === userWalletAddress)}
                              >
                                Vote For
                              </Button>
                              <Button
                                className="bg-[#a68c7c] hover:bg-[#8c715c] text-[#fdf6f1]"
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
                <Card className="bg-[#f3ede7]/5 backdrop-blur-lg border border-[#e5ded7]/10 rounded-xl p-6">
                  <h3 className="text-[#3d2c1e] text-xl font-bold mb-4">Tokenomics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#3d2c1e] font-medium">Token Symbol</span>
                      <span className="text-[#a68c7c] font-bold">{p.tokenSymbol || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#3d2c1e] font-medium">Total Supply</span>
                      <span className="text-[#a68c7c] font-bold">{p.totalSupply || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#3d2c1e] font-medium">Initial Price</span>
                      <span className="text-[#a68c7c] font-bold">{p.initialPrice || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#3d2c1e] font-medium">Total Funding</span>
                      <span className="text-[#a68c7c] font-bold">{p.totalFunding || "-"}</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="peer-review" className="space-y-6">
                <Card className="bg-[#f3ede7]/5 backdrop-blur-lg border border-[#e5ded7]/10 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <h3 className="text-[#3d2c1e] text-xl font-bold">Open Peer Reviews</h3>
                    {isConnected && (
                      <Button className="ml-auto bg-[#a68c7c] hover:bg-[#8c715c] text-[#fdf6f1]"
                        onClick={() => setShowReviewModal(true)}>
                        Submit Review
                      </Button>
                    )}
                  </div>
                  {reviewError && <div className="text-[#bfa07a] mb-2">{reviewError}</div>}
                  {reviews.length === 0 ? (
                    <div className="text-[#8c715c]">No reviews yet. Be the first to review!</div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <Card key={review.id} className="bg-gradient-to-r from-[#a68c7c]/20 to-[#f3ede7]/10 border border-[#a68c7c]/30 rounded-xl p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[#a68c7c] font-mono">{review.reviewer?.address?.slice(0, 6)}...{review.reviewer?.address?.slice(-4)}</span>
                            <span className="text-[#8c715c] text-xs">{new Date(review.createdAt).toLocaleString()}</span>
                            {review.rewarded && <span className="ml-2 text-fuchsia-400">Rewarded</span>}
                          </div>
                          <div className="mt-2 text-[#3d2c1e]">{review.content}</div>
                          <div className="flex gap-2 mt-2">
                            <span className="text-yellow-400">Rating: {review.rating}/5</span>
                            <Button
                              size="sm"
                              className="bg-[#a68c7c] hover:bg-[#8c715c] text-[#fdf6f1]"
                              onClick={() => voteReview(review.id, 1)}
                              disabled={review.votes.some((v: any) => v.voterId === userWalletAddress)}
                            >
                              👍
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#a68c7c] hover:bg-[#8c715c] text-[#fdf6f1]"
                              onClick={() => voteReview(review.id, -1)}
                              disabled={review.votes.some((v: any) => v.voterId === userWalletAddress)}
                            >
                              👎
                            </Button>
                            <span className="text-[#8c715c]">{review.votes.reduce((acc: number, v: any) => acc + v.value, 0)} votes</span>
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
            <Card className="bg-[#f3ede7]/5 backdrop-blur-lg border border-[#e5ded7]/10 rounded-xl p-6">
              <h3 className="text-[#3d2c1e] text-xl font-bold mb-4">Investment Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8c715c]">Funding Progress</span>
                    <span className="text-[#3d2c1e]">{p.currentFunding ? `$${p.currentFunding} / $${p.totalFunding}` : `0 / $${p.totalFunding || '-'}`}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-[#f3ede7]/5 rounded-lg text-center">
                    <div className="text-[#8c715c] mb-1">Token Price</div>
                    <div className="text-[#a68c7c] font-bold">{currentPrice !== null ? currentPrice.toFixed(4) : (p.tokenPrice || 1)}</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-[#f3ede7]/5 rounded-lg text-center">
                    <div className="text-[#8c715c] mb-1">24h Change</div>
                    <div className={priceChange24h !== null && priceChange24h >= 0 ? "text-fuchsia-400 text-lg font-bold" : "text-red-400 text-lg font-bold"}>
                      {priceChange24h !== null ? `${priceChange24h >= 0 ? "+" : ""}${priceChange24h.toFixed(2)}%` : "-"}
                    </div>
                  </motion.div>
                </div>
                <div className="p-4 bg-gradient-to-r from-fuchsia-900/20 to-fuchsia-800/10 border border-fuchsia-400/30 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#3d2c1e]">Your Investment</span>
                    <span className="text-[#a68c7c] font-mono">-</span>
                  </div>
                  <div className="text-[#8c715c] text-sm">Connect your wallet to invest</div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[#8c715c] text-sm">
                    {`You will spend ${currentPrice !== null ? (currentPrice * quantity).toFixed(4) : (p.tokenPrice ? (Number(p.tokenPrice) * quantity).toFixed(4) : (1 * quantity).toFixed(4))} IP for ${quantity} RT`}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="px-3 py-1 rounded-l-lg bg-fuchsia-700/30 text-[#3d2c1e] font-bold text-lg hover:bg-fuchsia-700/50 transition disabled:opacity-50"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity === 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-fuchsia-900/30 text-[#3d2c1e] font-mono text-lg border border-fuchsia-700/40">
                    {quantity}
                  </span>
                  <button
                    className="px-3 py-1 rounded-r-lg bg-fuchsia-700/30 text-[#3d2c1e] font-bold text-lg hover:bg-fuchsia-700/50 transition"
                    onClick={() => setQuantity(q => q + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  <Button className="flex-1 ml-4 bg-[#a68c7c] hover:bg-[#8c715c] text-[#fdf6f1]"
                    onClick={handleBuy}
                  >
                    Buy {p.tokenSymbol ? `$${p.tokenSymbol}` : "Tokens"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="bg-[#f3ede7]/5 backdrop-blur-lg border border-[#e5ded7]/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#3d2c1e] text-xl font-bold">Project Stats</h3>
                <button onClick={toggleExpand} className="text-[#8c715c] hover:text-[#3d2c1e]">
                  {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
              <div className="space-y-3">
                <div className="text-[#8c715c]">No stats available.</div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}