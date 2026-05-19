import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawClaims = await prisma.claim.findMany({
      include: {
        student: true,
        foundItem: true,
      },
    });

    // Map relationships back to 'user' and 'item' so frontend doesn't break
    const claims = rawClaims.map(claim => ({
        ...claim,
        user: { ...claim.student, role: "Student" },
        item: { ...claim.foundItem, itemType: "Found" },
        student: undefined,
        foundItem: undefined
    }));

    return NextResponse.json(claims);
  } catch (error) {
    console.error("Failed to fetch claims:", error);
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itemId } = body;

    const claim = await prisma.claim.create({
      data: {
        studentId: Number(userId),
        foundItemId: Number(itemId),
      },
    });
    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error("Failed to create claim:", error);
    return NextResponse.json({ error: "Failed to create claim" }, { status: 500 });
  }
}
