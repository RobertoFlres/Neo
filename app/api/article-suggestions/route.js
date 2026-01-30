import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import ArticleSuggestion from "@/models/ArticleSuggestion";

// GET - List suggestions (admin only or user's own suggestions)
export async function GET(req) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userOnly = searchParams.get("userOnly") === "true";

    const userEmail = session.user?.email?.toLowerCase();
    const ADMIN_EMAILS = [
      "rflores@startupchihuahua.com",
      "rflores@startupchihuahua.org",
    ];
    const isAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail);

    let query = {};
    
    if (userOnly && !isAdmin) {
      // Regular users can only see their own suggestions
      query["submittedBy.email"] = userEmail;
    }

    if (status) {
      query.status = status;
    }

    const suggestions = await ArticleSuggestion.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(); // Use lean() to get plain JavaScript objects

    // Ensure IDs are properly serialized
    const serializedSuggestions = suggestions.map(s => ({
      ...s,
      _id: s._id?.toString(),
      id: s._id?.toString(), // Also include as 'id' for consistency
    }));

    return NextResponse.json({ suggestions: serializedSuggestions });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Error fetching suggestions" },
      { status: 500 }
    );
  }
}

// POST - Create a new suggestion
export async function POST(req) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, url, description, summary, image, titleColor, source } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Validate URL only if provided
    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }

    const suggestion = await ArticleSuggestion.create({
      title,
      url: url || undefined, // Only include if provided
      description: description || summary?.replace(/<[^>]*>/g, "").substring(0, 200), // Extract plain text from HTML if no description
      summary: summary || description, // HTML content
      image: image || undefined,
      titleColor: titleColor || "#2b3e81", // Keep for backward compatibility
      source: source || "Contribuidor",
      submittedBy: {
        email: session.user?.email,
        name: session.user?.name,
        userId: session.user?.id,
      },
    });

    return NextResponse.json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error("Error creating suggestion:", error);
    return NextResponse.json(
      { error: error.message || "Error creating suggestion" },
      { status: 500 }
    );
  }
}
