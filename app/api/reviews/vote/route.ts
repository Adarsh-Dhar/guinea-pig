import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { reviewId, voterId, value } = await req.json();
  if (!reviewId || !voterId || ![1, -1].includes(value))
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  // Ensure voter exists (by address, which is unique)
  let user = await prisma.user.findUnique({ where: { address: voterId } });
  let userId = voterId;
  if (!user) {
    user = await prisma.user.create({ data: { id: voterId, address: voterId } });
  } else {
    userId = user.id;
  }
  // Prevent double voting
  const existing = await prisma.reviewVote.findFirst({ where: { reviewId, voterId: userId } });
  if (existing) return NextResponse.json({ error: "Already voted" }, { status: 400 });
  const vote = await prisma.reviewVote.create({ data: { reviewId, voterId: userId, value } });
  return NextResponse.json({ vote });
} 