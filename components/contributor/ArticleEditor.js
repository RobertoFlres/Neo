"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import { ImageUploader } from "@/components/dashboard/ImageUploader";

// Estructura de un artículo
const createEmptyArticle = () => ({
  title: "",
  summary: "",
  image: "",
  source: "",
  url: "",
});

export default function ArticleEditor({ onSave, onCancel, initialData }) {
  // Si estamos editando un artículo existente, solo mostramos uno
  // Si no, permitimos múltiples artículos
  const isEditing = !!initialData;
  
  const [articles, setArticles] = useState(
    initialData ? [{
      title: initialData.title || "",
      summary: initialData.summary || "",
      image: initialData.image || "",
      source: initialData.source || "",
      url: initialData.url || "",
    }] : [createEmptyArticle()]
  );
  const [saving, setSaving] = useState(false);

  const handleArticleChange = (index, field, value) => {
    const newArticles = [...articles];
    newArticles[index] = {
      ...newArticles[index],
      [field]: value,
    };
    setArticles(newArticles);
  };

  const handleAddArticle = () => {
    setArticles([...articles, createEmptyArticle()]);
    // Scroll to the new article after a brief delay
    setTimeout(() => {
      const newIndex = articles.length;
      document.getElementById(`article-${newIndex}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  const handleRemoveArticle = (index) => {
    if (articles.length === 1) {
      toast.error("Debes tener al menos un artículo");
      return;
    }
    if (confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      setArticles(articles.filter((_, i) => i !== index));
    }
  };

  const validateArticle = (article, index) => {
    if (!article.title.trim()) {
      toast.error(`El título del artículo ${index + 1} es obligatorio`);
      return false;
    }
    if (!article.summary.trim()) {
      toast.error(`La descripción del artículo ${index + 1} es obligatoria`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los artículos
    for (let i = 0; i < articles.length; i++) {
      if (!validateArticle(articles[i], i)) {
        // Scroll to the invalid article
        document.getElementById(`article-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    setSaving(true);

    try {
      if (isEditing) {
        // Si estamos editando, guardar solo el primer artículo
        const articleData = {
          title: articles[0].title.trim(),
          description: articles[0].summary.replace(/<[^>]*>/g, "").substring(0, 200),
          summary: articles[0].summary,
          image: articles[0].image || undefined, // Send undefined instead of empty string
          source: articles[0].source || "Contribuidor",
          url: articles[0].url?.trim() || undefined, // Send undefined instead of empty string
        };
        await onSave(articleData);
      } else {
        // Si estamos creando, guardar todos los artículos
        const articlesData = articles.map((article) => ({
          title: article.title.trim(),
          description: article.summary.replace(/<[^>]*>/g, "").substring(0, 200),
          summary: article.summary,
          image: article.image,
          source: article.source || "Contribuidor",
          url: article.url?.trim() || undefined, // Send undefined instead of empty string
        }));
        await onSave(articlesData);
      }
    } catch (error) {
      console.error("Error saving articles:", error);
      // Error message is handled in ArticleCreatePage
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {articles.map((article, index) => (
        <div key={index} id={`article-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? "Editar Artículo" : `Artículo ${index + 1}`}
            </h2>
            {!isEditing && articles.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveArticle(index)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar artículo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Título */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título del Artículo *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81] focus:border-transparent text-xl font-bold"
              placeholder="Ej: Nueva tecnología revoluciona el mercado"
              value={article.title}
              onChange={(e) => handleArticleChange(index, "title", e.target.value)}
              required
            />
          </div>

          {/* Descripción/Resumen con RichTextEditor */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción/Resumen *
            </label>
            <RichTextEditor
              value={article.summary}
              onChange={(value) => handleArticleChange(index, "summary", value)}
              placeholder="Escribe una descripción completa del artículo. Puedes usar formato, negritas, listas, etc."
              height="300px"
            />
            <p className="text-xs text-gray-500 mt-2">
              Este será el contenido que aparecerá en el newsletter
            </p>
          </div>

          {/* Imagen */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagen (opcional)
            </label>
            <ImageUploader
              currentImage={article.image}
              onImageUpload={(imageUrl) => handleArticleChange(index, "image", imageUrl)}
              folder="contributor-articles"
            />
            {article.image && (
              <div className="mt-2">
                <Image
                  src={article.image}
                  alt="Preview"
                  width={400}
                  height={250}
                  unoptimized
                  className="max-w-xs rounded-lg border border-gray-300 object-cover"
                />
              </div>
            )}
          </div>

          {/* Fuente (opcional) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fuente (opcional)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81] focus:border-transparent"
              placeholder="Ej: TechCrunch, Product Hunt, etc."
              value={article.source}
              onChange={(e) => handleArticleChange(index, "source", e.target.value)}
            />
          </div>

          {/* URL del artículo (opcional) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Link del artículo (opcional)
            </label>
            <input
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81] focus:border-transparent"
              placeholder="https://ejemplo.com/articulo"
              value={article.url}
              onChange={(e) => handleArticleChange(index, "url", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2">
              Si no proporcionas un link, no aparecerá el botón "Ver más" en el newsletter
            </p>
          </div>
        </div>
      ))}

      {/* Botón para agregar más artículos (solo si no estamos editando) */}
      {!isEditing && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleAddArticle}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#2b3e81] hover:text-[#2b3e81] transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Agregar Más Artículos
          </button>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={saving}
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEditing ? "Guardar Artículo" : `Guardar ${articles.length} Artículo${articles.length > 1 ? "s" : ""}`}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
