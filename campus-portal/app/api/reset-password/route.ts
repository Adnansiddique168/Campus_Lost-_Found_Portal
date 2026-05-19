export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    let user: any = await prisma.student.findFirst({ where: { resetToken: token } });
    let model = "student";

    if (!user) {
        user = await prisma.admin.findFirst({ where: { resetToken: token } });
        model = "admin";
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // Check expiry
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
        return NextResponse.json({ error: "Reset token has expired." }, { status: 400 });
    }

    if (model === "student") {
        await prisma.student.update({ 
            where: { id: user.id }, 
            data: { passwordHash: newPassword, resetToken: null, resetTokenExpiry: null } 
        });
    } else {
        await prisma.admin.update({ 
            where: { id: user.id }, 
            data: { passwordHash: newPassword, resetToken: null, resetTokenExpiry: null } 
        });
    }

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Password reset failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
