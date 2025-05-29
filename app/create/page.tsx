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
import { client, networkInfo } from "@/lib/config"
import { createHash } from "crypto"
import { createCommercialRemixTerms, SPGNFTContractAddress, RoyaltyPolicyLAP } from "@/lib/story-utils"
import { uploadJSONToIPFS } from "@/lib/uploadToIpfs"
import { Address } from "viem"

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
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [attachLoading, setAttachLoading] = useState(false)
  const [attachResult, setAttachResult] = useState<any>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
  const [mintLoading, setMintLoading] = useState(false)
  const [mintResult, setMintResult] = useState<any>(null)
  const [mintError, setMintError] = useState<string | null>(null)
  const [selectedLicense, setSelectedLicense] = useState<string>("open-academic")

  // License templates (can be expanded)
  const licenseTemplates = [
    {
      key: "open-academic",
      label: "Open Academic",
      desc: "Free for research, 10% commercial rev share",
      terms: {
        commercialUse: true,
        commercialRevShare: 10,
        derivativesAllowed: true,
        derivativesAttribution: true,
        additionalParams: {
          researchUseAllowed: true,
          dataSharingRequirement: "Open access after 24 months",
          derivativeRoyaltyShare: 5,
        },
      },
    },
    {
      key: "pharma-ready",
      label: "Pharma Ready",
      desc: "20% rev share + patent protection",
      terms: {
        commercialUse: true,
        commercialRevShare: 20,
        derivativesAllowed: true,
        derivativesAttribution: true,
        additionalParams: {
          researchUseAllowed: false,
          dataSharingRequirement: "Restricted",
          derivativeRoyaltyShare: 10,
        },
      },
    },
    {
      key: "dao-governance",
      label: "DAO Governance",
      desc: "Community votes on commercialization",
      terms: {
        commercialUse: true,
        commercialRevShare: 15,
        derivativesAllowed: true,
        derivativesAttribution: true,
        additionalParams: {
          researchUseAllowed: true,
          dataSharingRequirement: "DAO decides",
          derivativeRoyaltyShare: 7,
        },
      },
    },
  ]

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
    setResult(null)
    setError(null)
    try {
      // 1. Compose metadata
      const projectName = title
      const ipMetadata = client.ipAsset.generateIpMetadata({
        title: projectName,
        description: description + "\n\n---\nMilestones:\n" + milestones.map((m, i) => `Milestone ${i+1}: ${m.title}\nFunding: ${m.funding}\n${m.description}`).join("\n\n"),
        createdAt: Math.floor(Date.now() / 1000).toString(),
        creators: [
          {
            name: address || "" as `0x${string}`,
            address: address || "" as `0x${string}`,
            contributionPercent: 100,
          },
        ],
        image: "https://ipfs.io/ipfs/QmSamy4zqP91X42k6wS7kLJQVzuYJuW2EN94couPaq82A8",
        imageHash: "" as `0x${string}`,
        mediaUrl: "https://ipfs.io/ipfs/QmSamy4zqP91X42k6wS7kLJQVzuYJuW2EN94couPaq82A8",
        mediaHash: "" as `0x${string}`,
        mediaType: "image/png",
        attributes: [
          { key: "Category", value: category },
          { key: "Token Symbol", value: tokenSymbol },
          { key: "Total Supply", value: totalSupply },
          { key: "Total Funding", value: totalFunding },
          { key: "Initial Price", value: initialPrice },
          { key: "License Type", value: licenseType },
          { key: "Royalty Rate", value: royaltyRate },
        ],
      })
      const nftMetadata = {
        name: `${projectName} - IP Rights`,
        description: `NFT representing IP rights to ${projectName} and future royalties`,
        image: "https://ipfs.io/ipfs/QmSamy4zqP91X42k6wS7kLJQVzuYJuW2EN94couPaq82A8",
        external_url: "https://pump.science/projects/" + projectName.replace(/\s+/g, "-").toLowerCase(),
        attributes: [
          { key: "Funding Target", value: totalFunding },
          { key: "Initial Token Price", value: initialPrice },
          ...milestones.map((m, i) => ({ key: `Milestone ${i+1}`, value: m.title })),
          { key: "Royalty Rate", value: royaltyRate },
        ],
      }
      // 2. Upload to IPFS
      const safeStringify = (obj: any) => JSON.stringify(obj, (key, value) => typeof value === "bigint" ? value.toString() : value)
      const [ipIpfsHash, nftIpfsHash] = await Promise.all([
        uploadJSONToIPFS(ipMetadata),
        uploadJSONToIPFS(nftMetadata)
      ])
      // 3. Register IP Asset
      const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: SPGNFTContractAddress,
        licenseTermsData: [
          {
            terms: createCommercialRemixTerms({
              defaultMintingFee: Number(initialPrice) || 0.5,
              commercialRevShare: Number(royaltyRate) || 15,
            }),
          },
        ],
        ipMetadata: {
          ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
          ipMetadataHash: `0x${createHash("sha256").update(safeStringify(ipMetadata)).digest("hex")}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
          nftMetadataHash: `0x${createHash("sha256").update(safeStringify(nftMetadata)).digest("hex")}`,
        },
        txOptions: { waitForTransaction: true },
      })
      setResult({
        txHash: response.txHash,
        ipId: response.ipId,
        licenseTermsIds: response.licenseTermsIds,
        explorer: `${networkInfo.protocolExplorer}/ipa/${response.ipId}`,
      })
    } catch (err: any) {
      setError(err?.message || "Unknown error during IP registration")
    } finally {
      setLoading(false)
    }
  }

  const handleAttachTerms = async () => {
    if (!result?.ipId) return
    setAttachLoading(true)
    setAttachResult(null)
    setAttachError(null)
    try {
      // Find selected license template
      const template = licenseTemplates.find(t => t.key === selectedLicense)
      if (!template) throw new Error("License template not found")
      // Compose license terms (expand as needed for your protocol)
      const licenseTerms = {
        defaultMintingFee: BigInt(0),
        currency: "0x1514000000000000000000000000000000000000" as Address, // $WIP
        royaltyPolicy: template.terms.commercialUse
          ? RoyaltyPolicyLAP
          : "0x0000000000000000000000000000000000000000" as `0x${string}`,
        transferable: true,
        expiration: BigInt(0),
        commercialUse: template.terms.commercialUse,
        commercialAttribution: true,
        commercializerChecker: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        commercializerCheckerData: "0x00" as `0x${string}`,
        commercialRevShare: template.terms.commercialRevShare,
        commercialRevCeiling: BigInt(0),
        derivativesAllowed: template.terms.derivativesAllowed,
        derivativesAttribution: template.terms.derivativesAttribution,
        derivativesApproval: false,
        derivativesReciprocal: true,
        derivativeRevCeiling: BigInt(0),
        uri: "",
        // You can add additionalParams to the uri or a custom field if your backend supports it
      }
      // 1. Register the license terms
      const regRes = await client.license.registerPILTerms({
        ...licenseTerms,
        txOptions: { waitForTransaction: true },
      })
      // 2. Attach the license terms to the IP
      const attachRes = await client.license.attachLicenseTerms({
        licenseTermsId: String(regRes.licenseTermsId),
        ipId: result.ipId,
        txOptions: { waitForTransaction: true },
      })
      setAttachResult({
        txHash: attachRes.txHash,
        licenseTermsId: regRes.licenseTermsId,
        success: attachRes.success,
      })
    } catch (err: any) {
      setAttachError(err?.message || "Unknown error attaching license terms")
    } finally {
      setAttachLoading(false)
    }
  }

  const handleMintLicenseToken = async () => {
    if (!result?.ipId || !attachResult?.licenseTermsId || !address) return
    setMintLoading(true)
    setMintResult(null)
    setMintError(null)
    try {
      // Use the connected user's address as the receiver
      const receiver = address
      const response = await client.license.mintLicenseTokens({
        licenseTermsId: String(attachResult.licenseTermsId),
        licensorIpId: result.ipId,
        receiver,
        amount: 1,
        maxMintingFee: BigInt(0),
        maxRevenueShare: 100,
        txOptions: { waitForTransaction: true },
      })
      setMintResult({
        txHash: response.txHash,
        licenseTokenIds: response.licenseTokenIds,
      })
    } catch (err: any) {
      setMintError(err?.message || "Unknown error minting license token")
    } finally {
      setMintLoading(false)
    }
  }

  function safeStringify(obj: any) {
    return JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
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
          {result && (
            <div className="mt-8 p-4 border border-green-400/30 bg-green-900/20 rounded-xl text-green-200">
              <h3 className="font-bold text-green-300 mb-2">Research Project Registered!</h3>
              <div className="text-sm mb-2">
                <span className="font-medium">IP Asset ID:</span>
                <span className="ml-2 break-words">{result.ipId}</span>
              </div>
              <a
                href={result.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline text-xs"
              >
                View IP Details on Explorer
              </a>
              {/* License Attachment UI */}
              <div className="mt-6">
                <div className="mb-2 text-white/80 font-semibold">Attach License Terms</div>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  {licenseTemplates.map(t => (
                    <button
                      key={t.key}
                      type="button"
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 focus:outline-none ${selectedLicense === t.key ? 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white border-fuchsia-400' : 'bg-white/10 text-white/70 border-white/20 hover:border-fuchsia-400'}`}
                      onClick={() => setSelectedLicense(t.key)}
                      disabled={attachLoading}
                    >
                      <div>{t.label}</div>
                      <div className="text-[10px] text-white/60">{t.desc}</div>
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white"
                  onClick={handleAttachTerms}
                  disabled={attachLoading}
                >
                  {attachLoading ? "Attaching..." : "Attach Selected License Terms"}
                </Button>
                {attachResult && (
                  <div className="mt-4 p-3 border border-blue-400/30 bg-blue-900/20 rounded-xl text-blue-200">
                    <div className="font-semibold mb-1">License Terms Attached</div>
                    <div className="text-xs mb-1">License Terms ID: {attachResult.licenseTermsId}</div>
                    <div className="text-xs mb-1">Tx Hash: {attachResult.txHash}</div>
                    <div className="text-xs mb-1">Status: {attachResult.success ? "Success" : "Already attached"}</div>
                    {/* Mint License Token UI */}
                    <Button
                      type="button"
                      className="mt-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white"
                      onClick={handleMintLicenseToken}
                      disabled={mintLoading || !address}
                      variant="outline"
                    >
                      {mintLoading ? "Minting License Token..." : "Mint License Token to My Wallet"}
                    </Button>
                    {mintResult && (
                      <div className="mt-3 p-2 border border-purple-400/30 bg-purple-900/20 rounded text-purple-200">
                        <div className="font-semibold">License Token Minted</div>
                        <div className="text-xs">Tx Hash: {mintResult.txHash}</div>
                        <div className="text-xs">Token IDs: {safeStringify(mintResult.licenseTokenIds)}</div>
                        <a
                          href={`${networkInfo.blockExplorer}/tx/${mintResult.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline text-xs mt-1 inline-block"
                        >
                          View Transaction on Explorer
                        </a>
                      </div>
                    )}
                    {mintError && (
                      <div className="mt-2 text-xs text-red-300">{mintError}</div>
                    )}
                  </div>
                )}
                {attachError && (
                  <div className="mt-2 text-xs text-red-300">{attachError}</div>
                )}
              </div>
            </div>
          )}
          {error && (
            <div className="mt-8 p-4 border border-red-400/30 bg-red-900/20 rounded-xl text-red-200">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}
        </motion.form>
      </div>
    </div>
  )
}
