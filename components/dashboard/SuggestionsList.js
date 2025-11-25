"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function SuggestionsList({ initialSuggestions }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const updateSuggestionStatus = async (id, status, notes = "") => {
    try {
      console.log("🔄 Updating suggestion status:", { id, status, notes, idType: typeof id });
      
      // Handle different ID formats
      let suggestionId;
      if (typeof id === 'string' && id !== 'undefined' && id.trim() !== '') {
        suggestionId = id;
      } else if (typeof id === 'object' && id !== null) {
        suggestionId = id._id || id.id;
      } else if (id && id !== 'undefined') {
        suggestionId = String(id);
      }
      
      // Validate ID
      if (!suggestionId || suggestionId === 'undefined' || suggestionId.trim() === '') {
        console.error("❌ No valid ID provided:", id, "processed:", suggestionId);
        toast.error("Error: No se pudo obtener el ID de la sugerencia");
        return;
      }

      console.log("📡 Sending PUT request to:", `/api/article-suggestions/${suggestionId}`);
      
      const response = await fetch(`/api/article-suggestions/${suggestionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      console.log("📥 Response status:", response.status, response.statusText);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (!response.ok) {
        const errorMessage = data.error || `Error ${response.status}: ${response.statusText}`;
        console.error("❌ API Error:", errorMessage);
        toast.error(errorMessage || "Error al actualizar sugerencia");
        return;
      }

      if (data.success) {
        toast.success(`Sugerencia ${status === "approved" ? "aprobada" : "rechazada"}`);
        setSuggestions((prev) =>
          prev.map((s) => {
            const sId = s._id || s.id;
            return sId === suggestionId ? data.suggestion : s;
          })
        );
        router.refresh();
      } else {
        toast.error(data.error || "Error al actualizar sugerencia");
      }
    } catch (error) {
      console.error("❌ Error updating suggestion:", error);
      toast.error(`Error al actualizar sugerencia: ${error.message}`);
    }
  };

  const deleteSuggestion = async (id, title) => {
    // Confirm deletion
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el artículo "${title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      console.log("🗑️ Deleting suggestion:", { id, title, idType: typeof id });
      
      // Handle different ID formats
      let suggestionId;
      if (typeof id === 'string' && id !== 'undefined' && id.trim() !== '') {
        suggestionId = id;
      } else if (typeof id === 'object' && id !== null) {
        suggestionId = id._id || id.id;
      } else if (id && id !== 'undefined') {
        suggestionId = String(id);
      }
      
      // Validate ID
      if (!suggestionId || suggestionId === 'undefined' || suggestionId.trim() === '') {
        console.error("❌ No valid ID provided:", id, "processed:", suggestionId);
        toast.error("Error: No se pudo obtener el ID de la sugerencia");
        return;
      }

      console.log("📡 Sending DELETE request to:", `/api/article-suggestions/${suggestionId}`);
      
      const response = await fetch(`/api/article-suggestions/${suggestionId}`, {
        method: "DELETE",
      });

      console.log("📥 Response status:", response.status, response.statusText);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (!response.ok) {
        const errorMessage = data.error || `Error ${response.status}: ${response.statusText}`;
        console.error("❌ API Error:", errorMessage);
        toast.error(errorMessage || "Error al eliminar sugerencia");
        return;
      }

      if (data.success) {
        toast.success("Artículo eliminado exitosamente");
        // Remove from local state
        setSuggestions((prev) =>
          prev.filter((s) => {
            const sId = s._id || s.id;
            return sId !== suggestionId;
          })
        );
        router.refresh();
      } else {
        toast.error(data.error || "Error al eliminar sugerencia");
      }
    } catch (error) {
      console.error("❌ Error deleting suggestion:", error);
      toast.error(`Error al eliminar sugerencia: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
        {status === "pending" && "⏳ Pendiente"}
        {status === "approved" && "✅ Aprobado"}
        {status === "rejected" && "❌ Rechazado"}
      </span>
    );
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const reviewedSuggestions = suggestions.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Sugerencias de Artículos
        </h1>
        <p className="text-gray-600">
          Revisa y aprueba artículos sugeridos por colaboradores
        </p>
      </div>

      {/* Pending Suggestions */}
      {pendingSuggestions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pendientes ({pendingSuggestions.length})
          </h2>
          <div className="space-y-4">
            {pendingSuggestions.map((suggestion) => (
              <div key={suggestion._id || suggestion.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <h3
                        className="font-bold text-xl text-gray-800"
                        style={{ color: suggestion.titleColor || "#2b3e81" }}
                      >
                        {suggestion.title}
                      </h3>
                    </div>
                    
                    {suggestion.image && (
                      <Image
                        src={suggestion.image}
                        alt={suggestion.title}
                        width={800}
                        height={450}
                        unoptimized
                        className="max-w-md w-full rounded-lg mb-4 object-cover"
                      />
                    )}

                    {suggestion.summary && (
                      <div
                        className="text-sm text-gray-600 mb-3 prose prose-sm max-w-none line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: suggestion.summary }}
                      />
                    )}

                    <button
                      onClick={() => {
                        setSelectedSuggestion(suggestion);
                        setIsModalOpen(true);
                      }}
                      className="text-[#2b3e81] hover:text-[#4d6fff] text-sm font-medium mb-3 inline-flex items-center gap-1 transition-colors"
                    >
                      Ver artículo completo
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Por: {suggestion.submittedBy.name || suggestion.submittedBy.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(suggestion.createdAt).toLocaleDateString("es-ES")}
                      </span>
                      {suggestion.source && (
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                          Fuente: {suggestion.source}
                        </span>
                      )}
                    </div>
                    
                    {suggestion.url && (
                      <a
                        href={suggestion.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2b3e81] hover:text-[#4d6fff] text-sm font-medium inline-flex items-center gap-1"
                      >
                        Ver artículo original
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        updateSuggestionStatus(suggestion._id || suggestion.id, "approved")
                      }
                      className="bg-gradient-to-br from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Aprobar
                    </button>
                    <button
                      onClick={() =>
                        updateSuggestionStatus(suggestion._id || suggestion.id, "rejected")
                      }
                      className="bg-gradient-to-br from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Rechazar
                    </button>
                    <button
                      onClick={() =>
                        deleteSuggestion(suggestion._id || suggestion.id, suggestion.title)
                      }
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                      title="Eliminar artículo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Suggestions */}
      {reviewedSuggestions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Revisadas ({reviewedSuggestions.length})
          </h2>
          <div className="space-y-4">
            {reviewedSuggestions.map((suggestion) => (
              <div key={suggestion._id || suggestion.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3
                        className="font-bold text-lg text-gray-800"
                        style={{ color: suggestion.titleColor || "#2b3e81" }}
                      >
                        {suggestion.title}
                      </h3>
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Por: {suggestion.submittedBy.name || suggestion.submittedBy.email}
                      </span>
                      {suggestion.reviewedBy && (
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Revisado por: {suggestion.reviewedBy.name || suggestion.reviewedBy.email}
                        </span>
                      )}
                      {suggestion.reviewedAt && (
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(suggestion.reviewedAt).toLocaleDateString("es-ES")}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedSuggestion(suggestion);
                        setIsModalOpen(true);
                      }}
                      className="text-[#2b3e81] hover:text-[#4d6fff] text-sm font-medium mb-3 inline-flex items-center gap-1 transition-colors"
                    >
                      Ver artículo completo
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {suggestion.url && (
                      <a
                        href={suggestion.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2b3e81] hover:text-[#4d6fff] text-sm font-medium inline-flex items-center gap-1"
                      >
                        Ver artículo original
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        deleteSuggestion(suggestion._id || suggestion.id, suggestion.title)
                      }
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                      title="Eliminar artículo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para ver artículo completo */}
      {isModalOpen && selectedSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative z-10">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1">
                <h2
                  className="text-2xl font-bold text-gray-800"
                  style={{ color: selectedSuggestion.titleColor || "#2b3e81" }}
                >
                  {selectedSuggestion.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Por: {selectedSuggestion.submittedBy.name || selectedSuggestion.submittedBy.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(selectedSuggestion.createdAt).toLocaleDateString("es-ES")}
                  </span>
                  {selectedSuggestion.source && (
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      Fuente: {selectedSuggestion.source}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {selectedSuggestion.image && (
                <Image
                  src={selectedSuggestion.image}
                  alt={selectedSuggestion.title}
                  width={1200}
                  height={675}
                  unoptimized
                  className="w-full rounded-lg mb-6 object-cover"
                />
              )}

              {selectedSuggestion.summary && (
                <div
                  className="text-gray-700 prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedSuggestion.summary }}
                />
              )}

              {selectedSuggestion.url && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href={selectedSuggestion.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2b3e81] hover:text-[#4d6fff] font-medium inline-flex items-center gap-2"
                  >
                    Ver artículo original
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {suggestions.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-xl font-medium text-gray-600">
              No hay sugerencias aún
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Los colaboradores podrán sugerir artículos aquí
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
