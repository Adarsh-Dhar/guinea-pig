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
    console.log("req")
  try {
    const body = await req.json()
    const {
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
      creatorAddress,
      ipfsMetadataHash,
      nftMetadataHash,
      milestones = [],
      licenses = [],
      documents = [],
    } = body
    console.log("body", body)
    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        tokenSymbol,
        status: "PENDING", // Add default status
        currentFunding: "0", // Add initial funding
        tokenPrice: initialPrice, // Map initialPrice to tokenPrice
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
    console.log("project", project)
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create experiment', details: (error as any)?.message }, { status: 500 })
  }
}
