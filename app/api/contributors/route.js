import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Contributor from "@/models/Contributor";

// Define who can access the admin dashboard
const ADMIN_EMAILS = [
  "rflores@startupchihuahua.com",
  "rflores@startupchihuahua.org",
];

/**
 * GET /api/contributors
 * Get all contributors (admin only)
 */
export async function GET(req) {
  await connectMongo();

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session?.user?.email?.toLowerCase();
    const isAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const contributors = await Contributor.find().sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      count: contributors.length,
      contributors,
    });

  } catch (error) {
    console.error("❌ Error fetching contributors:", error);
    return NextResponse.json(
      { error: "Error fetching contributors" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contributors
 * Add a new contributor (admin only)
 */
export async function POST(req) {
  await connectMongo();

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session?.user?.email?.toLowerCase();
    const isAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if contributor already exists
    const existingContributor = await Contributor.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingContributor) {
      if (existingContributor.isActive) {
        return NextResponse.json(
          { error: "Contributor already exists" },
          { status: 400 }
        );
      } else {
        // Reactivate existing contributor
        const updatedContributor = await Contributor.findByIdAndUpdate(
          existingContributor._id,
          {
            isActive: true,
            name: name || existingContributor.name,
            addedBy: userEmail,
          },
          { new: true }
        );
        return NextResponse.json({
          success: true,
          message: "Contributor reactivated successfully",
          contributor: updatedContributor,
        });
      }
    }

    // Create new contributor
    const newContributor = await Contributor.create({
      email: email.toLowerCase(),
      name: name || "",
      isActive: true,
      addedBy: userEmail,
    });

    console.log(`✅ New contributor added: ${email}`);

    return NextResponse.json({
      success: true,
      message: "Contributor added successfully",
      contributor: newContributor,
    });

  } catch (error) {
    console.error("❌ Error adding contributor:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Contributor already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Error adding contributor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contributors
 * Delete/deactivate a contributor (admin only)
 */
export async function DELETE(req) {
  await connectMongo();

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session?.user?.email?.toLowerCase();
    const isAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Contributor ID is required" },
        { status: 400 }
      );
    }

    // Deactivate contributor instead of deleting (soft delete)
    const contributor = await Contributor.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!contributor) {
      return NextResponse.json(
        { error: "Contributor not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Contributor deactivated: ${contributor.email}`);

    return NextResponse.json({
      success: true,
      message: "Contributor deactivated successfully",
      contributor,
    });

  } catch (error) {
    console.error("❌ Error deleting contributor:", error);
    return NextResponse.json(
      { error: "Error deleting contributor" },
      { status: 500 }
    );
  }
}

