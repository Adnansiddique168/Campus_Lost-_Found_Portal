export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json({ error: "Missing user email" }, { status: 400 });
    }

    // Find all unread messages sent TO this user
    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverEmail: userEmail,
        read: false
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(unreadMessages);
  } catch (error) {
    console.error("Failed to fetch unread messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
