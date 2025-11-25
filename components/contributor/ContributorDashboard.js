"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import ArticleEditor from "./ArticleEditor";

export default function ContributorDashboard() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch("/api/article-suggestions?userOnly=true");
      const data = await response.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticle = async (articleData) => {
    try {
      const method = editingArticle ? "PUT" : "POST";
      const url = editingArticle 
        ? `/api/article-suggestions/${editingArticle._id}`
        : "/api/article-suggestions";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: articleData.title,
          url: articleData.url,
          description: articleData.description,
          summary: articleData.summary,
          image: articleData.image,
          titleColor: articleData.titleColor,
          source: articleData.source,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowEditor(false);
        setEditingArticle(null);
        fetchSuggestions();
        return data;
      } else {
        throw new Error(data.error || "Error al guardar artículo");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      throw error;
    }
  };

  const handleEdit = (suggestion) => {
    if (suggestion.status !== "pending") {
      toast.error("Solo puedes editar artículos pendientes");
      return;
    }
    setEditingArticle(suggestion);
    setShowEditor(true);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingArticle(null);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "badge-warning",
      approved: "badge-success",
      rejected: "badge-error",
    };
    return (
      <span className={`badge ${styles[status] || "badge-ghost"}`}>
        {status === "pending" && "⏳ Pendiente"}
        {status === "approved" && "✅ Aprobado"}
        {status === "rejected" && "❌ Rechazado"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Contribuir Artículos</h1>
              <p className="text-sm opacity-60 mt-1">
                Crea y envía artículos para el newsletter
              </p>
            </div>
            <Link href="/" className="btn btn-ghost btn-sm">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón para crear nuevo artículo */}
        {!showEditor && (
          <div className="mb-6">
            <button
              onClick={() => setShowEditor(true)}
              className="btn btn-primary"
            >
              ➕ Crear Nuevo Artículo
            </button>
          </div>
        )}

        {/* Editor de Artículos */}
        {showEditor && (
          <div className="mb-8">
            <ArticleEditor
              onSave={handleSaveArticle}
              onCancel={handleCancel}
              initialData={editingArticle}
            />
          </div>
        )}

        {/* Lista de Artículos Sugeridos */}
        {!showEditor && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title mb-4">Mis Artículos</h2>
              {loading ? (
                <div className="text-center py-8">
                  <span className="loading loading-spinner"></span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  <p className="text-lg mb-2">No has creado artículos aún</p>
                  <p className="text-sm">Haz clic en &ldquo;Crear Nuevo Artículo&rdquo; para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion._id}
                      className="card bg-base-100 border border-base-300"
                    >
                      <div className="card-body">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3
                                className="font-bold text-lg"
                                style={{ color: suggestion.titleColor || "#2b3e81" }}
                              >
                                {suggestion.title}
                              </h3>
                              {getStatusBadge(suggestion.status)}
                            </div>
                            
                            {suggestion.image && (
                              <Image
                                src={suggestion.image}
                                alt={suggestion.title}
                                width={600}
                                height={350}
                                unoptimized
                                className="max-w-xs rounded-lg mb-3 object-cover"
                              />
                            )}

                            {suggestion.summary && (
                              <div
                                className="text-sm opacity-80 mb-3"
                                dangerouslySetInnerHTML={{ __html: suggestion.summary }}
                              />
                            )}

                            <div className="flex items-center gap-4 text-xs opacity-60">
                              <span>
                                📅{" "}
                                {new Date(suggestion.createdAt).toLocaleDateString("es-ES")}
                              </span>
                              <a
                                href={suggestion.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary"
                              >
                                Ver artículo original →
                              </a>
                            </div>
                          </div>
                        </div>

                        {suggestion.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(suggestion)}
                              className="btn btn-sm btn-ghost"
                            >
                              ✏️ Editar
                            </button>
                          </div>
                        )}

                        {suggestion.status === "approved" && (
                          <div className="alert alert-success">
                            <span>✅ Este artículo ha sido aprobado y aparecerá en el newsletter</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
