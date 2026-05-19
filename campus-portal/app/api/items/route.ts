import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lostItems = await prisma.lostItem.findMany();
    const foundItems = await prisma.foundItem.findMany({
      include: { claims: true },
    });

    const items = [
      ...lostItems.map(i => ({ ...i, itemType: "Lost", claims: [] })),
      ...foundItems.map(i => ({ ...i, itemType: "Found" }))
    ];
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, itemType, status, description, category, location, date, image, userEmail, aiTags } = body;

    const data = {
      title,
      description: description || null,
      category: category || null,
      location: location || null,
      date: date || null,
      image: image || null,
      userEmail: userEmail || null,
      status: status || "Searching",
      aiTags: aiTags || null,
    };

    let item;
    if (itemType === "Lost") {
      item = await prisma.lostItem.create({ data });
    } else {
      item = await prisma.foundItem.create({ data });
    }

    let matchedStudentEmail = null;
    if (itemType === "Found" && body.extractedRollNumber) {
        // Find all students (we assume a small DB for FYP) to do case-insensitive match since SQLite Prisma doesn't support mode: 'insensitive' well
        const students = await prisma.student.findMany();
        const matchedStudent = students.find(s => 
           s.rollNumber && 
           s.rollNumber.toLowerCase().replace(/[^a-z0-9]/g, '') === body.extractedRollNumber.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        
        if (matchedStudent) {
            matchedStudentEmail = matchedStudent.email;
            
            // Send email notification!
            await sendEmail({
              to: matchedStudentEmail,
              subject: "Good News! Your ID Card was found",
              text: `Hello ${matchedStudent.fullName},\n\nSomeone just found an ID Card with the roll number ${matchedStudent.rollNumber}.\n\nPlease log in to the Campus Lost & Found Portal to view the details and claim it.\n\nBest,\nCampus Portal Team`,
              html: `<p>Hello <b>${matchedStudent.fullName}</b>,</p><p>Someone just found an ID Card with the roll number <b>${matchedStudent.rollNumber}</b>.</p><p>Please log in to the Campus Lost & Found Portal to view the details and claim it.</p><p>Best,<br>Campus Portal Team</p>`
            });
        }
    }

    return NextResponse.json({ ...item, itemType: itemType || "Lost", matchedStudentEmail }, { status: 201 });
  } catch (error) {
    console.error("Failed to create item:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "");
    const itemType = searchParams.get("itemType");

    if (!id || isNaN(id) || !itemType) {
      return NextResponse.json({ error: "Missing id or itemType" }, { status: 400 });
    }

    if (itemType === "Lost") {
      await prisma.lostItem.delete({ where: { id } });
    } else {
      await prisma.foundItem.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: "Item deleted" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
