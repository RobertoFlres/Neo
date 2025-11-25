import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";
import connectMongo from "@/libs/mongoose";
import Contributor from "@/models/Contributor";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Define who can access the admin dashboard
const ADMIN_EMAIL = "roberto24flores@gmail.com";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({ children }) {
  const session = await getServerSession(authOptions);

  // Check if user is logged in
  if (!session) {
    redirect(config.auth.loginUrl);
  }

  // Check if user is admin
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

  // If not admin, check if user is a contributor and redirect them to /contributor
  if (!isAdmin) {
    await connectMongo();
    
    // Check if user is a contributor in the database
    const contributor = await Contributor.findOne({
      email: userEmail,
      isActive: true,
    });
    
    const isContributor = !!contributor;
    
    if (isContributor) {
      // Redirect contributors to their dashboard
      redirect("/contributor");
    }
    
    // If neither admin nor contributor, deny access
    redirect("/?error=access_denied");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
