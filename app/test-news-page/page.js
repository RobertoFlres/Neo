"use client";

import { useState } from "react";

export default function TestNewsPage() {
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("technology");
  const [country, setCountry] = useState("us");

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    setArticles([]);

    try {
      const response = await fetch(
        `/api/test-news?category=${category}&country=${country}`
      );
      const data = await response.json();

      if (data.success) {
        setArticles(data.articles);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">News API Test</h1>

      {/* Controls */}
      <div className="card bg-base-200 mb-6">
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Categoría</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="entertainment">Entertainment</option>
                <option value="health">Health</option>
                <option value="science">Science</option>
                <option value="sports">Sports</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">País</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="us">Estados Unidos</option>
                <option value="mx">México</option>
                <option value="ar">Argentina</option>
                <option value="br">Brasil</option>
                <option value="es">España</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary mt-4"
            onClick={fetchNews}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Cargando...
              </>
            ) : (
              "Obtener Noticias"
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {articles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            Resultados ({articles.length})
          </h2>
          {articles.map((article, index) => (
            <div key={index} className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">{article.title}</h3>
                <p className="text-sm opacity-80">{article.description}</p>
                <div className="card-actions justify-end mt-2">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                  >
                    Leer más
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

