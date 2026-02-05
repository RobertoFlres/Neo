import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Group from "@/models/Group";
import Lead from "@/models/Lead";

export const dynamic = "force-dynamic";

/**
 * GET /api/groups
 * Get all groups with subscriber count
 */
export async function GET() {
  await connectMongo();

  try {
    const groups = await Group.find().sort({ name: 1 });

    // Get subscriber count for each group
    const groupsWithCount = await Promise.all(
      groups.map(async (group) => {
        const count = await Lead.countDocuments({
          groups: group._id,
          isActive: true
        });
        return {
          id: group._id,
          name: group.name,
          description: group.description,
          color: group.color,
          subscriberCount: count,
          createdAt: group.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      groups: groupsWithCount,
    });

  } catch (error) {
    console.error("❌ Error fetching groups:", error);
    return NextResponse.json(
      { error: "Error al obtener grupos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
 * Create a new group
 */
export async function POST(req) {
  await connectMongo();

  try {
    const { name, description, color } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre del grupo es requerido" },
        { status: 400 }
      );
    }

    // Check if group already exists
    const existingGroup = await Group.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "Ya existe un grupo con este nombre" },
        { status: 400 }
      );
    }

    const newGroup = await Group.create({
      name: name.trim(),
      description: description?.trim() || "",
      color: color || "#6366f1",
    });

    console.log(`✅ New group created: ${name}`);

    return NextResponse.json({
      success: true,
      message: "Grupo creado exitosamente",
      group: {
        id: newGroup._id,
        name: newGroup.name,
        description: newGroup.description,
        color: newGroup.color,
        subscriberCount: 0,
      },
    });

  } catch (error) {
    console.error("❌ Error creating group:", error);
    return NextResponse.json(
      { error: "Error al crear grupo" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/groups
 * Update a group
 */
export async function PUT(req) {
  await connectMongo();

  try {
    const { id, name, description, color } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID del grupo es requerido" },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre del grupo es requerido" },
        { status: 400 }
      );
    }

    // Check if another group has this name
    const existingGroup = await Group.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: id }
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "Ya existe otro grupo con este nombre" },
        { status: 400 }
      );
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description?.trim() || "",
        color: color || "#6366f1",
      },
      { new: true }
    );

    if (!updatedGroup) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }

    console.log(`✅ Group updated: ${name}`);

    return NextResponse.json({
      success: true,
      message: "Grupo actualizado exitosamente",
      group: {
        id: updatedGroup._id,
        name: updatedGroup.name,
        description: updatedGroup.description,
        color: updatedGroup.color,
      },
    });

  } catch (error) {
    console.error("❌ Error updating group:", error);
    return NextResponse.json(
      { error: "Error al actualizar grupo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups
 * Delete a group
 */
export async function DELETE(req) {
  await connectMongo();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "ID del grupo es requerido" },
        { status: 400 }
      );
    }

    // Remove group from all subscribers first
    await Lead.updateMany(
      { groups: id },
      { $pull: { groups: id } }
    );

    const deletedGroup = await Group.findByIdAndDelete(id);

    if (!deletedGroup) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }

    console.log(`🗑️ Group deleted: ${deletedGroup.name}`);

    return NextResponse.json({
      success: true,
      message: "Grupo eliminado exitosamente",
    });

  } catch (error) {
    console.error("❌ Error deleting group:", error);
    return NextResponse.json(
      { error: "Error al eliminar grupo" },
      { status: 500 }
    );
  }
}
