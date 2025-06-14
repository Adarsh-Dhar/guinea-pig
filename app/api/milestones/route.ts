import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
  try {
    const { milestoneId, claimed } = await req.json();
    if (typeof milestoneId !== 'string' || typeof claimed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { claimed },
    });
    return NextResponse.json({ milestone: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update milestone claim status', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
