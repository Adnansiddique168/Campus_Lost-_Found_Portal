import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");
    const otherEmail = searchParams.get("otherEmail");

    if (!userEmail || !otherEmail) {
      return NextResponse.json({ error: "Missing emails" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderEmail: userEmail, receiverEmail: otherEmail },
          { senderEmail: otherEmail, receiverEmail: userEmail }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark messages received by current user as read
    const unreadReceivedIds = messages
      .filter(m => m.receiverEmail === userEmail && !m.read)
      .map(m => m.id);

    if (unreadReceivedIds.length > 0) {
      await prisma.message.updateMany({
        where: { id: { in: unreadReceivedIds } },
        data: { read: true }
      });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { senderEmail, receiverEmail, content } = await request.json();

    if (!senderEmail || !receiverEmail || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderEmail,
        receiverEmail,
        content
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
