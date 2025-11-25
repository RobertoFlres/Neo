"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const menuItems = [
  {
    title: "Mis Artículos",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
    path: "/contributor",
  },
  {
    title: "Crear Artículo",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
      </svg>
    ),
    path: "/contributor/create",
  },
];

const ContributorSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    // Limpiar localStorage de notificaciones
    if (typeof window !== "undefined") {
      localStorage.removeItem("readNotificationsContributor");
    }
    // Cerrar sesión y redirigir
    signOut({ callbackUrl: "/" });
  };

  return (
    <aside className="bg-white border-r border-gray-200 w-64 min-h-screen flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/contributor" className="flex items-center justify-center">
          <Image 
            src="/logonuevo.svg" 
            alt="neo" 
            width={140}
            height={40}
            priority
            className="h-10 w-auto"
            style={{ filter: 'brightness(0) saturate(100%) invert(20%) sepia(90%) saturate(2000%) hue-rotate(220deg) brightness(0.85) contrast(1.2)' }}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (item.path === "/contributor" && pathname.startsWith("/contributor") && pathname !== "/contributor/create");
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#2b3e81] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-[#2b3e81]"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-lg bg-gray-50">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-full border-2 border-[#2b3e81] object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] rounded-full flex items-center justify-center text-white font-bold">
              {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-gray-800">
              {session?.user?.name || "Colaborador"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-700 transition-colors text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default ContributorSidebar;
