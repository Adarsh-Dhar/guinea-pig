import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET: List all projects or by user address
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const creatorAddress = searchParams.get('creatorAddress')
  try {
    const projects = await prisma.project.findMany({
      where: creatorAddress ? { creatorAddress } : undefined,
      include: {
        milestones: true,
        licenses: true,
        documents: true,
        investors: true,
        proposals: true,
        activities: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ projects })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

// POST: Create a new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { milestones = [], licenses = [], documents = [], ...rest } = body
    const project = await prisma.project.create({
      data: {
        ...rest,
        milestones: { create: milestones },
        licenses: { create: licenses },
        documents: { create: documents },
      },
      include: {
        milestones: true,
        licenses: true,
        documents: true,
      },
    })
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project', details: (error as any)?.message }, { status: 500 })
  }
}

// PATCH: Update a project by id
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'Project id required' }, { status: 400 })
    const project = await prisma.project.update({
      where: { id },
      data,
    })
    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project', details: (error as any)?.message }, { status: 500 })
  }
}

// DELETE: Delete a project by id (from query or body)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  let id = searchParams.get('id')
  if (!id) {
    try {
      const body = await req.json()
      id = body.id
    } catch {}
  }
  if (!id) return NextResponse.json({ error: 'Project id required' }, { status: 400 })
  try {
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ message: 'Project deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project', details: (error as any)?.message }, { status: 500 })
  }
} 