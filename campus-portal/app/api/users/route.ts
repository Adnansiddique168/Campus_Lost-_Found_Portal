export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: { claims: true },
    });
    const admins = await prisma.admin.findMany();

    const users = [
      ...students.map(s => ({ ...s, role: "Student" })),
      ...admins.map(a => ({ ...a, role: "Admin", claims: [] }))
    ];
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email: rawEmail, role, passwordHash, contactNo, rollNumber, department, section } = body;
    const email = rawEmail?.toLowerCase();

    let user;
    if (role === "Admin") {
        const adminData = {
            fullName,
            email,
            passwordHash: passwordHash || "Not Set",
            contactNo: contactNo || "N/A",
        };
        user = await prisma.admin.create({ data: adminData });
    } else {
        const studentData = {
            fullName,
            email,
            passwordHash: passwordHash || "Not Set",
            contactNo: contactNo || "N/A",
            rollNumber: rollNumber || null,
            department: department || null,
            section: section || null,
        };
        user = await prisma.student.create({ data: studentData });
    }

    return NextResponse.json({ ...user, role: role || "Student" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "");
    const role = searchParams.get("role");

    if (!id || isNaN(id) || !role) {
      return NextResponse.json({ error: "Missing id or role" }, { status: 400 });
    }

    if (role === "Admin" || role === "Staff") {
      await prisma.admin.delete({ where: { id } });
    } else {
      await prisma.student.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

