import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET: Return a single experiment/project by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // console.log('GET /api/experiments/[id] called with id:', id)
  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id },
          { ipId: id }
        ]
      },
      include: {
        milestones: true,
        licenses: true,
        documents: true,
        investors: true,
        proposals: { include: { votes: true } },
        activities: true,
        royaltyToken: true,
        creator: true,
      },
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error in GET /api/experiments/[id]:', error)
    return NextResponse.json({ error: 'Failed to fetch project', details: (error as any)?.message, stack: (error as any)?.stack }, { status: 500 })
  }
}

// PATCH: Update a single experiment/project by ID (stub)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Implement update logic as needed
  return NextResponse.json({ message: 'PATCH not implemented' }, { status: 501 })
}

// DELETE: Delete a single experiment/project by ID (stub)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Implement delete logic as needed
  return NextResponse.json({ message: 'DELETE not implemented' }, { status: 501 })
}

// POST: Create a royalty token for a project
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { address } = await req.json()
    if (!address) {
      return NextResponse.json({ error: 'Royalty token address required' }, { status: 400 })
    }
    // Find the project by id or ipId
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id },
          { ipId: id }
        ]
      }
    })
    if (!project || !project.ipId) {
      return NextResponse.json({ error: 'Project not found or missing ipId' }, { status: 404 })
    }
    // Check if already exists by ipId
    const existing = await prisma.royaltyToken.findUnique({ where: { ipId: project.ipId! } })
    if (existing) {
      return NextResponse.json({ error: 'Royalty token already exists for this project' }, { status: 400 })
    }
    const royaltyToken = await prisma.royaltyToken.create({
      data: {
        ipId: project.ipId!,
        address,
      },
    })
    return NextResponse.json({ royaltyToken }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create royalty token', details: (error as any)?.message }, { status: 500 })
  }
}
