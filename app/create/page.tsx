"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Upload, Plus, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ParticleBackground from "@/components/particle-background"
import ConnectWalletButton from "@/components/connect-wallet-button"
import { useAccount } from "wagmi"
import { client } from "@/lib/story-utils"

export default function CreateProjectPage() {
  const [milestones, setMilestones] = useState([{ title: "", description: "", funding: "" }])
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [totalSupply, setTotalSupply] = useState("")
  const [totalFunding, setTotalFunding] = useState("")
  const [initialPrice, setInitialPrice] = useState("")
  const [licenseType, setLicenseType] = useState("")
  const [royaltyRate, setRoyaltyRate] = useState("")
  const [nftContract, setNftContract] = useState("")
  const [tokenId, setTokenId] = useState("")
  const [loading, setLoading] = useState(false)
  const { isConnected, address } = useAccount()

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", description: "", funding: "" }])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    setMilestones(milestones.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Compose milestones into a string for description
    const milestonesText = milestones.map((m, i) => `Milestone ${i+1}: ${m.title}\nFunding: ${m.funding}\n${m.description}`).join("\n\n")
    const fullDescription = `${description}\n\n---\nMilestones:\n${milestonesText}`
    // Ensure nftContract is 0x-prefixed
    const contractAddress = nftContract.startsWith("0x") ? nftContract : `0x${nftContract}`
    const ipMetadata = {
      title,
      description: fullDescription +
        `\n\nExtra Data: ${JSON.stringify({ category, tokenSymbol, totalSupply, totalFunding, initialPrice, licenseType, royaltyRate })}`,
      image: "https://ipfs.io/ipfs/QmSamy4zqP91X42k6wS7kLJQVzuYJuW2EN94couPaq82A8", // placeholder
      mediaUrl: "https://ipfs.io/ipfs/QmSamy4zqP91X42k6wS7kLJQVzuYJuW2EN94couPaq82A8", // placeholder
      mediaType: "image/png",
      creators: [
        {
          name: address || "",
          address: address || "",
          description: "Researcher",
          contributionPercent: 100,
          socialMedia: [],
        },
      ],
    }
    try {
      await client.ipAsset.register({
        nftContract: contractAddress as `0x${string}`,
        tokenId
      })
      alert("IP Asset created successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to create IP Asset: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
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
            <ConnectWalletButton />
          </div>
        </div>
      </motion.nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            Create Research Project
          </h1>
          <p className="text-white/80 text-lg">Register your research as an IP Asset and start fundraising</p>
        </motion.div>

        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-8"
          >
            <Card className="bg-white/5 backdrop-blur-lg border border-fuchsia-500/50 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-4">
                <Sparkles className="h-8 w-8 text-fuchsia-400" />
                <div>
                  <h3 className="text-white text-lg font-bold mb-2">Connect Your Wallet</h3>
                  <p className="text-white/70 mb-4">You need to connect your wallet to create a research project</p>
                  <ConnectWalletButton />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className={`space-y-8 ${!isConnected ? "opacity-50 pointer-events-none" : ""}`}
          onSubmit={handleSubmit}
        >
          {/* Basic Information */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
              <CardDescription className="text-white/70">
                Provide the fundamental details about your research project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white/80">
                    Project Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Anti-Aging Compound Research"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white/80">
                    Research Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-fuchsia-500 focus:ring-fuchsia-500/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      <SelectItem value="longevity">Longevity</SelectItem>
                      <SelectItem value="oncology">Oncology</SelectItem>
                      <SelectItem value="neuroscience">Neuroscience</SelectItem>
                      <SelectItem value="microbiome">Microbiome</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nft-contract" className="text-white/80">
                    NFT Contract Address
                  </Label>
                  <Input
                    id="nft-contract"
                    placeholder="0x..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                    value={nftContract}
                    onChange={e => setNftContract(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-id" className="text-white/80">
                    Token ID
                  </Label>
                  <Input
                    id="token-id"
                    placeholder="e.g., 1"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                    value={tokenId}
                    onChange={e => setTokenId(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/80">
                  Project Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your research objectives, methodology, and expected outcomes..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 min-h-[120px] focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token-symbol" className="text-white/80">
                    Token Symbol
                  </Label>
                  <Input
                    id="token-symbol"
                    placeholder="e.g., $LONGEVITY"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                    value={tokenSymbol}
                    onChange={e => setTokenSymbol(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-supply" className="text-white/80">
                    Total Token Supply
                  </Label>
                  <Input
                    id="total-supply"
                    placeholder="e.g., 1,000,000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                    value={totalSupply}
                    onChange={e => setTotalSupply(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funding & Milestones */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white">Funding & Research Milestones</CardTitle>
              <CardDescription className="text-white/70">
                Define your research phases and funding requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total-funding" className="text-white/80">
                    Total Funding Target
                  </Label>
                  <Input
                    id="total-funding"
                    placeholder="e.g., $750,000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                    value={totalFunding}
                    onChange={e => setTotalFunding(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial-price" className="text-white/80">
                    Initial Token Price
                  </Label>
                  <Input
                    id="initial-price"
                    placeholder="e.g., $0.75"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                    value={initialPrice}
                    onChange={e => setInitialPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-white/80">Research Milestones</Label>
                  <Button
                    type="button"
                    onClick={addMilestone}
                    size="sm"
                    className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>

                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 border border-white/10 bg-white/5 rounded-xl space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-medium">Milestone {index + 1}</h4>
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          size="sm"
                          variant="outline"
                          className="border-red-400 text-red-400 hover:bg-red-400/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Milestone title"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                        value={milestone.title}
                        onChange={e => handleMilestoneChange(index, "title", e.target.value)}
                      />
                      <Input
                        placeholder="Funding amount"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                        value={milestone.funding}
                        onChange={e => handleMilestoneChange(index, "funding", e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Milestone description and success criteria"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                      value={milestone.description}
                      onChange={e => handleMilestoneChange(index, "description", e.target.value)}
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* IP & Legal */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white">IP Asset Configuration</CardTitle>
              <CardDescription className="text-white/70">
                Configure your intellectual property settings on Story Protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license-type" className="text-white/80">
                    License Type
                  </Label>
                  <Select value={licenseType} onValueChange={setLicenseType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-fuchsia-500 focus:ring-fuchsia-500/20">
                      <SelectValue placeholder="Select license" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      <SelectItem value="commercial">Commercial Use</SelectItem>
                      <SelectItem value="non-commercial">Non-Commercial</SelectItem>
                      <SelectItem value="open-source">Open Source</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="royalty-rate" className="text-white/80">
                    Royalty Rate (%)
                  </Label>
                  <Input
                    id="royalty-rate"
                    placeholder="e.g., 15"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-fuchsia-500 focus:ring-fuchsia-500/20"
                    value={royaltyRate}
                    onChange={e => setRoyaltyRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents" className="text-white/80">
                  Research Documents
                </Label>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="border-2 border-dashed border-white/20 hover:border-fuchsia-400/50 rounded-xl p-6 text-center transition-all duration-300"
                >
                  <Upload className="h-8 w-8 text-fuchsia-400 mx-auto mb-2" />
                  <p className="text-white/70 mb-2">Upload research papers, protocols, and supporting documents</p>
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white"
                  >
                    Choose Files
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex justify-end space-x-4"
          >
            <Button
              type="button"
              variant="outline"
              className="border-white/20 text-white/80 hover:bg-white/5"
              disabled={!isConnected}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white shadow-lg shadow-fuchsia-700/20"
              disabled={!isConnected || loading}
            >
              {loading ? "Creating..." : "Create IP Asset & Launch Project"}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  )
}
