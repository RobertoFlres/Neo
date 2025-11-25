import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import ArticleSuggestion from "@/models/ArticleSuggestion";
import SuggestionsList from "@/components/dashboard/SuggestionsList";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "roberto24flores@gmail.com";

export default async function SuggestionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

  if (!isAdmin) {
    redirect("/?error=access_denied");
  }

  await connectMongo();

  const suggestions = await ArticleSuggestion.find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .lean(); // Use lean() to get plain JavaScript objects

  // Ensure IDs are properly serialized
  const serializedSuggestions = suggestions.map(s => ({
    ...s,
    _id: s._id?.toString(),
    id: s._id?.toString(), // Also include as 'id' for consistency
  }));

  return <SuggestionsList initialSuggestions={serializedSuggestions} />;

}
