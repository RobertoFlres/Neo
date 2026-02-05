import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";

export const dynamic = "force-dynamic";

/**
 * POST /api/subscribers/import
 * Import multiple subscribers from CSV data
 * Optionally assign groups to all imported subscribers
 */
export async function POST(req) {
  await connectMongo();

  try {
    const { subscribers, groupIds } = await req.json();

    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron suscriptores válidos" },
        { status: 400 }
      );
    }

    const results = {
      total: subscribers.length,
      imported: 0,
      reactivated: 0,
      duplicates: 0,
      errors: [],
    };

    // Convert group IDs to ObjectIds
    const groups = (groupIds || [])
      .filter(g => g && mongoose.Types.ObjectId.isValid(g))
      .map(g => new mongoose.Types.ObjectId(g));

    for (const subscriber of subscribers) {
      const email = subscriber.email?.toLowerCase()?.trim();

      if (!email) {
        results.errors.push({ email: subscriber.email, error: "Email vacío o inválido" });
        continue;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        results.errors.push({ email, error: "Formato de email inválido" });
        continue;
      }

      try {
        const existingSubscriber = await Lead.findOne({ email });

        if (existingSubscriber) {
          if (existingSubscriber.isActive) {
            // If groups provided, add them to existing subscriber
            if (groups.length > 0) {
              const existingGroupIds = (existingSubscriber.groups || []).map(g => g.toString());
              const newGroupIds = groups.map(g => g.toString());
              const combinedIds = [...new Set([...existingGroupIds, ...newGroupIds])];
              const combinedObjectIds = combinedIds.map(id => new mongoose.Types.ObjectId(id));
              await Lead.findByIdAndUpdate(existingSubscriber._id, {
                groups: combinedObjectIds,
              });
            }
            results.duplicates++;
          } else {
            // Reactivate existing subscriber and add groups
            const existingGroupIds = (existingSubscriber.groups || []).map(g => g.toString());
            const newGroupIds = groups.map(g => g.toString());
            const combinedIds = [...new Set([...existingGroupIds, ...newGroupIds])];
            const combinedObjectIds = combinedIds.map(id => new mongoose.Types.ObjectId(id));
            await Lead.findByIdAndUpdate(existingSubscriber._id, {
              isActive: true,
              unsubscribedAt: null,
              groups: combinedObjectIds,
            });
            results.reactivated++;
          }
        } else {
          // Create new subscriber with groups
          await Lead.create({
            email,
            isActive: true,
            source: "csv_import",
            groups: groups,
            metadata: {
              country: subscriber.country || null,
            },
          });
          results.imported++;
        }
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error
          results.duplicates++;
        } else {
          results.errors.push({ email, error: error.message });
        }
      }
    }

    console.log(`✅ CSV Import completed: ${results.imported} imported, ${results.reactivated} reactivated, ${results.duplicates} duplicates`);

    return NextResponse.json({
      success: true,
      message: "Importación completada",
      results,
    });

  } catch (error) {
    console.error("❌ Error importing subscribers:", error);
    return NextResponse.json(
      { error: "Error al importar suscriptores" },
      { status: 500 }
    );
  }
}
