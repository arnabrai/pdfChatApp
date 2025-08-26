import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function POST(request: Request) {
  try {
    const req = await request.json();
    const { id, fileName, pdfText } = req;

    if (!id || !fileName || !pdfText) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedConversation = await prisma.conversation.upsert({
      where: { id },
      update: {
        pdfName: fileName, 
        pdfText: pdfText,
      },
      create: {
        id, 
        pdfName: fileName,
        pdfText: pdfText,
        name: "Default Name", 
        messages: JSON.stringify([]), 
        userId: "defaultUserId", 
      },
    });

    return NextResponse.json({ status: "Ok", data: updatedConversation }, { status: 201 });
  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Ensure 'id' is provided
    if (!id) {
      return NextResponse.json(
        { message: "Missing required 'id' parameter" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { pdfName: true }, 
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "Ok", pdfName: conversation.pdfName }, { status: 200 });
  } catch (error) {
    console.error("Error processing GET request:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
