import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    const reviews = await prisma.review.findMany({
      where: { projectId },
      include: { votes: true, reviewer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews', details: (error as any)?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, reviewerId, content, rating } = await req.json();
    if (!projectId || !reviewerId || !content || !rating)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    // Ensure reviewer exists
    let user = await prisma.user.findUnique({ where: { address: reviewerId } });
    if (!user) {
      user = await prisma.user.create({ data: { address: reviewerId } });
    }
    const review = await prisma.review.create({
      data: {
        projectId,
        reviewerId: user.id,
        content,
        rating,
        status: "pending",
      },
    });
    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit review', details: (error as any)?.message }, { status: 500 });
  }
} 