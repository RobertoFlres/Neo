import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";

export const dynamic = "force-dynamic";

/**
 * POST /api/subscribers
 * Add a new subscriber to the newsletter
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

    // Check if email already exists
    const existingSubscriber = await Lead.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: "Email already subscribed" },
          { status: 400 }
        );
      } else {
        // Reactivate existing subscriber
        await Lead.findByIdAndUpdate(existingSubscriber._id, {
          isActive: true,
        });
        return NextResponse.json({
          success: true,
          message: "Email reactivated successfully",
        });
      }
    }

    // Create new subscriber
    const newSubscriber = await Lead.create({
      email: email.toLowerCase(),
      isActive: true,
      source: "manual_add",
    });

    console.log(`✅ New subscriber added: ${email}`);

    return NextResponse.json({
      success: true,
      message: "Subscriber added successfully",
      subscriber: newSubscriber,
    });

  } catch (error) {
    console.error("❌ Error adding subscriber:", error);
    return NextResponse.json(
      { error: "Error adding subscriber" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscribers
 * Get subscribers. Use ?all=true to include inactive subscribers
 */
export async function GET(req) {
  await connectMongo();

  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get('all') === 'true';

    const query = showAll ? {} : { isActive: true };
    const subscribers = await Lead.find(query);

    return NextResponse.json({
      success: true,
      count: subscribers.length,
      activeCount: subscribers.filter(s => s.isActive).length,
      inactiveCount: subscribers.filter(s => !s.isActive).length,
      subscribers: subscribers.map(sub => ({
        email: sub.email,
        isActive: sub.isActive,
        source: sub.source,
        createdAt: sub.createdAt,
      })),
    });

  } catch (error) {
    console.error("❌ Error fetching subscribers:", error);
    return NextResponse.json(
      { error: "Error fetching subscribers" },
      { status: 500 }
    );
  }
}
