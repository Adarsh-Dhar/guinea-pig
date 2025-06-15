import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET: List all investments for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userAddress = searchParams.get('userAddress')
  try {
    const user = await prisma.user.findUnique({ where: { address: userAddress || '' } })
    if (!user) return NextResponse.json({ investments: [] })
    const investments = await prisma.investment.findMany({
      where: { userId: user.id },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ investments })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch investments' }, { status: 500 })
  }
}

// POST: Create a new investment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userAddress, projectId, amount, tokens } = body
    let user = await prisma.user.findUnique({ where: { address: userAddress } })
    if (!user) {
      user = await prisma.user.create({ data: { address: userAddress } })
    }
    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        projectId,
        amount: new Prisma.Decimal(amount).toString(),
        tokens: new Prisma.Decimal(tokens).toString(),
      },
    })
    // Fetch the project to get currentFunding
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    const currentFunding = new Prisma.Decimal(project?.currentFunding || '0')
    const addAmount = new Prisma.Decimal(amount)
    await prisma.project.update({
      where: { id: projectId },
      data: {
        currentFunding: currentFunding.plus(addAmount).toString(),
      },
    })
    const updatedProject = await prisma.project.findUnique({ where: { id: projectId } })
    // console.log("Updated currentFunding:", updatedProject?.currentFunding)
    return NextResponse.json({ investment }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create investment', details: (error as any)?.message }, { status: 500 })
  }
} 