export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: rawEmail, password } = body;
    const email = rawEmail?.toLowerCase();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Try finding in Student table
    let user: any = await prisma.student.findFirst({ where: { email } });
    let role = "Student";

    // If not found in Student table, check Admin table
    if (!user) {
      user = await prisma.admin.findFirst({ where: { email } });
      role = "Admin";
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Compare directly
    if (user.passwordHash !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Success response
    return NextResponse.json({
         message: "Login successful",
         user: {
             id: user.id,
             fullName: user.fullName,
             email: user.email,
             role: role
         } 
    }, { status: 200 });

  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

