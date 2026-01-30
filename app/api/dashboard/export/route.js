import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";
import Newsletter from "@/models/Newsletter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("No autorizado", { status: 401 });
    }

    await connectMongo();

    // Obtener todas las estadísticas
    const totalSubscribers = await Lead.countDocuments({ isActive: true });
    const newslettersSent = await Newsletter.countDocuments({ status: "sent" });
    const pendingNewsletters = await Newsletter.countDocuments({ status: "draft" });

    // Obtener newsletters enviados con detalles
    const sentNewsletters = await Newsletter.find({ status: "sent" })
      .select("title sentAt createdAt")
      .sort({ sentAt: -1 })
      .limit(100);

    // Obtener suscriptores activos
    const subscribers = await Lead.find({ isActive: true })
      .select("email createdAt")
      .sort({ createdAt: -1 });

    // Generar CSV
    const csvRows = [];

    // Encabezado
    csvRows.push("Reporte del Dashboard - " + new Date().toLocaleDateString("es-ES"));
    csvRows.push("");
    csvRows.push("RESUMEN GENERAL");
    csvRows.push(`Total Suscriptores,${totalSubscribers}`);
    csvRows.push(`Newsletters Enviados,${newslettersSent}`);
    csvRows.push(`Newsletters Pendientes,${pendingNewsletters}`);
    csvRows.push("");

    // Newsletters enviados
    csvRows.push("NEWSLETTERS ENVIADOS");
    csvRows.push("Título,Fecha de Envío,Fecha de Creación");
    sentNewsletters.forEach((newsletter) => {
      const sentDate = newsletter.sentAt
        ? new Date(newsletter.sentAt).toLocaleDateString("es-ES")
        : "N/A";
      const createdDate = newsletter.createdAt
        ? new Date(newsletter.createdAt).toLocaleDateString("es-ES")
        : "N/A";
      csvRows.push(
        `"${newsletter.title.replace(/"/g, '""')}",${sentDate},${createdDate}`
      );
    });
    csvRows.push("");

    // Suscriptores
    csvRows.push("SUSCRIPTORES ACTIVOS");
    csvRows.push("Email,Fecha de Registro");
    subscribers.forEach((subscriber) => {
      const createdDate = subscriber.createdAt
        ? new Date(subscriber.createdAt).toLocaleDateString("es-ES")
        : "N/A";
      csvRows.push(`"${subscriber.email}",${createdDate}`);
    });

    const csvContent = csvRows.join("\n");

    // Retornar como CSV
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reporte-dashboard-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error al generar reporte:", error);
    return new Response("Error al generar el reporte", { status: 500 });
  }
}

