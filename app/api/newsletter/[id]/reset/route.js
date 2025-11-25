import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Newsletter from "@/models/Newsletter";

/**
 * POST /api/newsletter/[id]/reset
 * Reset newsletter status to draft
 */
export async function POST(req, context) {
  await connectMongo();

  try {
    const { id } = context.params;
    
    console.log("🔄 Resetting newsletter status for ID:", id);
    
    // Reset newsletter to draft status
    const newsletter = await Newsletter.findByIdAndUpdate(
      id,
      {
        status: "draft",
        sentCount: 0,
        sentAt: null,
      },
      { new: true }
    );

    if (!newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 }
      );
    }

    console.log("✅ Newsletter reset to draft:", newsletter.title);

    return NextResponse.json({
      success: true,
      message: "Newsletter reset to draft successfully",
      newsletter: newsletter,
    });

  } catch (error) {
    console.error("❌ Error resetting newsletter:", error);
    return NextResponse.json(
      { error: "Error resetting newsletter" },
      { status: 500 }
    );
  }
}
