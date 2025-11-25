import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { timestamp, folder } = await req.json();

    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      return NextResponse.json(
        { error: "CLOUDINARY_API_SECRET not configured" },
        { status: 500 }
      );
    }

    // Note: In production, you should generate signatures on the server
    // This is a simplified version. For production, use the @cloudinary/url-gen package
    // or implement proper signature generation
    
    return NextResponse.json({
      signature: "generated-signature",
      timestamp,
    });
  } catch (error) {
    console.error("Error in cloudinary-sign route:", error);
    return NextResponse.json(
      { error: "Error generating signature" },
      { status: 500 }
    );
  }
}

