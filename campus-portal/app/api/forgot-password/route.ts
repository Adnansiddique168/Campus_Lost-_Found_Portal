export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: rawEmail } = body;
    const email = rawEmail?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let user: any = await prisma.student.findFirst({ where: { email } });
    let role = 'student';
    if (!user) {
        user = await prisma.admin.findFirst({ where: { email } });
        role = 'admin';
    }

    if (!user) {
      return NextResponse.json({ error: "No account found with that email address" }, { status: 404 });
    }

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save to DB
    if (role === 'student') {
        await prisma.student.update({ where: { email }, data: { resetToken, resetTokenExpiry } });
    } else {
        await prisma.admin.update({ where: { email }, data: { resetToken, resetTokenExpiry } });
    }

    // Derive base URL for the link
    const url = new URL(request.url);
    const domain = `${url.protocol}//${url.host}`;
    const resetLink = `${domain}/reset-password?token=${resetToken}`;

    const emailResult = await sendEmail({
        to: email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Please click the following link to reset your password: ${resetLink}\n\nIf you did not request this, please ignore this email.`,
        html: `<p>You requested a password reset. Please click the following link to reset your password:</p><p><a href="${resetLink}">Reset Password Link</a></p><p>If you did not request this, please ignore this email.</p>`,
    });

    if (emailResult.previewUrl) {
        return NextResponse.json({ message: "Mock email sent.", resetLink }, { status: 200 });
    }

    return NextResponse.json({ message: "Password reset instructions sent successfully." }, { status: 200 });

  } catch (error) {
    console.error("Forgot password request failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
