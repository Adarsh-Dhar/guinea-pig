import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET: Return a single experiment/project by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        milestones: true,
        licenses: true,
        documents: true,
      },
    })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project', details: (error as any)?.message }, { status: 500 })
  }
}

// PATCH: Update a single experiment/project by ID (stub)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // Implement update logic as needed
  return NextResponse.json({ message: 'PATCH not implemented' }, { status: 501 })
}

// DELETE: Delete a single experiment/project by ID (stub)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Implement delete logic as needed
  return NextResponse.json({ message: 'DELETE not implemented' }, { status: 501 })
}
