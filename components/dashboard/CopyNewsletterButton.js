"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export function CopyNewsletterButton({ newsletter }) {
  const [copied, setCopied] = useState(false);

  const copyNewsletterToClipboard = async () => {
    try {
      // Format the entire newsletter
      let content = `⚡ neo\n\n`;
      content += `${newsletter.date ? new Date(newsletter.date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) : "Sin fecha"}\n\n`;
      
      // Add summary
      if (newsletter.content?.summary) {
        content += `${newsletter.content.summary}\n\n`;
      }
      
      // Add articles
      if (newsletter.content?.articles) {
        newsletter.content.articles.forEach((article) => {
          content += `**${article.title}**\n\n`;
          content += `${article.summary}\n\n`;
          content += `📰 ${article.source} | ${article.link}\n\n`;
        });
      }
      
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("¡Newsletter completo copiado al portapapeles!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying newsletter:", error);
      toast.error("Error al copiar");
    }
  };

  return (
    <button
      onClick={copyNewsletterToClipboard}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
        copied
          ? "bg-green-100 text-green-800 border border-green-300 hover:bg-green-200"
          : "bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white hover:shadow-lg"
      }`}
      title="Copiar newsletter completo"
    >
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Copiado
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copiar Todo
        </>
      )}
    </button>
  );
}

