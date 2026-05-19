import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, pointsToAdd } = await request.json();

    if (!email || !pointsToAdd) {
      return NextResponse.json({ error: "Missing email or pointsToAdd" }, { status: 400 });
    }

    const updatedStudent = await prisma.student.update({
      where: { email },
      data: {
        points: {
          increment: pointsToAdd
        }
      }
    });

    return NextResponse.json({ success: true, points: updatedStudent.points }, { status: 200 });

  } catch (error) {
    console.error("Failed to add points:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
