import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";

export const dynamic = "force-dynamic";

export default async function DebugSession() {
  const session = await getServerSession(authOptions);

  const userEmail = session?.user?.email;
  const userEmailLower = userEmail?.toLowerCase();
  const ADMIN_EMAIL = "roberto24flores@gmail.com";
  const isAdmin = userEmailLower === ADMIN_EMAIL.toLowerCase();
  const allowedEmails = config.contributors?.allowedEmails || [];
  const isContributor = allowedEmails.some(
    (email) => email?.toLowerCase() === userEmailLower
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Session Info</h1>
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Session Data</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>Email:</strong> {userEmail || "No email"}
            </div>
            <div>
              <strong>Email (lowercase):</strong> {userEmailLower || "No email"}
            </div>
            <div>
              <strong>Email length:</strong> {userEmail?.length || 0}
            </div>
            <div>
              <strong>Email char codes:</strong>{" "}
              {userEmail
                ? JSON.stringify(userEmail.split("").map((c) => c.charCodeAt(0)))
                : "N/A"}
            </div>
            <div className="divider"></div>
            <div>
              <strong>Is Admin:</strong> {isAdmin ? "✅ Yes" : "❌ No"}
            </div>
            <div>
              <strong>Admin Email:</strong> {ADMIN_EMAIL.toLowerCase()}
            </div>
            <div className="divider"></div>
            <div>
              <strong>Is Contributor:</strong> {isContributor ? "✅ Yes" : "❌ No"}
            </div>
            <div>
              <strong>Allowed Emails:</strong>
              <ul className="list-disc list-inside ml-4">
                {allowedEmails.map((email, i) => (
                  <li key={i}>
                    {email} (lowercase: {email?.toLowerCase()})
                    {email?.toLowerCase() === userEmailLower && " ← MATCH!"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="divider"></div>
            <div>
              <strong>Can Access Contributor:</strong>{" "}
              {isAdmin || isContributor ? "✅ Yes" : "❌ No"}
            </div>
            <div className="divider"></div>
            <div>
              <strong>Config Contributors:</strong>
              <pre className="bg-base-300 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(config.contributors, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
