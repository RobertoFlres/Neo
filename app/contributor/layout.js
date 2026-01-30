import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Contributor from "@/models/Contributor";
import ContributorLayout from "@/components/contributor/ContributorLayout";
import config from "@/config";

export const dynamic = "force-dynamic";

// This layout ensures only whitelisted contributors can access /contributor
export default async function ContributorLayoutWrapper({ children }) {
  const session = await getServerSession(authOptions);

  // Check if user is logged in
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/contributor");
  }

  const userEmail = session?.user?.email?.toLowerCase();

  // Check if user is admin
  const ADMIN_EMAILS = [
    "rflores@startupchihuahua.com",
    "rflores@startupchihuahua.org",
  ];
  const isAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail);

  // Check if user is in the config whitelist
  const allowedEmails = config.contributors?.allowedEmails || [];
  const isInWhitelist = allowedEmails.some(email => email.toLowerCase() === userEmail);

  // Check if user is a contributor in the database
  await connectMongo();
  const contributor = await Contributor.findOne({
    email: userEmail,
    isActive: true,
  });
  const isContributor = !!contributor;

  // Allow access if admin, in whitelist, or contributor in DB
  if (!isAdmin && !isInWhitelist && !isContributor) {
    console.log("❌ Access denied for:", userEmail);
    redirect("/?error=access_denied");
  }

  return <ContributorLayout>{children}</ContributorLayout>;
}
