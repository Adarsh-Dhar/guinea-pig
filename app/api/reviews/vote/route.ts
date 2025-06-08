import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { reviewId, voterId, value } = await req.json();
  if (!reviewId || !voterId || ![1, -1].includes(value))
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  // Prevent double voting
  const existing = await prisma.reviewVote.findFirst({ where: { reviewId, voterId } });
  if (existing) return NextResponse.json({ error: "Already voted" }, { status: 400 });
  const vote = await prisma.reviewVote.create({ data: { reviewId, voterId, value } });
  return NextResponse.json({ vote });
} 