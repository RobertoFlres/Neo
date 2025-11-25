import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Contributor from "@/models/Contributor";
import ContributorLayout from "@/components/contributor/ContributorLayout";

export const dynamic = "force-dynamic";

// This layout ensures only whitelisted contributors can access /contributor
export default async function ContributorLayoutWrapper({ children }) {
  const session = await getServerSession(authOptions);

  // Check if user is logged in
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/contributor");
  }

  // Check if user is admin (admin can also access contributor dashboard)
  const userEmail = session?.user?.email?.toLowerCase();
  const ADMIN_EMAIL = "roberto24flores@gmail.com";
  const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

  // Check if user is a contributor in the database
  await connectMongo();
  const contributor = await Contributor.findOne({
    email: userEmail,
    isActive: true,
  });
  
  const isContributor = !!contributor;

  // Allow access if admin or contributor
  if (!isAdmin && !isContributor) {
    console.log("❌ Access denied for:", userEmail);
    redirect("/?error=access_denied");
  }

  return <ContributorLayout>{children}</ContributorLayout>;
}
