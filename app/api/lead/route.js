import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";

export const dynamic = "force-dynamic";

// This route is used to store the leads that are generated from the landing page.
// The API call is initiated by <ButtonLead /> component
// Duplicate emails just return 200 OK
export async function POST(req) {
  await connectMongo();

  const body = await req.json();

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const email = body.email.toLowerCase().trim();
    const lead = await Lead.findOne({ email });

    if (!lead) {
      // Create new subscriber
      await Lead.create({
        email,
        isActive: true,
        source: "landing_page",
      });
      console.log(`✅ New subscriber: ${email}`);
    } else if (!lead.isActive) {
      // Reactivate if previously unsubscribed
      await Lead.findByIdAndUpdate(lead._id, {
        isActive: true,
        unsubscribedAt: null,
      });
      console.log(`✅ Reactivated subscriber: ${email}`);
    } else {
      console.log(`ℹ️ Already subscribed: ${email}`);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("❌ Error creating lead:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
