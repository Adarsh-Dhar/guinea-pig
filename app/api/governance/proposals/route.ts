import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET: List proposals (optionally by projectId)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
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

// POST: Create a new proposal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId, title, description, status, endsAt } = body
    const proposal = await prisma.proposal.create({
      data: {
        projectId,
        title,
        description,
        status,
        endsAt: new Date(endsAt),
      },
    })
    return NextResponse.json({ proposal }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create proposal', details: (error as any)?.message }, { status: 500 })
  }
} 