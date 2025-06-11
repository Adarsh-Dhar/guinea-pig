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
import ConnectWalletButton from "@/components/connect-wallet-button"
import { useAccount } from "wagmi"
import { client, networkInfo } from "@/lib/config"
import { createHash } from "crypto"
import { createCommercialRemixTerms, SPGNFTContractAddress, RoyaltyPolicyLAP, getRoyaltyVaultAddress } from "@/lib/story-utils"
import { uploadJSONToIPFS } from "@/lib/uploadToIpfs"
import { Address } from "viem"
import Image from "next/image"

export default function CreateProjectPage() {
  const [milestones, setMilestones] = useState([{ title: "", description: "", funding: "" }])
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [totalSupply] = useState("100")
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
  const [formError, setFormError] = useState<string | null>(null)

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
    setFormError(null)
    // Client-side validation for funding < 100 * price
    const price = parseFloat(initialPrice)
    const funding = parseFloat(totalFunding)
    if (isNaN(price) || isNaN(funding)) {
      setFormError("Please enter valid numbers for price and funding.")
      setLoading(false)
      return
    }
    if (funding >= 100 * price) {
      setFormError("Total funding must be less than 100 × royalty token price.")
      setLoading(false)
      return
    }
    if (funding / price !== Math.floor(funding / price)) {
      setFormError("Total funding divided by royalty token price must be an integer (no decimals allowed).")
      setLoading(false)
      return
    }
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
            contributionPercent: 80,
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

      // 4. Persist to backend DB
      try {
        const dbRes = await fetch("/api/experiments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            category,
            tokenSymbol,
            totalSupply,
            totalFunding,
            initialPrice,
            licenseType,
            royaltyRate,
            nftContract,
            tokenId,
            creatorAddress: address,
            ipfsMetadataHash: `0x${createHash("sha256").update(safeStringify(ipMetadata)).digest("hex")}`,
            nftMetadataHash: `0x${createHash("sha256").update(safeStringify(nftMetadata)).digest("hex")}`,
            milestones,
            ipId: response.ipId,
          }),
        })
        console.log("db response", dbRes)
        if (!dbRes.ok) {
          const err = await dbRes.json()
          setError(`DB Error: ${err.error || "Unknown error"}`)
        } else {
          const dbValue = await dbRes.json()
          console.log("DB value after POST:", dbValue)
        }
      } catch (dbErr: any) {
        setError(`DB Error: ${dbErr?.message || dbErr}`)
      }

      // Fetch and log the updated project from the backend
      const projectRes = await fetch(`/api/experiments/${response.ipId}`)
      const projectData = await projectRes.json()
      console.log("Updated project from DB:", projectData)
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

      // Fetch and log the royalty vault address after minting
      try {
        console.log("result", result)
        const vaultAddress = await getRoyaltyVaultAddress(result.ipId as Address)
        console.log("Royalty Vault Address (ERC-20) after mint:", vaultAddress)
        console.log("result?.ipId", result?.ipId)
        if (vaultAddress && vaultAddress !== "0x0000000000000000000000000000000000000000" && result?.ipId) {
          // POST to backend
          const res = await fetch(`/api/experiments/${result.ipId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: vaultAddress }),
          })
          const data = await res.json()
          console.log("Royalty token saved to backend:", data)
          // Fetch and log the updated project from the backend
          const projectRes = await fetch(`/api/experiments/${result.ipId}`)
          const projectData = await projectRes.json()
          console.log("Updated project from DB:", projectData)
        }
      } catch (vaultErr) {
        console.error("Failed to fetch or save royalty vault address after mint:", vaultErr)
      }
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
    <div className="min-h-screen bg-[#fdf6f1] overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="border-b border-[#e5ded7] bg-[#fdf6f1] sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-[#a68c7c]" />
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
          <h1 className="text-4xl font-bold mb-4 text-[#3d2c1e] font-serif">Create Research Project</h1>
          <p className="text-[#a68c7c] text-lg">Register your research as an IP Asset and start fundraising</p>
        </motion.div>

        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-8"
          >
            <Card className="bg-[#f3ede7] border border-[#e5ded7] rounded-xl p-6">
              <div className="flex items-center justify-center space-x-4">
                <Sparkles className="h-8 w-8 text-[#a68c7c]" />
                <div>
                  <h3 className="text-[#3d2c1e] text-lg font-bold mb-2">Connect Your Wallet</h3>
                  <p className="text-[#a68c7c] mb-4">You need to connect your wallet to create a research project</p>
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
          <Card className="bg-[#f3ede7] border border-[#e5ded7] rounded-xl">
            <CardHeader>
              <CardTitle className="text-[#3d2c1e]">Basic Information</CardTitle>
              <CardDescription className="text-[#a68c7c]">
                Provide the fundamental details about your research project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#3d2c1e]">
                    Project Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Anti-Aging Compound Research"
                    className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[#3d2c1e]">
                    Research Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fdf6f1] border-[#e5ded7] text-[#3d2c1e]">
                      <SelectItem value="longevity">Longevity</SelectItem>
                      <SelectItem value="oncology">Oncology</SelectItem>
                      <SelectItem value="neuroscience">Neuroscience</SelectItem>
                      <SelectItem value="microbiome">Microbiome</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nft-contract" className="text-[#3d2c1e]">
                    NFT Contract Address
                  </Label>
                  <Input
                    id="nft-contract"
                    placeholder="0x..."
                    className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                    value={nftContract}
                    onChange={e => setNftContract(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-id" className="text-[#3d2c1e]">
                    Token ID
                  </Label>
                  <Input
                    id="token-id"
                    placeholder="e.g., 1"
                    className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                    value={tokenId}
                    onChange={e => setTokenId(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#3d2c1e]">
                  Project Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your research objectives, methodology, and expected outcomes..."
                  className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] min-h-[120px] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token-symbol" className="text-[#3d2c1e]">
                    Token Symbol
                  </Label>
                  <Input
                    id="token-symbol"
                    placeholder="e.g., $LONGEVITY"
                    className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                    value={tokenSymbol}
                    onChange={e => setTokenSymbol(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-supply" className="text-[#3d2c1e]">
                    Royalty Token Supply
                  </Label>
                  <Input
                    id="total-supply"
                    value={totalSupply}
                    readOnly
                    className="bg-[#f3ede7] border-[#e5ded7] text-[#a68c7c] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20 cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funding & Milestones */}
          <Card className="bg-[#f3ede7] border border-[#e5ded7] rounded-xl">
            <CardHeader>
              <CardTitle className="text-[#3d2c1e]">Funding & Research Milestones</CardTitle>
              <CardDescription className="text-[#a68c7c]">
                Define your research phases and funding requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initial-price" className="text-[#3d2c1e]">
                    Royalty Token Price (per token)
                  </Label>
                  <Input
                    id="initial-price"
                    placeholder="e.g., 1000"
                    className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                    value={initialPrice}
                    onChange={e => setInitialPrice(e.target.value)}
                    type="number"
                    min="0"
                    step="any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-funding" className="text-[#3d2c1e]">
                    Total Funding Target
                  </Label>
                  <Input
                    id="total-funding"
                    placeholder="e.g., 75000"
                    className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                    value={totalFunding}
                    onChange={e => setTotalFunding(e.target.value)}
                    type="number"
                    min="0"
                    step="any"
                  />
                  <div className="text-xs text-[#a68c7c] mt-1">
                    You can raise up to <span className="font-semibold text-[#a68c7c]">{initialPrice ? 100 * parseFloat(initialPrice) : '...'}</span> (100 × token price)
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[#3d2c1e]">Research Milestones</Label>
                  <Button
                    type="button"
                    onClick={addMilestone}
                    size="sm"
                    className="bg-[#a68c7c] hover:bg-[#8c715c] text-white"
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
                    className="p-4 border border-[#e5ded7] bg-[#fdf6f1] rounded-xl space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-[#3d2c1e] font-medium">Milestone {index + 1}</h4>
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          size="sm"
                          variant="outline"
                          className="border-[#e5ded7] text-[#a68c7c] hover:bg-[#e5ded7]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Milestone title"
                        className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                        value={milestone.title}
                        onChange={e => handleMilestoneChange(index, "title", e.target.value)}
                      />
                      <Input
                        placeholder="Funding amount"
                        className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                        value={milestone.funding}
                        onChange={e => handleMilestoneChange(index, "funding", e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Milestone description and success criteria"
                      className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                      value={milestone.description}
                      onChange={e => handleMilestoneChange(index, "description", e.target.value)}
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* IP & Legal */}
          <Card className="bg-[#f3ede7] border border-[#e5ded7] rounded-xl">
            <CardHeader>
              <CardTitle className="text-[#3d2c1e]">IP Asset Configuration</CardTitle>
              <CardDescription className="text-[#a68c7c]">
                Configure your intellectual property settings on Story Protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license-type" className="text-[#3d2c1e]">
                    License Type
                  </Label>
                  <Select value={licenseType} onValueChange={setLicenseType}>
                    <SelectTrigger className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20">
                      <SelectValue placeholder="Select license" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fdf6f1] border-[#e5ded7] text-[#3d2c1e]">
                      <SelectItem value="commercial">Commercial Use</SelectItem>
                      <SelectItem value="non-commercial">Non-Commercial</SelectItem>
                      <SelectItem value="open-source">Open Source</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="royalty-rate" className="text-[#3d2c1e]">
                    Royalty Rate (%)
                  </Label>
                  <Input
                    id="royalty-rate"
                    placeholder="e.g., 15"
                    className="bg-[#f3ede7] border-[#e5ded7] text-[#3d2c1e] placeholder-[#a68c7c] focus:border-[#a68c7c] focus:ring-[#a68c7c]/20"
                    value={royaltyRate}
                    onChange={e => setRoyaltyRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents" className="text-[#3d2c1e]">
                  Research Documents
                </Label>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="border-2 border-dashed border-[#e5ded7] hover:border-[#a68c7c] rounded-xl p-6 text-center transition-all duration-300"
                >
                  <Upload className="h-8 w-8 text-[#a68c7c] mx-auto mb-2" />
                  <p className="text-[#a68c7c] mb-2">Upload research papers, protocols, and supporting documents</p>
                  <Button
                    type="button"
                    className="bg-[#a68c7c] hover:bg-[#8c715c] text-white"
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
              className="border-[#e5ded7] text-[#3d2c1e] hover:bg-[#e5ded7]"
              disabled={!isConnected}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              className="bg-[#a68c7c] hover:bg-[#8c715c] text-white shadow-md"
              disabled={!isConnected || loading}
            >
              {loading ? "Creating..." : "Create IP Asset & Launch Project"}
            </Button>
          </motion.div>
          {result && (
            <div className="mt-8 p-4 border border-[#e5ded7] bg-[#f3ede7] rounded-xl text-[#3d2c1e]">
              <h3 className="font-bold text-[#a68c7c] mb-2">Research Project Registered!</h3>
              <div className="text-sm mb-2">
                <span className="font-medium">IP Asset ID:</span>
                <span className="ml-2 break-words">{result.ipId}</span>
              </div>
              <a
                href={result.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a68c7c] underline text-xs"
              >
                View IP Details on Explorer
              </a>
              {/* License Attachment UI */}
              <div className="mt-6">
                <div className="mb-2 text-[#3d2c1e] font-semibold">Attach License Terms</div>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  {licenseTemplates.map(t => (
                    <button
                      key={t.key}
                      type="button"
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 focus:outline-none ${selectedLicense === t.key ? 'bg-[#a68c7c] text-white border-[#a68c7c]' : 'bg-[#f3ede7] text-[#a68c7c] border-[#e5ded7] hover:border-[#a68c7c]'}`}
                      onClick={() => setSelectedLicense(t.key)}
                      disabled={attachLoading}
                    >
                      <div>{t.label}</div>
                      <div className="text-[10px] text-[#a68c7c]">{t.desc}</div>
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  className="bg-[#a68c7c] hover:bg-[#8c715c] text-white"
                  onClick={handleAttachTerms}
                  disabled={attachLoading}
                >
                  {attachLoading ? "Attaching..." : "Attach Selected License Terms"}
                </Button>
                {attachResult && (
                  <div className="mt-4 p-3 border border-[#e5ded7] bg-[#fdf6f1] rounded-xl text-[#3d2c1e]">
                    <div className="font-semibold mb-1">License Terms Attached</div>
                    <div className="text-xs mb-1">License Terms ID: {attachResult.licenseTermsId}</div>
                    <div className="text-xs mb-1">Tx Hash: {attachResult.txHash}</div>
                    <div className="text-xs mb-1">Status: {attachResult.success ? "Success" : "Already attached"}</div>
                    {/* Mint License Token UI */}
                    <Button
                      type="button"
                      className="mt-3 bg-[#a68c7c] hover:bg-[#8c715c] text-white"
                      onClick={handleMintLicenseToken}
                      disabled={mintLoading || !address}
                      variant="outline"
                    >
                      {mintLoading ? "Minting License Token..." : "Mint License Token to My Wallet"}
                    </Button>
                    {mintResult && (
                      <div className="mt-3 p-2 border border-[#e5ded7] bg-[#f3ede7] rounded text-[#3d2c1e]">
                        <div className="font-semibold">License Token Minted</div>
                        <div className="text-xs">Tx Hash: {mintResult.txHash}</div>
                        <div className="text-xs">Token IDs: {safeStringify(mintResult.licenseTokenIds)}</div>
                        <a
                          href={`${networkInfo.blockExplorer}/tx/${mintResult.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#a68c7c] underline text-xs mt-1 inline-block"
                        >
                          View Transaction on Explorer
                        </a>
                      </div>
                    )}
                    {mintError && (
                      <div className="mt-2 text-xs text-[#a68c7c]">{mintError}</div>
                    )}
                  </div>
                )}
                {attachError && (
                  <div className="mt-2 text-xs text-[#a68c7c]">{attachError}</div>
                )}
              </div>
            </div>
          )}
          {error && (
            <div className="mt-8 p-4 border border-[#e5ded7] bg-[#f3ede7] rounded-xl text-[#a68c7c]">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}
          {formError && (
            <div className="mt-8 p-4 border border-[#e5ded7] bg-[#f3ede7] rounded-xl text-[#a68c7c]">
              <span className="font-semibold">Error:</span> {formError}
            </div>
          )}
        </motion.form>
      </div>
    </div>
  )
}