"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const AccessDeniedMessage = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Sign out the user immediately when message appears
    signOut({ redirect: false });

    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="alert alert-error max-w-2xl mx-auto my-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>
        <h3 className="font-bold">Acceso denegado</h3>
        <div className="text-xs">
          Solo el administrador puede acceder al dashboard. Tu sesión ha sido cerrada.
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedMessage;
