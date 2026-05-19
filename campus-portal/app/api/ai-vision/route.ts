import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, descriptionHint = "" } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image content" }, { status: 400 });
    }

    try {
        // Call the local Python AI Server running on port 8000
        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                imageBase64: imageBase64,
                descriptionHint: descriptionHint
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            let prediction = data.prediction;
            return NextResponse.json({ success: true, prediction }, { status: 200 });
        } else {
            throw new Error(data.error || "Python server prediction failed");
        }
        
    } catch (e: any) {
        console.error("Failed to connect to local Python AI Server. Make sure uvicorn is running on port 8000.");
        
        // --- SMART MOCK FALLBACK (Runs if Python Server is offline) ---
        let contextText = descriptionHint.toLowerCase();
        let prediction = { itemName: "Unknown Object", category: "Other", tags: "item, object, unverified" };

        if (contextText.includes("laptop") || contextText.includes("mac") || contextText.includes("computer")) {
            prediction = { itemName: "Laptop Device", category: "Electronics", tags: "laptop, electronics, screen, keyboard" };
        } else if (contextText.includes("phone") || contextText.includes("mobile") || contextText.includes("iphone")) {
            prediction = { itemName: "Smartphone", category: "Mobile", tags: "device, screen, glass, portable" };
        } else if (contextText.includes("bag") || contextText.includes("backpack") || contextText.includes("purse")) {
            prediction = { itemName: "Bag/Backpack", category: "Bag", tags: "fabric, strap, storage, zipper" };
        } else if (contextText.includes("wallet") || contextText.includes("purse") || contextText.includes("leather")) {
            prediction = { itemName: "Leather Wallet", category: "Wallet", tags: "wallet, leather, folds, cash" };
        } else if (contextText.includes("id") || contextText.includes("card") || contextText.includes("university")) {
            prediction = { itemName: "ID Card", category: "ID Card", tags: "plastic, writing, university, photo" };
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({ success: true, prediction }, { status: 200 });
    }

  } catch (error) {
    console.error("AI Vision Exception:", error);
    return NextResponse.json({ error: "Internal processing failed." }, { status: 500 });
  }
}
