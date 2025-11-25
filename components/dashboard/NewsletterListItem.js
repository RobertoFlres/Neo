"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function NewsletterListItem({ newsletter, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const getStatusBadge = (status) => {
    if (status === "sent") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setDeleting(true);

    console.log("🔄 Starting delete process...");

    try {
      const newsletterId = newsletter._id || newsletter.id;
      console.log("📡 Sending DELETE request to:", `/api/newsletter/${newsletterId}`);
      
      const response = await fetch(`/api/newsletter/${newsletterId}`, {
        method: "DELETE",
      });

      console.log("📥 Response status:", response.status);
      
      const data = await response.json();
      console.log("📥 Response data:", data);

      if (response.ok && data.success) {
        console.log("✅ Newsletter deleted successfully");
        toast.success("Newsletter eliminado exitosamente");
        
        // Recargar la página para actualizar la lista
        // Usamos un pequeño delay para que el toast se muestre primero
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.error("❌ Delete failed:", data.error);
        toast.error(data.error || "Error al eliminar newsletter");
        setDeleting(false);
      }
    } catch (error) {
      console.error("❌ Error deleting newsletter:", error);
      toast.error("Error al eliminar newsletter");
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };

  const newsletterId = newsletter._id || newsletter.id;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          {/* Contenido del newsletter - Link clickeable */}
          <Link
            href={`/dashboard/newsletters/${newsletterId}`}
            className="flex-1 min-w-0 pr-4"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-[#2b3e81] transition-colors">
              {newsletter.title}
            </h2>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {newsletter.content?.summary || "Sin resumen"}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(newsletter.date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {newsletter.content?.articles?.length || 0} artículos
              </span>
              {newsletter.status === "sent" && newsletter.sentCount > 0 && (
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {newsletter.sentCount} enviados
                </span>
              )}
            </div>
          </Link>
          
          {/* Área de acciones - Separada completamente */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(newsletter.status)}`}>
              {newsletter.status === "draft" ? "Borrador" : "Enviado"}
            </span>
            
            <button
              onClick={handleDeleteClick}
              disabled={deleting}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar newsletter"
              type="button"
            >
              {deleting ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleCancelDelete}></div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md w-full mx-4 relative z-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4">¿Eliminar newsletter?</h3>
            <p className="text-gray-600 mb-2">
              ¿Estás seguro de que quieres eliminar <strong className="text-gray-800">"{newsletter.title}"</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              ⚠️ Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  "Sí, eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
