import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@/lib/generated/prisma";
const prisma = new PrismaClient();

// GET: Return all experiments (projects)
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        milestones: true,
        licenses: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ projects })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch experiments' }, { status: 500 })
  }
}

// POST: Create a new experiment (project)
export async function POST(req: NextRequest) {
    // console.log("req")
  try {
    const body = await req.json()
    const {
      title,
      description,
      category,
      tokenSymbol,
      totalFunding,
      initialPrice,
      licenseType,
      royaltyRate,
      nftContract,
      tokenId,
      creatorAddress,
      ipfsMetadataHash,
      nftMetadataHash,
      milestones = [],
      licenses = [],
      documents = [],
      ipId,
      escrowId,
    } = body
    // console.log("body", body)

    // Enforce max 100 royalty tokens and funding constraint
    const price = parseFloat(initialPrice)
    const funding = parseFloat(totalFunding)
    if (isNaN(price) || isNaN(funding)) {
      return NextResponse.json({ error: 'Invalid price or funding amount' }, { status: 400 })
    }
    if (funding >= 100 * price) {
      return NextResponse.json({ error: 'Total funding must be less than 100 × royalty token price' }, { status: 400 })
    }
    if (funding / price !== Math.floor(funding / price)) {
      return NextResponse.json({ error: 'Total funding divided by royalty token price must be an integer (no decimals allowed)' }, { status: 400 })
    }
    const totalSupply = "100" // Always 100 royalty tokens

    // Ensure the creator exists in the User table
    let creator = await prisma.user.findUnique({ where: { address: creatorAddress } });
    if (!creator) {
      creator = await prisma.user.create({ data: { address: creatorAddress } });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        tokenSymbol,
        status: "PENDING",
        currentFunding: "0",
        tokenPrice: initialPrice,
        totalSupply,
        totalFunding,
        initialPrice,
        licenseType,
        royaltyRate,
        nftContract,
        tokenId,
        creatorAddress,
        ipfsMetadataHash,
        nftMetadataHash,
        ipId,
        escrowId,
        milestones: {
          create: milestones.map((m: any) => ({
            title: m.title,
            description: m.description,
            funding: m.funding,
          })),
        },
        licenses: {
          create: licenses.map((l: any) => ({
            type: l.type,
            commercialUse: l.commercialUse,
            commercialRevShare: l.commercialRevShare,
            derivativesAllowed: l.derivativesAllowed,
            derivativesAttribution: l.derivativesAttribution,
            researchUseAllowed: l.researchUseAllowed,
            dataSharingRequirement: l.dataSharingRequirement,
            derivativeRoyaltyShare: l.derivativeRoyaltyShare,
          })),
        },
        documents: {
          create: documents.map((d: any) => ({
            url: d.url,
          })),
        },
      },
      include: {
        milestones: true,
        licenses: true,
        documents: true,
      },
    })
    // --- ADD: Create RoyaltyToken if ipId and royaltyVaultAddress are present ---
    if (ipId && body.royaltyVaultAddress) {
      // Only create if not already exists
      const existing = await prisma.royaltyToken.findUnique({ where: { ipId } })
      if (!existing) {
        await prisma.royaltyToken.create({
          data: {
            ipId,
            address: body.royaltyVaultAddress,
          },
        })
      }
    }
    // --- END ADD ---
    // console.log("project", project)
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create experiment', details: (error as any)?.message }, { status: 500 })
  }
}
