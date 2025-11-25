"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import ArticleEditor from "./ArticleEditor";

export default function ArticleCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const articleId = searchParams?.get("id");

  useEffect(() => {
    console.log("🔄 useEffect triggered, articleId:", articleId);
    if (articleId) {
      console.log("📝 Fetching article for ID:", articleId);
      fetchArticle(articleId);
    } else {
      console.log("⚠️ No articleId found in URL params");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  const fetchArticle = async (id) => {
    try {
      setLoading(true);
      console.log("🔍 Fetching article with ID:", id);
      
      if (!id) {
        console.error("❌ No article ID provided");
        toast.error("ID de artículo no válido");
        router.push("/contributor");
        return;
      }

      const response = await fetch(`/api/article-suggestions/${id}`);
      console.log("📥 Response status:", response.status, response.statusText);
      
      const data = await response.json();
      console.log("📥 Response data:", data);
      
      if (!response.ok) {
        // Handle HTTP errors
        const errorMessage = data.error || `Error ${response.status}: ${response.statusText}`;
        console.error("❌ API Error:", errorMessage);
        
        if (response.status === 404) {
          toast.error("Artículo no encontrado");
        } else if (response.status === 403) {
          toast.error("No tienes permiso para ver este artículo");
        } else if (response.status === 401) {
          toast.error("Debes iniciar sesión");
        } else {
          toast.error(errorMessage);
        }
        
        router.push("/contributor");
        return;
      }
      
      if (data.success && data.suggestion) {
        console.log("✅ Article loaded successfully:", data.suggestion.title);
        setEditingArticle(data.suggestion);
      } else {
        console.error("❌ Invalid response format:", data);
        toast.error("Error al cargar el artículo: Formato de respuesta inválido");
        router.push("/contributor");
      }
    } catch (error) {
      console.error("❌ Error fetching article:", error);
      toast.error(`Error al cargar el artículo: ${error.message}`);
      router.push("/contributor");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (articleData) => {
    try {
      // Si estamos editando, articleData es un objeto único
      // Si estamos creando, articleData es un array de artículos
      const isMultipleArticles = Array.isArray(articleData);

      if (editingArticle) {
        // Editar un artículo existente
        const articleId = editingArticle._id || editingArticle.id;
        console.log("💾 Saving article with ID:", articleId);
        const response = await fetch(`/api/article-suggestions/${articleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          toast.success("Artículo actualizado exitosamente");
          router.push("/contributor");
        } else {
          throw new Error(data.error || "Error al guardar artículo");
        }
      } else if (isMultipleArticles) {
        // Crear múltiples artículos
        const promises = articleData.map((article) =>
          fetch("/api/article-suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(article),
          })
        );

        const responses = await Promise.all(promises);
        const results = await Promise.all(responses.map((r) => r.json()));

        const successCount = results.filter((r) => r.success).length;
        const failCount = results.length - successCount;

        if (failCount === 0) {
          toast.success(`${successCount} artículo${successCount > 1 ? "s" : ""} creado${successCount > 1 ? "s" : ""} exitosamente`);
          router.push("/contributor");
        } else {
          toast.error(`${failCount} artículo${failCount > 1 ? "s" : ""} no pudo${failCount > 1 ? "ron" : ""} ser creado${failCount > 1 ? "s" : ""}`);
        }
      } else {
        // Crear un solo artículo (fallback)
        const response = await fetch("/api/article-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articleData),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Artículo creado exitosamente");
          router.push("/contributor");
        } else {
          throw new Error(data.error || "Error al guardar artículo");
        }
      }
    } catch (error) {
      console.error("Error saving article(s):", error);
      const errorMessage = error.message || "Error al guardar artículo(s)";
      toast.error(errorMessage);
      // Don't throw the error to prevent the form from showing an error state
      // The user already sees the toast notification
    }
  };

  const handleCancel = () => {
    router.push("/contributor");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b3e81]"></div>
          <p className="mt-4 text-gray-600">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {editingArticle ? "Editar Artículo" : "Crear Nuevo Artículo"}
        </h1>
        <p className="text-gray-600">
          {editingArticle 
            ? "Modifica los datos de tu artículo" 
            : "Completa el formulario para enviar un nuevo artículo al newsletter"}
        </p>
      </div>
      <ArticleEditor
        onSave={handleSave}
        onCancel={handleCancel}
        initialData={editingArticle}
      />
    </div>
  );
}
