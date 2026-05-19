export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail');

    let requests;
    if (userEmail) {
      requests = await prisma.cctvRequest.findMany({
        where: { userEmail }
      });
    } else {
      // Admin sees all
      requests = await prisma.cctvRequest.findMany({});
    }

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userEmail, location, date, timeRange, reason } = body;

    const request = await prisma.cctvRequest.create({
      data: {
        userEmail,
        location,
        date,
        timeRange,
        reason,
        status: 'Pending',
      }
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, scheduledSlot } = body;

    const updatedRequest = await prisma.cctvRequest.update({
      where: { id: Number(id) },
      data: {
        status: status,
        scheduledSlot: scheduledSlot || null,
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

