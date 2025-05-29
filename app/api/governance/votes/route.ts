import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

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
    const vote = await prisma.vote.create({
      data: {
        proposalId,
        userId: user.id,
        choice,
      },
    })
    return NextResponse.json({ vote }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cast vote', details: (error as any)?.message }, { status: 500 })
  }
} 