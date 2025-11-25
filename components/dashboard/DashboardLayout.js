"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./Header";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - hidden on mobile by default */}
        <div className={`hidden lg:block ${sidebarOpen ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto`}>
          <Sidebar />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
