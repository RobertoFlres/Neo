import Link from "next/link";
import NewsletterActions from "@/components/dashboard/NewsletterActions";
import connectMongo from "@/libs/mongoose";
import Newsletter from "@/models/Newsletter";
import { EditNewsletterWrapper } from "@/components/dashboard/EditNewsletterWrapper";

export const metadata = {
  title: "Newsletter - Dashboard",
  description: "View newsletter details",
};

async function getNewsletterData(id) {
  try {
    console.log("🔍 Fetching newsletter with id:", id);
    await connectMongo();
    const newsletter = await Newsletter.findById(id);
    if (!newsletter) return null;
    
    // Ensure _id is preserved
    const newsletterData = JSON.parse(JSON.stringify(newsletter));
    console.log("📋 Newsletter data:", {
      id: newsletterData._id,
      title: newsletterData.title,
      status: newsletterData.status
    });
    
    return newsletterData;
  } catch (error) {
    console.error("❌ Error fetching newsletter:", error);
    return null;
  }
}

export default async function NewsletterDetailPage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  console.log("📋 Newsletter ID from params:", id);
  
  const newsletter = await getNewsletterData(id);
  
  // Debug: log the newsletter data
  console.log("📊 Newsletter data:", newsletter ? JSON.stringify(newsletter).slice(0, 200) : "null");

  if (!newsletter) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Newsletter no encontrado</h2>
            <Link 
              href="/dashboard/newsletters" 
              className="bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Newsletters
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editable Newsletter Content */}
      <EditNewsletterWrapper newsletter={newsletter} />

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl mx-auto">
        {(() => {
          const newsletterWithId = {...newsletter, _id: newsletter._id || newsletter.id};
          console.log("📧 Passing newsletter to NewsletterActions:", {
            originalId: newsletter._id || newsletter.id,
            newsletterWithId: newsletterWithId._id
          });
          return <NewsletterActions newsletter={newsletterWithId} />;
        })()}
      </div>
    </div>
  );
}

