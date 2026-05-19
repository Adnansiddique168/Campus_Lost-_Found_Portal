import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the official AI Smart Assistant for the "Campus Lost & Found Portal" of Lahore Garrison University (LGU). 
Your job is to help students navigate the portal, understand the rules, and guide them on how to report or claim items.
Here are the rules of the portal:
1. If a student lost an item, they should click "I Lost Something" on the dashboard and fill out the details.
2. If a student found an item, they should click "I Found Something". They MUST upload an image of the found item.
3. The portal has an AI Vision scanner! When reporting a found item, students can click "Scan with AI" and the portal will automatically detect the object category, and if it's an ID Card, it will extract the Roll Number and automatically notify the owner!
4. To claim an item, users go to the "Recent Activity" table, find the item, and click "Claim". They must provide proof of ownership.
5. Reward System: When a user successfully returns a found item to its owner, they get points! These points can be redeemed for Cafeteria Discounts, Printing Credits, or Top Helper Recognition.

Keep your answers concise, friendly, and in Roman Urdu / English mixed (as university students in Pakistan speak). Be very helpful.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Prepare payload
    const payload = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      throw new Error(data.error?.message || "Failed to generate response");
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";

    return NextResponse.json({ reply: replyText }, { status: 200 });

  } catch (error: any) {
    console.error("Chatbot Error:", error);
    return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 });
  }
}
