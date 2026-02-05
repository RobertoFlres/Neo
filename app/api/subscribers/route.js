import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";
import Group from "@/models/Group";

export const dynamic = "force-dynamic";

/**
 * POST /api/subscribers
 * Add a new subscriber to the newsletter
 */
export async function POST(req) {
  await connectMongo();

  try {
    const { email, groups } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Convert group IDs to ObjectIds
    const groupObjectIds = (groups || [])
      .filter(g => g && mongoose.Types.ObjectId.isValid(g))
      .map(g => new mongoose.Types.ObjectId(g));

    // Check if email already exists
    const existingSubscriber = await Lead.findOne({ email: email.toLowerCase() });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: "Email already subscribed" },
          { status: 400 }
        );
      } else {
        // Reactivate existing subscriber with new groups
        await Lead.updateOne(
          { _id: existingSubscriber._id },
          { $set: { isActive: true, groups: groupObjectIds.length > 0 ? groupObjectIds : existingSubscriber.groups } }
        );
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
      groups: groupObjectIds,
    });

    console.log(`✅ New subscriber added: ${email} with groups:`, groupObjectIds);

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
 * PUT /api/subscribers
 * Update a subscriber's groups
 */
export async function PUT(req) {
  await connectMongo();

  try {
    // Ensure Group model is registered
    await Group.findOne().limit(1).catch(() => null);

    const { id, groups } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID del suscriptor es requerido" },
        { status: 400 }
      );
    }

    // Validate subscriber ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`❌ Invalid subscriber ID: ${id}`);
      return NextResponse.json(
        { error: "ID del suscriptor inválido" },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    const groupObjectIds = (groups || [])
      .filter(g => g && mongoose.Types.ObjectId.isValid(g))
      .map(g => new mongoose.Types.ObjectId(g));

    console.log(`📝 Received groups:`, groups);
    console.log(`📝 Converted to ObjectIds:`, groupObjectIds);
    console.log(`📝 Updating subscriber ID:`, id);

    // Use updateOne directly for more reliable update
    const updateResult = await Lead.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { groups: groupObjectIds } }
    );

    console.log(`📝 Update result:`, updateResult);

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: "Suscriptor no encontrado" },
        { status: 404 }
      );
    }

    // Fetch the updated subscriber with populated groups
    const updatedSubscriber = await Lead.findById(id).populate('groups', 'name color');
    console.log(`📝 Subscriber after update:`, updatedSubscriber?.email, 'groups:', updatedSubscriber?.groups);

    const populatedGroups = (updatedSubscriber?.groups || [])
      .filter(g => g != null)
      .map(g => ({
        id: g._id,
        name: g.name,
        color: g.color,
      }));

    return NextResponse.json({
      success: true,
      message: "Suscriptor actualizado exitosamente",
      subscriber: {
        id: updatedSubscriber._id,
        email: updatedSubscriber.email,
        groups: populatedGroups,
      },
    });

  } catch (error) {
    console.error("❌ Error updating subscriber:", error);
    return NextResponse.json(
      { error: "Error al actualizar suscriptor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscribers
 * Get subscribers. Use ?all=true to include inactive, ?group=ID to filter by group
 */
export async function GET(req) {
  await connectMongo();

  try {
    // Ensure Group model is registered for populate
    await Group.findOne().limit(1).catch(() => null);

    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get('all') === 'true';
    const groupId = searchParams.get('group');

    const query = showAll ? {} : { isActive: true };

    // Filter by group if specified
    if (groupId) {
      query.groups = groupId;
    }

    let subscribers;
    try {
      subscribers = await Lead.find(query).populate('groups', 'name color');
    } catch (populateError) {
      // If populate fails, get without populate
      console.log("Populate failed, fetching without groups:", populateError.message);
      subscribers = await Lead.find(query);
    }

    return NextResponse.json({
      success: true,
      count: subscribers.length,
      activeCount: subscribers.filter(s => s.isActive).length,
      inactiveCount: subscribers.filter(s => !s.isActive).length,
      subscribers: subscribers.map(sub => {
        // Handle groups safely - they might be ObjectIds or populated objects
        let groupsData = [];
        if (sub.groups && Array.isArray(sub.groups)) {
          groupsData = sub.groups
            .filter(g => g != null)
            .map(g => {
              // If populated (has name property), use it
              if (g.name) {
                return {
                  id: g._id,
                  name: g.name,
                  color: g.color || '#6366f1',
                };
              }
              // If just ObjectId, return minimal info
              return {
                id: g,
                name: 'Grupo',
                color: '#6366f1',
              };
            });
        }

        return {
          id: sub._id,
          email: sub.email,
          isActive: sub.isActive,
          source: sub.source,
          groups: groupsData,
          createdAt: sub.createdAt,
        };
      }),
    });

  } catch (error) {
    console.error("❌ Error fetching subscribers:", error);
    return NextResponse.json(
      { error: "Error fetching subscribers" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscribers
 * Delete a subscriber by ID or email
 */
export async function DELETE(req) {
  await connectMongo();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json(
        { error: "Se requiere ID o email del suscriptor" },
        { status: 400 }
      );
    }

    const query = id ? { _id: id } : { email: email.toLowerCase() };
    const subscriber = await Lead.findOneAndDelete(query);

    if (!subscriber) {
      return NextResponse.json(
        { error: "Suscriptor no encontrado" },
        { status: 404 }
      );
    }

    console.log(`🗑️ Subscriber deleted: ${subscriber.email}`);

    return NextResponse.json({
      success: true,
      message: "Suscriptor eliminado exitosamente",
      deleted: {
        id: subscriber._id,
        email: subscriber.email,
      },
    });

  } catch (error) {
    console.error("❌ Error deleting subscriber:", error);
    return NextResponse.json(
      { error: "Error al eliminar suscriptor" },
      { status: 500 }
    );
  }
}
