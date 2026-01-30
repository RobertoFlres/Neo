import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import ArticleSuggestion from "@/models/ArticleSuggestion";
import Lead from "@/models/Lead";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ notifications: [] }, { status: 200 });
    }

    await connectMongo();

    const notifications = [];

    // Obtener artículos pendientes de colaboradores (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pendingArticles = await ArticleSuggestion.find({
      status: "pending",
      createdAt: { $gte: sevenDaysAgo },
    })
      .select("title submittedBy createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    pendingArticles.forEach((article) => {
      notifications.push({
        id: `article-${article._id}`,
        type: "article",
        title: "Nuevo artículo pendiente",
        message: `${article.submittedBy?.name || article.submittedBy?.email} ha enviado: "${article.title}"`,
        date: article.createdAt,
        link: "/dashboard/suggestions",
      });
    });

    // Obtener nuevos suscriptores (últimas 24 horas)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const newSubscribers = await Lead.find({
      isActive: true,
      createdAt: { $gte: yesterday },
    })
      .select("email createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    newSubscribers.forEach((subscriber) => {
      notifications.push({
        id: `subscriber-${subscriber._id}`,
        type: "subscriber",
        title: "Nuevo suscriptor",
        message: `${subscriber.email} se ha suscrito`,
        date: subscriber.createdAt,
        link: "/dashboard/subscribers",
      });
    });

    // Obtener desuscripciones recientes (últimas 24 horas)
    const recentUnsubscribes = await Lead.find({
      isActive: false,
      unsubscribedAt: { $gte: yesterday },
    })
      .select("email unsubscribedAt")
      .sort({ unsubscribedAt: -1 })
      .limit(10);

    recentUnsubscribes.forEach((subscriber) => {
      notifications.push({
        id: `unsubscribe-${subscriber._id}`,
        type: "unsubscribe",
        title: "Usuario desuscrito",
        message: `${subscriber.email} se ha dado de baja`,
        date: subscriber.unsubscribedAt,
        link: "/dashboard/subscribers",
      });
    });

    // Ordenar por fecha (más recientes primero)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ notifications: notifications.slice(0, 20) });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return Response.json({ notifications: [] }, { status: 200 });
  }
}

