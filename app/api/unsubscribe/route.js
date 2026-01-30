import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";

export const dynamic = "force-dynamic";

/**
 * GET /api/unsubscribe
 * Handle unsubscribe requests
 */
export async function GET(req) {
  await connectMongo();

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Find the subscriber
    const subscriber = await Lead.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }

    // Deactivate the subscriber and record unsubscribe date
    await Lead.findByIdAndUpdate(subscriber._id, {
      isActive: false,
      unsubscribedAt: new Date(),
    });

    console.log(`✅ Unsubscribed: ${email}`);

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });

  } catch (error) {
    console.error("❌ Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Error processing unsubscribe request" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/unsubscribe
 * Handle unsubscribe requests via form submission
 */
export async function POST(req) {
  await connectMongo();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find the subscriber
    const subscriber = await Lead.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }

    // Deactivate the subscriber and record unsubscribe date
    await Lead.findByIdAndUpdate(subscriber._id, {
      isActive: false,
      unsubscribedAt: new Date(),
    });

    console.log(`✅ Unsubscribed: ${email}`);

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });

  } catch (error) {
    console.error("❌ Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Error processing unsubscribe request" },
      { status: 500 }
    );
  }
}
