import Link from "next/link";
import { getNewsletters } from "@/app/api/newsletter/route";
import NewsletterList from "@/components/dashboard/NewsletterList";

export const metadata = {
  title: "Newsletters - Dashboard",
  description: "Manage your newsletters",
};

/**
 * GET newsletters from API
 */
async function getData() {
  try {
    const newsletters = await getNewsletters();
    return newsletters;
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return [];
  }
}

export default async function NewslettersPage() {
  const newsletters = await getData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Newsletters
          </h1>
          <p className="text-gray-600">
            {newsletters.length} newsletter{newsletters.length !== 1 ? "s" : ""} creado
            {newsletters.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link 
          href="/dashboard/generate" 
          className="bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Crear Nuevo
        </Link>
      </div>

      {/* Newsletters List */}
      <NewsletterList initialNewsletters={newsletters} />
    </div>
  );
}

