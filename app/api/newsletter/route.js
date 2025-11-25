import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Newsletter from "@/models/Newsletter";

// GET - List all newsletters
export async function GET(req) {
  await connectMongo();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = {};
    if (status) {
      query.status = status;
    }

    const newsletters = await Newsletter.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ newsletters });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching newsletters" },
      { status: 500 }
    );
  }
}

// Helper function for server components
export async function getNewsletters() {
  await connectMongo();
  try {
    const newsletters = await Newsletter.find({})
      .sort({ createdAt: -1 })
      .limit(50);
    return JSON.parse(JSON.stringify(newsletters));
  } catch (error) {
    console.error("Error in getNewsletters:", error);
    return [];
  }
}

// POST - Create a new newsletter
export async function POST(req) {
  await connectMongo();

  try {
    const body = await req.json();

    const newsletter = await Newsletter.create({
      title: body.title,
      date: body.date || new Date(),
      status: body.status || "draft",
      content: {
        summary: body.content?.summary || "",
        articles: body.content?.articles || [],
      },
    });

    return NextResponse.json({ newsletter });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating newsletter" },
      { status: 500 }
    );
  }
}

