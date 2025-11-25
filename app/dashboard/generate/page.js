"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [approvedArticles, setApprovedArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [category, setCategory] = useState("startups");
  const [country, setCountry] = useState("mx");
  const [newsSources, setNewsSources] = useState(["newsdata"]); // Array of selected sources
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingApproved, setLoadingApproved] = useState(false);

  // Toggle news source
  const toggleNewsSource = (source) => {
    setNewsSources((prev) => {
      if (prev.includes(source)) {
        return prev.filter((s) => s !== source);
      } else {
        return [...prev, source];
      }
    });
  };

  // Fetch approved articles from contributors
  const fetchApprovedArticles = async () => {
    setLoadingApproved(true);
    try {
      const response = await fetch("/api/article-suggestions?status=approved");
      const data = await response.json();
      
      if (data.suggestions) {
        // Convert approved articles to the format expected by the newsletter generator
        const formattedArticles = data.suggestions.map((suggestion) => ({
          title: suggestion.title,
          description: suggestion.description || suggestion.summary?.replace(/<[^>]*>/g, "").substring(0, 200),
          summary: suggestion.summary, // HTML content
          url: suggestion.url && suggestion.url.trim() ? suggestion.url.trim() : undefined, // Only include url if it exists and is not empty
          source: suggestion.source || "Colaborador",
          image: suggestion.image,
          titleColor: suggestion.titleColor || "#2b3e81",
          isApprovedArticle: true, // Flag to identify approved articles
          suggestionId: suggestion._id || suggestion.id,
        }));
        setApprovedArticles(formattedArticles);
        toast.success(`${formattedArticles.length} artículo${formattedArticles.length !== 1 ? 's' : ''} aprobado${formattedArticles.length !== 1 ? 's' : ''} cargado${formattedArticles.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error("Error fetching approved articles:", error);
      toast.error("Error al cargar artículos aprobados");
    } finally {
      setLoadingApproved(false);
    }
  };

  // Fetch news from selected sources
  const fetchNews = async () => {
    setLoading(true);
    setArticles([]);
    setSelectedArticles([]);

    try {
      const allArticles = [];

      // Fetch from all selected sources
      for (const source of newsSources) {
        let endpoint;
        
        if (source === "newsdata") {
          endpoint = `/api/test-newsdata?category=${category}&country=${country}`;
        } else if (source === "newsapi") {
          endpoint = `/api/test-news?category=${category}&country=${country}`;
        } else if (source === "hackernews") {
          endpoint = `/api/test-hackernews?limit=10&category=${category}&country=${country}`;
        } else         if (source === "techcrunch") {
          endpoint = `/api/test-techcrunch?limit=10&category=${category}&country=${country}`;
        } else if (source === "entrepreneur") {
          endpoint = `/api/test-entrepreneur-es?limit=10&category=${category}`;
        } else if (source === "expansion") {
          endpoint = `/api/test-expansion?limit=10&category=${category}`;
        } else if (source === "noro") {
          endpoint = `/api/test-noro?limit=30&category=${category}`;
        } else if (source === "referente") {
          endpoint = `/api/test-referente?limit=30&category=${category}`;
        } else if (source === "startuplinks") {
          endpoint = `/api/test-startuplinks?limit=30&category=${category}`;
        }

        if (endpoint) {
          const response = await fetch(endpoint);
          const data = await response.json();

          if (data.success && data.articles) {
            allArticles.push(...data.articles);
          }
        }
      }

      // Remove duplicates based on URL
      const uniqueArticles = Array.from(
        new Map(allArticles.map(article => [article.url, article])).values()
      );

      setArticles(uniqueArticles);
      
      if (uniqueArticles.length === 0) {
        toast.error("No se encontraron artículos. Intenta con otra categoría.");
      } else {
        toast.success(`Se obtuvieron ${uniqueArticles.length} artículos`);
      }
    } catch (error) {
      toast.error("Error al obtener noticias");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle article selection
  // Index format: "news-{index}" for news articles, "approved-{index}" for approved articles
  const toggleArticle = (type, index) => {
    const articleKey = `${type}-${index}`;
    if (selectedArticles.includes(articleKey)) {
      setSelectedArticles(selectedArticles.filter((key) => key !== articleKey));
    } else {
      setSelectedArticles([...selectedArticles, articleKey]);
    }
  };

  // Get selected articles data
  const getSelectedArticlesData = () => {
    return selectedArticles.map((key) => {
      const [type, index] = key.split("-");
      const idx = parseInt(index);
      if (type === "approved") {
        return approvedArticles[idx];
      } else {
        return articles[idx];
      }
    });
  };

  // Generate newsletter with GPT
  const generateNewsletter = async () => {
    if (selectedArticles.length === 0) {
      toast.error("Selecciona al menos un artículo");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedArticles: getSelectedArticlesData(),
          category,
          country,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Newsletter generado exitosamente!");
        // Redirect to newsletter detail page
        window.location.href = `/dashboard/newsletters/${data.newsletter.id}`;
      } else {
        toast.error(data.error || "Error al generar newsletter");
      }
    } catch (error) {
      toast.error("Error al generar newsletter");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Generar Newsletter
        </h1>
        <p className="text-gray-600">
          Obtén noticias de News API y genera un newsletter con IA
        </p>
      </div>

      {/* Source Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-semibold text-gray-700">
            Fuentes de noticias:
          </label>
          <div className="flex gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2b3e81] border-gray-300 rounded focus:ring-[#2b3e81] focus:ring-2 cursor-pointer"
                  checked={newsSources.includes("newsdata")}
                  onChange={() => toggleNewsSource("newsdata")}
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">NewsData.io</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2b3e81] border-gray-300 rounded focus:ring-[#2b3e81] focus:ring-2 cursor-pointer"
                  checked={newsSources.includes("newsapi")}
                  onChange={() => toggleNewsSource("newsapi")}
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">News API</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2b3e81] border-gray-300 rounded focus:ring-[#2b3e81] focus:ring-2 cursor-pointer"
                  checked={newsSources.includes("hackernews")}
                  onChange={() => toggleNewsSource("hackernews")}
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">Hacker News</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2b3e81] border-gray-300 rounded focus:ring-[#2b3e81] focus:ring-2 cursor-pointer"
                  checked={newsSources.includes("techcrunch")}
                  onChange={() => toggleNewsSource("techcrunch")}
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">TechCrunch</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2b3e81] border-gray-300 rounded focus:ring-[#2b3e81] focus:ring-2 cursor-pointer"
                  checked={newsSources.includes("entrepreneur")}
                  onChange={() => toggleNewsSource("entrepreneur")}
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">📰 Entrepreneur Español</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2b3e81] border-gray-300 rounded focus:ring-[#2b3e81] focus:ring-2 cursor-pointer"
                  checked={newsSources.includes("expansion")}
                  onChange={() => toggleNewsSource("expansion")}
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">📊 Expansión</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2b3e81] border-gray-300 rounded focus:ring-[#2b3e81] focus:ring-2 cursor-pointer"
                  checked={newsSources.includes("noro")}
                  onChange={() => toggleNewsSource("noro")}
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">🌵 Noro.mx</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2b3e81] border-gray-300 rounded focus:ring-[#2b3e81] focus:ring-2 cursor-pointer"
                  checked={newsSources.includes("referente")}
                  onChange={() => toggleNewsSource("referente")}
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">📰 Referente.mx</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2b3e81] border-gray-300 rounded focus:ring-[#2b3e81] focus:ring-2 cursor-pointer"
                  checked={newsSources.includes("startuplinks")}
                  onChange={() => toggleNewsSource("startuplinks")}
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">🚀 Startuplinks.world</span>
              </label>
            </div>
          </div>
      </div>

      {/* Controls Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Seleccionar Fuentes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81] focus:border-transparent bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              <option value="technology">🚀 Tecnología</option>
              <option value="business">💼 Negocios / Emprendimiento</option>
              <option value="startups">📰 Startups</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              País
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b3e81] focus:border-transparent bg-white"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={loading}
            >
              <option value="mx">🇲🇽 México</option>
              <option value="us">🇺🇸 Estados Unidos</option>
              <option value="ar">🇦🇷 Argentina</option>
              <option value="br">🇧🇷 Brasil</option>
              <option value="es">🇪🇸 España</option>
              <option value="gb">🇬🇧 Reino Unido</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className="bg-gradient-to-br from-[#2b3e81] to-[#4d6fff] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1"
            onClick={fetchNews}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Obteniendo noticias...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Obtener Noticias
              </>
            )}
          </button>
          <button
            className="bg-gradient-to-br from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1"
            onClick={fetchApprovedArticles}
            disabled={loadingApproved}
          >
            {loadingApproved ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando...
              </>
            ) : (
              <>
                ✅ Cargar Artículos Aprobados
              </>
            )}
          </button>
        </div>

        {selectedArticles.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="text-blue-800 font-medium">
              {selectedArticles.length} artículo{selectedArticles.length !== 1 ? 's' : ''} seleccionado{selectedArticles.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Approved Articles List */}
      {approvedArticles.length > 0 && (
        <>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ✅ Artículos Aprobados ({approvedArticles.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-6">
            {approvedArticles.map((article, index) => {
              const articleKey = `approved-${index}`;
              const isSelected = selectedArticles.includes(articleKey);
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                  onClick={() => toggleArticle("approved", index)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        checked={isSelected}
                        onChange={() => toggleArticle("approved", index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <h3 
                          className="font-bold text-base"
                          style={{ color: article.titleColor || "#2b3e81" }}
                        >
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600 flex-shrink-0">
                          {article.source && <span>📰 {article.source}</span>}
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">✅ Aprobado</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Articles List */}
      {articles.length > 0 && (
        <>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Artículos Disponibles ({articles.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {articles.map((article, index) => {
              const articleKey = `news-${index}`;
              const isSelected = selectedArticles.includes(articleKey);
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#2b3e81] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                  onClick={() => toggleArticle("news", index)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-[#2b3e81] border-gray-300 rounded focus:ring-[#2b3e81] focus:ring-2 mt-1"
                        checked={isSelected}
                        onChange={() => toggleArticle("news", index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 text-gray-800">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {article.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📰 {article.source}</span>
                          <span>🔗 {(() => {
                            try {
                              return new URL(article.url).hostname;
                            } catch (e) {
                              return article.url || 'Unknown';
                            }
                          })()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Generate Button - Single button at the end */}
      {selectedArticles.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            className="bg-gradient-to-br from-green-600 to-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            onClick={generateNewsletter}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              <>
                🤖 Generar Newsletter con IA
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
