"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export function CopyArticleButton({ article }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      // Format article content for copy
      const content = `**${article.title}**\n\n${article.summary}\n\nFuente: ${article.source}\nEnlace: ${article.link}`;
      
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("¡Artículo copiado al portapapeles!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Error al copiar");
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`btn btn-sm btn-ghost ${copied ? 'btn-success' : ''}`}
      title="Copiar artículo"
    >
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copiar
        </>
      )}
    </button>
  );
}

