import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import ArticleSuggestion from "@/models/ArticleSuggestion";

const ADMIN_EMAIL = "roberto24flores@gmail.com";

// GET - Get a single suggestion
export async function GET(req, { params }) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = params;
    console.log("🔍 GET /api/article-suggestions/[id] - Requesting ID:", id);
    
    const userEmail = session.user?.email?.toLowerCase();
    const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
    
    console.log("👤 User:", userEmail, "Admin:", isAdmin);

    const suggestion = await ArticleSuggestion.findById(id);

    if (!suggestion) {
      console.error("❌ Suggestion not found for ID:", id);
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    console.log("📄 Found suggestion:", suggestion.title);
    console.log("📧 Submitted by:", suggestion.submittedBy?.email);
    console.log("🔒 Status:", suggestion.status);

    // Users can only view their own suggestions unless they're admin
    if (!isAdmin) {
      const suggestionEmail = suggestion.submittedBy?.email?.toLowerCase();
      if (suggestionEmail !== userEmail) {
        console.error("❌ Unauthorized: User email doesn't match");
        console.error("   User:", userEmail);
        console.error("   Suggestion owner:", suggestionEmail);
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    console.log("✅ Returning suggestion");
    
    // Serialize the suggestion to ensure _id is properly converted
    const serializedSuggestion = {
      ...suggestion.toObject ? suggestion.toObject() : suggestion,
      _id: suggestion._id?.toString(),
      id: suggestion._id?.toString(),
    };
    
    return NextResponse.json({
      success: true,
      suggestion: serializedSuggestion,
    });
  } catch (error) {
    console.error("❌ Error fetching suggestion:", error);
    return NextResponse.json(
      { error: error.message || "Error fetching suggestion" },
      { status: 500 }
    );
  }
}

// PUT - Update suggestion (admin can change status, contributors can edit their own pending articles)
export async function PUT(req, { params }) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userEmail = session.user?.email?.toLowerCase();
  const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

  try {
    const { id } = params;
    console.log("🔄 PUT /api/article-suggestions/[id] - ID:", id);
    
    const body = await req.json();
    const { status, notes, title, url, description, summary, image, titleColor, source } = body;
    
    console.log("📝 Request body:", { status, notes, hasTitle: !!title });

    const suggestion = await ArticleSuggestion.findById(id);

    if (!suggestion) {
      console.error("❌ Suggestion not found for ID:", id);
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    console.log("📄 Found suggestion:", suggestion.title);
    console.log("👤 User:", userEmail, "Admin:", isAdmin);

    // Admin can change status
    if (status && isAdmin) {
      console.log("🔧 Admin updating status to:", status);
      
      if (!["pending", "approved", "rejected"].includes(status)) {
        console.error("❌ Invalid status:", status);
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }

      const updated = await ArticleSuggestion.findByIdAndUpdate(
        id,
        {
          status,
          notes,
          reviewedBy: {
            email: session.user?.email,
            name: session.user?.name,
          },
          reviewedAt: new Date(),
        },
        { new: true }
      );

      console.log("✅ Suggestion updated successfully:", updated.title, "Status:", updated.status);
      
      // Serialize the updated suggestion to ensure _id is properly converted
      const serializedSuggestion = {
        ...updated.toObject ? updated.toObject() : updated,
        _id: updated._id?.toString(),
        id: updated._id?.toString(),
      };
      
      return NextResponse.json({
        success: true,
        suggestion: serializedSuggestion,
      });
    }

    // If admin sent status update but we got here, something went wrong
    if (status && isAdmin) {
      console.error("❌ Admin status update failed - should have been handled above");
      return NextResponse.json(
        { error: "Failed to update status" },
        { status: 500 }
      );
    }

    // Contributors can edit their own pending articles
    if (!isAdmin) {
      if (suggestion.submittedBy.email?.toLowerCase() !== userEmail) {
        console.error("❌ Contributor trying to edit someone else's article");
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (suggestion.status !== "pending") {
        console.error("❌ Contributor trying to edit non-pending article");
        return NextResponse.json(
          { error: "Can only edit pending suggestions" },
          { status: 403 }
        );
      }

      // Update article fields
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (url !== undefined) {
        if (url === "" || url === null) {
          // Allow removing URL
          updateData.url = undefined;
        } else {
          try {
            new URL(url);
            updateData.url = url;
          } catch {
            return NextResponse.json(
              { error: "Invalid URL format" },
              { status: 400 }
            );
          }
        }
      }
      if (description !== undefined) updateData.description = description;
      if (summary !== undefined) updateData.summary = summary;
      if (image !== undefined) {
        // If image is empty string, set to undefined to remove it
        updateData.image = image === "" ? undefined : image;
      }
      if (titleColor !== undefined) updateData.titleColor = titleColor;
      if (source !== undefined) updateData.source = source;

      // Auto-extract description from summary if not provided
      if (summary && !description) {
        updateData.description = summary.replace(/<[^>]*>/g, "").substring(0, 200);
      }

      const updated = await ArticleSuggestion.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      // Serialize the updated suggestion to ensure _id is properly converted
      const serializedSuggestion = {
        ...updated.toObject ? updated.toObject() : updated,
        _id: updated._id?.toString(),
        id: updated._id?.toString(),
      };

      return NextResponse.json({
        success: true,
        suggestion: serializedSuggestion,
      });
    }

    // If we get here, the request doesn't match any valid operation
    console.error("❌ No valid operation matched:", { isAdmin, hasStatus: !!status, hasTitle: !!title });
    return NextResponse.json(
      { error: "Invalid operation" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Error updating suggestion:", error);
    return NextResponse.json(
      { error: error.message || "Error updating suggestion" },
      { status: 500 }
    );
  }
}

// DELETE - Delete suggestion (admin only, or user's own pending suggestions)
export async function DELETE(req, { params }) {
  await connectMongo();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = params;
    const userEmail = session.user?.email?.toLowerCase();
    const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

    const suggestion = await ArticleSuggestion.findById(id);

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    // Users can only delete their own pending suggestions
    if (!isAdmin && suggestion.submittedBy.email !== userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Users can't delete approved/rejected suggestions
    if (!isAdmin && suggestion.status !== "pending") {
      return NextResponse.json(
        { error: "Cannot delete reviewed suggestions" },
        { status: 403 }
      );
    }

    await ArticleSuggestion.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting suggestion:", error);
    return NextResponse.json(
      { error: "Error deleting suggestion" },
      { status: 500 }
    );
  }
}
