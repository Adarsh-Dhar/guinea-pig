import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { publicClient } from '@/lib/config'
import { erc20Abi } from 'viem'

const prisma = new PrismaClient()

// POST: Cast a vote
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { proposalId, userAddress, choice } = body
    let user = await prisma.user.findUnique({ where: { address: userAddress } })
    if (!user) {
      user = await prisma.user.create({ data: { address: userAddress } })
    }
    // Fetch proposal and project/royalty token
    const proposal = await prisma.proposal.findUnique({ where: { id: proposalId }, include: { project: { include: { royaltyToken: true } } } })
    if (!proposal || !proposal.project?.royaltyToken?.address) {
      return NextResponse.json({ error: 'No royalty token found for this proposal/project' }, { status: 400 })
    }
    // Check voting period
    if (proposal.endsAt < new Date()) {
      return NextResponse.json({ error: 'Voting period has ended' }, { status: 403 })
    }
    // Prevent double voting
    const existingVote = await prisma.vote.findFirst({ where: { proposalId, userId: user.id } })
    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted on this proposal' }, { status: 403 })
    }
    // Get decimals
    const decimals: number = await publicClient.readContract({
      address: proposal.project.royaltyToken.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'decimals',
    }) as number
    // Get user's token balance
    const balance: bigint = await publicClient.readContract({
      address: proposal.project.royaltyToken.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
    }) as bigint
    // Must have at least 1 token
    function bigIntPow(base: bigint, exp: number): bigint {
      let result = BigInt(1);
      for (let i = 0; i < exp; i++) result *= base;
      return result;
    }
    const threshold = bigIntPow(BigInt(10), decimals) // 1 token, using decimals
    if (balance < threshold) {
      return NextResponse.json({ error: 'You need at least 1 token to vote' }, { status: 403 })
    }
    // Store the user's balance as weight (requires schema update to add weight field to Vote)
    const vote = await prisma.vote.create({
      data: {
        proposalId,
        userId: user.id,
        choice,
        weight: balance.toString(),
      },
    })
    return NextResponse.json({ vote }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cast vote', details: (error as any)?.message }, { status: 500 })
  }
} 