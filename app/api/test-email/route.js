export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sendEmail } from "@/libs/zeptomail";
import config from "@/config";

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    console.log("🧪 Testing email to:", email);
    console.log("🧪 Using domain:", config.domainName);
    console.log("🧪 From address:", config.mailgun.fromAdmin);
    
    await sendEmail({
      to: email,
      subject: "Test Email from neo",
      text: "This is a test email to verify Mailgun configuration.",
      html: "<h1>Test Email</h1><p>This is a test email to verify Mailgun configuration.</p>",
      replyTo: config.mailgun.supportEmail,
    });
    
    console.log("✅ Test email sent successfully");
    return NextResponse.json({ success: true, message: "Test email sent successfully" });
  } catch (error) {
    console.error("❌ Test email failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test email" },
      { status: 500 }
    );
  }
}
