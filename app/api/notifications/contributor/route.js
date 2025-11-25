import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import ArticleSuggestion from "@/models/ArticleSuggestion";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ notifications: [] }, { status: 200 });
    }

    await connectMongo();

    const userEmail = session.user?.email?.toLowerCase();
    const notifications = [];

    // Obtener artículos aprobados del colaborador (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const approvedArticles = await ArticleSuggestion.find({
      "submittedBy.email": { $regex: new RegExp(`^${userEmail}$`, "i") },
      status: "approved",
      reviewedAt: { $gte: thirtyDaysAgo },
    })
      .select("title reviewedAt")
      .sort({ reviewedAt: -1 })
      .limit(10);

    approvedArticles.forEach((article) => {
      notifications.push({
        id: `approved-${article._id}`,
        type: "article-approved",
        title: "Artículo aprobado",
        message: `Tu artículo "${article.title}" ha sido aprobado y aparecerá en el newsletter`,
        date: article.reviewedAt,
        link: "/contributor",
      });
    });

    // Obtener artículos rechazados del colaborador (últimos 30 días)
    const rejectedArticles = await ArticleSuggestion.find({
      "submittedBy.email": { $regex: new RegExp(`^${userEmail}$`, "i") },
      status: "rejected",
      reviewedAt: { $gte: thirtyDaysAgo },
    })
      .select("title reviewedAt notes")
      .sort({ reviewedAt: -1 })
      .limit(10);

    rejectedArticles.forEach((article) => {
      notifications.push({
        id: `rejected-${article._id}`,
        type: "article-rejected",
        title: "Artículo rechazado",
        message: `Tu artículo "${article.title}" ha sido rechazado${article.notes ? `: ${article.notes}` : ""}`,
        date: article.reviewedAt,
        link: "/contributor",
      });
    });

    // Ordenar por fecha (más recientes primero)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ notifications: notifications.slice(0, 20) });
  } catch (error) {
    console.error("Error fetching contributor notifications:", error);
    return Response.json({ notifications: [] }, { status: 200 });
  }
}

