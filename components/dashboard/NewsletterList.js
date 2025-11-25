"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NewsletterListItem from "@/components/dashboard/NewsletterListItem";

export default function NewsletterList({ initialNewsletters }) {
  const [newsletters, setNewsletters] = useState(initialNewsletters);

  // Actualizar la lista cuando cambian los newsletters iniciales (después de refresh)
  useEffect(() => {
    setNewsletters(initialNewsletters);
  }, [initialNewsletters]);

  const handleDelete = (newsletterId) => {
    // Remover optimísticamente el newsletter de la lista
    // Esto actualiza la UI inmediatamente sin esperar al servidor
    setNewsletters((prev) => {
      const filtered = prev.filter((n) => (n._id || n.id) !== newsletterId);
      return filtered;
    });
  };

  if (newsletters.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">
            No hay newsletters creados aún
          </p>
          <Link 
            href="/dashboard/generate" 
            className="bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Crear primer newsletter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {newsletters.map((newsletter) => (
        <NewsletterListItem
          key={newsletter._id || newsletter.id}
          newsletter={newsletter}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
