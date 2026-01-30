"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EditableNewsletter } from "./EditableNewsletter";
import { CopyNewsletterButton } from "./CopyNewsletterButton";
import { NewsletterPreviewModal } from "./NewsletterPreviewModal";

export function EditNewsletterWrapper({ newsletter }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Insert buttons into header
  useEffect(() => {
    const headerRight = document.querySelector('[data-header-right]');
    if (headerRight) {
      headerRight.innerHTML = `
        <div class="flex gap-4 items-center">
          <div class="badge badge-lg ${newsletter.status === 'draft' ? 'badge-warning' : 'badge-success'}">
            ${newsletter.status === 'draft' ? 'Borrador' : 'Enviado'}
          </div>
          <div id="newsletter-buttons"></div>
        </div>
      `;
      
      // Render buttons into header
      const buttonsContainer = document.getElementById('newsletter-buttons');
      if (buttonsContainer) {
        // This will be done by the component rendering
      }
    }
  }, [newsletter]);

  return (
    <>
      {/* Header with back button, status and action buttons */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/dashboard/newsletters" 
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#2b3e81] hover:text-[#2b3e81] transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Link>
        <div className="flex gap-4 items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
            newsletter.status === "draft" 
              ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
              : "bg-green-100 text-green-800 border-green-200"
          }`}>
            {newsletter.status === "draft" ? "Borrador" : "Enviado"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#2b3e81] hover:text-[#2b3e81] transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Vista Previa
            </button>
            <CopyNewsletterButton newsletter={newsletter} />
            <button
              onClick={() => setEditing(!editing)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                editing
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200"
                  : "bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white hover:shadow-lg"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {editing ? "Editando" : "Editar"}
            </button>
          </div>
        </div>
      </div>

      {/* Newsletter Content */}
      <EditableNewsletter
        newsletter={newsletter}
        editing={editing}
        setEditing={setEditing}
        saving={saving}
        setSaving={setSaving}
      />

      {/* Preview Modal */}
      <NewsletterPreviewModal
        newsletter={newsletter}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}

