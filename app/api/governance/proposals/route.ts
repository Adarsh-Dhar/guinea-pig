import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { publicClient } from '@/lib/config'
import { erc20Abi } from 'viem'

const prisma = new PrismaClient()

// GET: List proposals (optionally by projectId)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const proposalId = searchParams.get('proposalId')
  if (!proposalId) {
    // fallback to list all proposals (existing logic)
    const projectId = searchParams.get('projectId')
    try {
      const proposals = await prisma.proposal.findMany({
        where: projectId ? { projectId } : undefined,
        include: { votes: true },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ proposals })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
    }
  }
  // Get proposal details and votes
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { votes: true },
    })
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }
    // Tally votes
    let votesFor = BigInt(0)
    let votesAgainst = BigInt(0)
    for (const v of proposal.votes) {
      if (v.choice === 'for') votesFor += BigInt(v.weight)
      if (v.choice === 'against') votesAgainst += BigInt(v.weight)
    }
    // Helper for BigInt exponentiation (for compatibility)
    function bigIntPow(base: bigint, exp: number): bigint {
      let result = BigInt(1);
      for (let i = 0; i < exp; i++) result *= base;
      return result;
    }
    // Fallback to 18 decimals if no votes
    const decimals = proposal.votes[0] ? votesFor.toString().length - 1 : 18
    const quorum = BigInt('20') * bigIntPow(BigInt('10'), decimals)
    const quorumMet = votesFor + votesAgainst >= quorum
    return NextResponse.json({ proposal, votesFor: votesFor.toString(), votesAgainst: votesAgainst.toString(), quorum: quorum.toString(), quorumMet })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch proposal', details: (error as any)?.message }, { status: 500 })
  }
}

// POST: Create a new proposal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId, title, description, creatorAddress } = body
    // Fetch the royalty token address for this project
    const project = await prisma.project.findUnique({ where: { id: projectId }, include: { royaltyToken: true } })
    if (!project || !project.royaltyToken?.address) {
      return NextResponse.json({ error: 'No royalty token found for this project' }, { status: 400 })
    }
    // Query the token decimals
    const decimals: number = await publicClient.readContract({
      address: project.royaltyToken.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'decimals',
    }) as number
    // Query the user's token balance
    const balance: bigint = await publicClient.readContract({
      address: project.royaltyToken.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [creatorAddress as `0x${string}`],
    }) as bigint
    // Helper for BigInt exponentiation (for compatibility)
    function bigIntPow(base: bigint, exp: number): bigint {
      let result = BigInt(1);
      for (let i = 0; i < exp; i++) result *= base;
      return result;
    }
    const threshold = BigInt(5) * bigIntPow(BigInt(10), decimals) // 5 tokens, using decimals
    if (balance < threshold) {
      return NextResponse.json({ error: 'You need at least 5 tokens to create a proposal' }, { status: 403 })
    }
    const endsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    const proposal = await prisma.proposal.create({
      data: {
        projectId,
        title,
        description,
        status: 'active',
        endsAt,
      },
    })
    return NextResponse.json({ proposal }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create proposal', details: (error as any)?.message }, { status: 500 })
  }
} 