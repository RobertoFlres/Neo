import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Newsletter from "@/models/Newsletter";

// GET - Get a specific newsletter
export async function GET(req, context) {
  await connectMongo();

  try {
    const { id } = context.params;
    const newsletter = await Newsletter.findById(id);

    if (!newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ newsletter });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching newsletter" },
      { status: 500 }
    );
  }
}

// PUT - Update a newsletter
export async function PUT(req, context) {
  await connectMongo();

  try {
    const { id } = context.params;
    const body = await req.json();

    console.log("📝 Updating newsletter:", id);
    console.log("📝 Content:", JSON.stringify(body.content, null, 2));

    const newsletter = await Newsletter.findByIdAndUpdate(
      id,
      {
        title: body.title,
        status: body.status,
        content: body.content,
        sentCount: body.sentCount,
        sentAt: body.sentAt,
      },
      { new: true }
    );

    if (!newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 }
      );
    }

    console.log("✅ Newsletter updated successfully");
    return NextResponse.json({ newsletter });
  } catch (error) {
    console.error("❌ Error updating newsletter:", error);
    return NextResponse.json(
      { error: "Error updating newsletter" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a newsletter
export async function DELETE(req, context) {
  await connectMongo();

  try {
    const { id } = context.params;
    console.log("🗑️ Attempting to delete newsletter:", id);
    const newsletter = await Newsletter.findByIdAndDelete(id);
    console.log("📋 Newsletter deleted:", newsletter ? "Yes" : "No");

    if (!newsletter) {
      return NextResponse.json(
        { success: false, error: "Newsletter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Newsletter deleted successfully" 
    });
  } catch (error) {
    console.error("❌ Error deleting newsletter:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Error deleting newsletter" 
      },
      { status: 500 }
    );
  }
}

// Helper function for server components
export async function getNewsletterById(id) {
  await connectMongo();
  try {
    const newsletter = await Newsletter.findById(id);
    if (!newsletter) return null;
    return JSON.parse(JSON.stringify(newsletter));
  } catch (error) {
    console.error("Error in getNewsletterById:", error);
    return null;
  }
}

