"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function NewsletterActions({ newsletter }) {
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isResend, setIsResend] = useState(false);
  const router = useRouter();

  // Debug: Log newsletter data when component renders
  useEffect(() => {
    console.log("📋 NewsletterActions rendered with newsletter:", {
      id: newsletter._id || newsletter.id,
      status: newsletter.status,
      sentCount: newsletter.sentCount,
      sentAt: newsletter.sentAt
    });
  }, [newsletter]);

  const handleSendClick = (resend = false) => {
    setIsResend(resend);
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    console.log("🔄 Starting send/resend process...");

    const newsletterId = newsletter._id || newsletter.id;
    
    if (!newsletterId) {
      toast.error("Error: No se pudo obtener el ID del newsletter");
      console.error("❌ Newsletter ID is undefined:", newsletter);
      setLoading(false);
      return;
    }

    try {
      console.log(`📧 ${isResend ? 'Resending' : 'Sending'} newsletter with ID: ${newsletterId}`);
      const response = await fetch(`/api/newsletter/${newsletterId}/send`, {
        method: "POST",
      });

      console.log("📥 Response status:", response.status);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (data.success) {
        const message = isResend
          ? `Newsletter reenviado a ${data.newSentCount} suscriptores (Total: ${data.sentCount})`
          : `Newsletter enviado a ${data.sentCount} suscriptores`;
        toast.success(message);
        
        // Resetear el estado de loading antes de refrescar
        setLoading(false);
        
        // Recargar la página después de un pequeño delay para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          router.refresh();
        }, 500);
      } else {
        console.error("❌ Error response:", data);
        toast.error(data.error || "Error al enviar newsletter");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Error sending newsletter:", error);
      toast.error("Error al enviar newsletter");
      setLoading(false);
    }
  };

  const handleCancelSend = () => {
    setShowConfirmModal(false);
    console.log("❌ User cancelled send");
  };

  const handleDelete = async () => {
    if (newsletter.status === "sent") {
      toast.error("No se puede eliminar un newsletter ya enviado");
      return;
    }

    const confirmed = confirm(
      `¿Estás seguro de que quieres eliminar este newsletter?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const newsletterId = newsletter._id || newsletter.id;
      console.log("🗑️ Deleting newsletter:", newsletterId);
      
      const response = await fetch(`/api/newsletter/${newsletterId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      console.log("📋 Delete response:", data);

      if (response.ok && (data.success || data.message)) {
        toast.success("Newsletter eliminado exitosamente");
        router.push("/dashboard/newsletters");
      } else {
        toast.error(data.error || "Error al eliminar newsletter");
      }
    } catch (error) {
      console.error("❌ Error deleting newsletter:", error);
      toast.error("Error al eliminar newsletter");
    } finally {
      setLoading(false);
    }
  };

  const isDraft = newsletter.status === "draft";

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Acciones</h3>
          <p className="text-sm text-gray-600">
            {isDraft
              ? "Envía este newsletter a todos los suscriptores"
              : `Enviado ${newsletter.sentCount || 0} vez${newsletter.sentCount !== 1 ? "(ces)" : ""}. Último envío: ${newsletter.sentAt ? new Date(newsletter.sentAt).toLocaleDateString("es-ES") : "N/A"}`}
          </p>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          {isDraft ? (
            <button
              className="bg-gradient-to-br from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={() => handleSendClick(false)}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar Newsletter
                </>
              )}
            </button>
          ) : (
            <button
              className="bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={() => handleSendClick(true)}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Reenviando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reenviar Newsletter
                </>
              )}
            </button>
          )}
          
          <button
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={handleDelete}
            disabled={loading || newsletter.status === "sent"}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      {/* Modal de confirmación de envío/reenvío */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={handleCancelSend}
          ></div>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative z-10">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {isResend ? "¿Reenviar Newsletter?" : "¿Enviar Newsletter?"}
            </h3>
            <p className="text-gray-600 mb-6">
              {isResend ? (
                <>
                  ¿Estás seguro de que quieres <strong className="text-gray-800">REENVIAR</strong> este newsletter a todos los suscriptores?
                  <br /><br />
                  Este newsletter ya fue enviado <strong className="text-gray-800">{newsletter.sentCount || 0} vez{newsletter.sentCount !== 1 ? "(ces)" : ""}</strong>.
                </>
              ) : (
                <>¿Estás seguro de que quieres enviar este newsletter a todos los suscriptores?</>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancelSend}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSend}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  isResend 
                    ? "bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] hover:shadow-lg"
                    : "bg-gradient-to-br from-green-600 to-green-700 hover:shadow-lg"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isResend ? "Reenviando..." : "Enviando..."}
                  </>
                ) : (
                  <>
                    {isResend ? "Sí, reenviar" : "Sí, enviar"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

