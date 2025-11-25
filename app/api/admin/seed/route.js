import { NextResponse } from "next/server";
import seedDatabase from "@/libs/newsletterSeeder";

// This route seeds the database with mock data
// ONLY USE IN DEVELOPMENT!
export async function POST(req) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    await seedDatabase();
    return NextResponse.json({
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error seeding database" },
      { status: 500 }
    );
  }
}

