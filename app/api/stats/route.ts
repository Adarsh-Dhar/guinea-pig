import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET: Portfolio stats for a user address
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userAddress = searchParams.get('userAddress')
  if (!userAddress) return NextResponse.json({ error: 'userAddress required' }, { status: 400 })
  try {
    const user = await prisma.user.findUnique({ where: { address: userAddress } })
    if (!user) return NextResponse.json({ stats: {} })
    const [investments, projects, votes] = await Promise.all([
      prisma.investment.findMany({ where: { userId: user.id } }),
      prisma.project.findMany({ where: { creatorAddress: userAddress } }),
      prisma.vote.findMany({ where: { userId: user.id } }),
    ])
    // Calculate stats
    const totalPortfolioValue = investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
    const activeProjects = projects.filter(p => p.status === 'Active').length
    const totalInvestments = investments.length
    const pendingVotes = votes.length // You may want to filter by open proposals
    return NextResponse.json({
      stats: {
        totalPortfolioValue,
        activeProjects,
        totalInvestments,
        pendingVotes,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
} 