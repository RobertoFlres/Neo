import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";
import Newsletter from "@/models/Newsletter";
import DashboardContent from "@/components/dashboard/DashboardContent";

export const dynamic = "force-dynamic";

// Helper function to calculate relative time in Spanish
function getRelativeTime(date) {
  if (!date) return "Nunca";

  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Hace unos segundos";
  if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  if (days < 7) return `Hace ${days} día${days !== 1 ? "s" : ""}`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `Hace ${weeks} semana${weeks !== 1 ? "s" : ""}`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} mes${months !== 1 ? "es" : ""}`;
  
  const years = Math.floor(days / 365);
  return `Hace ${years} año${years !== 1 ? "s" : ""}`;
}

// Helper to format activity description
function getActivityDescription(newsletter) {
  if (newsletter.status === "sent") {
    return `Newsletter enviado: "${newsletter.title}"`;
  } else {
    return `Newsletter generado con IA: "${newsletter.title}"`;
  }
}

// Helper to get activity icon
function getActivityIcon(newsletter) {
  return newsletter.status === "sent" ? "⚡" : "🤖";
}

export default async function Dashboard() {
  await connectMongo();
  const session = await getServerSession(authOptions);

  try {
    // Get total active subscribers
    const totalSubscribers = await Lead.countDocuments({ isActive: true });

    // Get total sent newsletters
    const newslettersSent = await Newsletter.countDocuments({ status: "sent" });

    // Get last sent newsletter
    const lastNewsletter = await Newsletter.findOne({ status: "sent" })
      .sort({ sentAt: -1 })
      .select("sentAt title");

    // Get pending newsletters
    const pendingNewsletters = await Newsletter.countDocuments({ status: "draft" });

    // Get recent activity (last 5 newsletters ordered by creation)
    const recentActivity = await Newsletter.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status createdAt sentAt");

    // Calculate last newsletter time
    const lastNewsletterTime = lastNewsletter?.sentAt
      ? getRelativeTime(lastNewsletter.sentAt)
      : "Nunca";

    // Get new subscribers count (subscribers created today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newSubscribersToday = await Lead.countDocuments({
      isActive: true,
      createdAt: { $gte: today },
    });

    // Format recent activity
    const formattedActivity = recentActivity.map((newsletter) => {
      const date = newsletter.status === "sent" && newsletter.sentAt
        ? newsletter.sentAt
        : newsletter.createdAt;
      
      return {
        description: getActivityDescription(newsletter),
        time: getRelativeTime(date),
        icon: getActivityIcon(newsletter),
      };
    });

    // Get new subscribers activity if any
    if (newSubscribersToday > 0) {
      formattedActivity.unshift({
        description: `+${newSubscribersToday} nuevo${newSubscribersToday !== 1 ? "s" : ""} suscriptor${newSubscribersToday !== 1 ? "es" : ""}`,
        time: "Hoy",
        icon: "📧",
      });
    }

    const stats = {
      totalSubscribers,
      newslettersSent,
      lastNewsletter: lastNewsletterTime,
      pendingNewsletters,
    };

    // Pasar también los datos originales para filtrado
    const activityWithDates = recentActivity.map((newsletter) => {
      const date = newsletter.status === "sent" && newsletter.sentAt
        ? newsletter.sentAt
        : newsletter.createdAt;
      
      return {
        description: getActivityDescription(newsletter),
        time: getRelativeTime(date),
        icon: getActivityIcon(newsletter),
        date: date ? new Date(date) : null,
        status: newsletter.status,
      };
    });

    // Agregar nuevo suscriptor si existe
    if (newSubscribersToday > 0) {
      activityWithDates.unshift({
        description: `+${newSubscribersToday} nuevo${newSubscribersToday !== 1 ? "s" : ""} suscriptor${newSubscribersToday !== 1 ? "es" : ""}`,
        time: "Hoy",
        icon: "📧",
        date: new Date(),
        status: "subscriber",
      });
    }

    return (
      <DashboardContent 
        initialData={{
          stats,
          formattedActivity: activityWithDates,
        }}
        userName={session?.user?.name?.split(" ")[0] || "Administrador"}
      />
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    
    // Fallback to show error message
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Error al cargar los datos
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-red-600">Error al cargar los datos del dashboard. Por favor, recarga la página.</p>
        </div>
      </div>
    );
  }
}
