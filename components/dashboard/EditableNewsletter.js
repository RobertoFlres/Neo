"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import { CopyArticleButton } from "./CopyArticleButton";
import { ImageUploader } from "./ImageUploader";
import RichTextEditor from './RichTextEditor';
import config from "@/config";

const BRAND_COLORS = [
  { name: "Azul Oscuro", value: "#2b3e81", bg: "bg-[#2b3e81]", text: "text-white" },
  { name: "Azul Principal", value: "#5366b9", bg: "bg-[#5366b9]", text: "text-white" },
  { name: "Azul Muy Oscuro", value: "#111a37", bg: "bg-[#111a37]", text: "text-white" },
  { name: "Gris Claro", value: "#eeeced", bg: "bg-[#eeeced]", text: "text-gray-900" },
  { name: "Beige Claro", value: "#efe4d1", bg: "bg-[#efe4d1]", text: "text-gray-900" },
];

export function EditableNewsletter({ newsletter, onUpdate, editing, setEditing, saving, setSaving, EditButtons }) {
  const [title, setTitle] = useState(newsletter.title || "");
  const [summary, setSummary] = useState(newsletter.content?.summary || "");
  const [articles, setArticles] = useState(newsletter.content?.articles || []);
  
  // Preserve the newsletter ID
  const newsletterId = newsletter._id || newsletter.id;

  const prevNewsletterRef = useRef(null);
  
  useEffect(() => {
    // Only update if newsletter ID actually changed (new newsletter loaded)
    const newsletterId = newsletter._id || newsletter.id;
    const prevId = prevNewsletterRef.current;
    
    if (prevId !== newsletterId) {
      const newTitle = newsletter.title || "";
      const newSummary = newsletter.content?.summary || "";
      const newArticles = newsletter.content?.articles || [];
      
      // Use functional updates to avoid stale closures
      setTitle(newTitle);
      setSummary(newSummary);
      setArticles(newArticles);
      prevNewsletterRef.current = newsletterId;
      
      console.log("📋 Newsletter data loaded:", {
        articlesCount: newArticles.length,
        articlesWithImages: newArticles.filter(a => a.image).length
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsletter._id, newsletter.id]);

  const handleSave = async () => {
    if (!setSaving) return;
    
    setSaving(true);
    try {
      console.log("📝 Saving newsletter with articles:", articles.map(a => ({ 
        title: a.title, 
        hasImage: !!a.image,
        imageLength: a.image?.length || 0
      })));
      
      const payload = {
        title: title,
        status: newsletter.status,
        content: {
          summary,
          articles,
        },
      };
      
      console.log("📤 Sending payload:", JSON.stringify(payload, null, 2).substring(0, 500));
      
      const response = await fetch(`/api/newsletter/${newsletter._id || newsletter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("✅ Save response:", data);

      if (response.ok) {
        toast.success("Newsletter actualizado exitosamente");
        setEditing(false);
        if (onUpdate) onUpdate();
        // Refresh the page to reload data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(data.error || "Error al actualizar newsletter");
      }
    } catch (error) {
      console.error("❌ Error saving newsletter:", error);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleArticleChange = useCallback((index, field, value) => {
    setArticles(prevArticles => {
      // Only update if the value actually changed
      const currentValue = prevArticles[index]?.[field];
      if (currentValue === value) {
        return prevArticles; // No change, return same array reference
      }
      
      const updatedArticles = [...prevArticles];
      updatedArticles[index] = {
        ...updatedArticles[index],
        [field]: value,
      };
      return updatedArticles;
    });
  }, []);

  const handleImageUpload = useCallback((index, imageUrl) => {
    console.log(`📸 Image uploaded for article ${index}, URL:`, imageUrl);
    handleArticleChange(index, "image", imageUrl);
  }, [handleArticleChange]);

  // Memoize summary onChange to prevent loops
  const handleSummaryChange = useCallback((value) => {
    setSummary(value);
  }, []);

  const handleDeleteArticle = async (index) => {
    if (confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      const updatedArticles = articles.filter((_, i) => i !== index);
      setArticles(updatedArticles);
      
      // Auto-save on delete
      const response = await fetch(`/api/newsletter/${newsletter._id || newsletter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          status: newsletter.status,
          content: {
            summary,
            articles: updatedArticles,
          },
        }),
      });

      if (response.ok) {
        toast.success("Artículo eliminado");
        if (onUpdate) onUpdate();
        window.location.reload();
      }
    }
  };

  // Insert buttons into page header
  useEffect(() => {
    if (EditButtons) {
      const buttonsContainer = document.querySelector('[data-header-right]');
      if (buttonsContainer) {
        const badge = buttonsContainer.querySelector('.badge');
        buttonsContainer.innerHTML = badge ? badge.outerHTML : '';
        const tempDiv = document.createElement('div');
        tempDiv.id = 'dynamic-buttons';
        buttonsContainer.appendChild(tempDiv);
        
        // This will be handled by the wrapper component
      }
    }
  }, [EditButtons, editing]);

  return (
    <div className="space-y-6">
      {/* Buttons in separate row */}
      {EditButtons && (
        <div className="flex justify-end mb-4">
          {EditButtons({ editing, setEditing })}
        </div>
      )}

      {/* Save button when editing */}
      {editing && (
        <div className="flex justify-end max-w-3xl mx-auto">
          <button
            onClick={handleSave}
            className="btn btn-success btn-sm"
            disabled={saving}
          >
            {saving ? "💾 Guardando..." : "💾 Guardar Cambios"}
          </button>
        </div>
      )}

      {/* Newsletter Content */}
      <div className="bg-white max-w-3xl mx-auto shadow-lg rounded-lg p-8 prose prose-lg max-w-none">
        {/* Title Editor (when editing) */}
        {editing && (
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              📝 Título del Newsletter
            </label>
            <input
              type="text"
              className="input input-bordered w-full text-xl font-bold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Newsletter Startups - 11/4/2025"
            />
          </div>
        )}

        {/* Newsletter Header */}
        <div className="border-b-2 border-[#2b3e81] pb-4 mb-6" style={{
          backgroundImage: 'url(/Fondo2.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#2b3e81',
          padding: '30px 20px',
          borderRadius: '8px 8px 0 0'
        }}>
          {/* Date - Top Right */}
          <div className="text-right mb-4">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
              {newsletter.date 
                ? new Date(newsletter.date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Sin fecha"}
            </p>
          </div>
          {/* Logo - Centered */}
          <div className="flex items-center justify-center">
            <Image src="/logonuevo2.png" alt="neo" width={320} height={128} priority className="h-32 w-auto" />
          </div>
          {/* Title Display */}
          {!editing && title && (
            <div className="text-center mt-4">
              <h1 className="text-3xl font-bold" style={{ color: 'white' }}>
                {title}
              </h1>
            </div>
          )}
        </div>

        {/* Main Summary */}
        {editing ? (
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2">Resumen del Día</label>
            <RichTextEditor
              key="main-summary"
              value={summary || ""}
              onChange={handleSummaryChange}
              placeholder="Escribe el resumen del día..."
              height="300px"
            />
          </div>
        ) : (
          <div className="mb-8 text-gray-800">
            <div 
              className="text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          </div>
        )}

        {/* Gray separator line */}
        {summary && articles.length > 0 && (
          <div className="border-b border-[#eeeced] mb-8"></div>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <div className="space-y-10">
            {articles.map((article, index) => (
              <div key={index} className="pb-8 border-b border-[#eeeced] last:border-0 last:pb-0">
                {/* Title and Actions */}
                <div className="mb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {editing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            className="input input-bordered w-full text-2xl font-bold h-auto py-3"
                            value={article.title}
                            onChange={(e) => handleArticleChange(index, "title", e.target.value)}
                            placeholder="Título del artículo"
                          />
                          <div>
                            <label className="block text-xs font-semibold mb-2 text-gray-600">
                              Color del título:
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              {BRAND_COLORS.map((color) => (
                                <button
                                  key={color.value}
                                  type="button"
                                  onClick={() => handleArticleChange(index, "titleColor", color.value)}
                                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                    article.titleColor === color.value
                                      ? "border-gray-900 scale-110"
                                      : "border-gray-300 hover:border-gray-500"
                                  } ${color.bg}`}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <h2 
                          className="text-2xl font-bold leading-tight pr-4"
                          style={{ color: article.titleColor || "#2b3e81" }}
                        >
                          {article.title}
                        </h2>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {editing && (
                        <button
                          onClick={() => handleDeleteArticle(index)}
                          className="btn btn-sm btn-error"
                          title="Eliminar artículo"
                        >
                          🗑️
                        </button>
                      )}
                      <CopyArticleButton article={article} />
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="mb-6">
                  {editing && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        📷 Imagen del artículo
                      </label>
                      <ImageUploader
                        currentImage={article.image}
                        onImageUpload={(imageUrl) => {
                          console.log(`📸 Image uploaded for article ${index}, length: ${imageUrl?.length}`);
                          handleImageUpload(index, imageUrl);
                        }}
                      />
                    </div>
                  )}
                  {!editing && article.image && (
                    <div className="mb-4 flex justify-center">
                      <Image
                        src={article.image}
                        alt={article.title}
                        width={600}
                        height={400}
                        unoptimized
                        className="max-w-[600px] max-h-[400px] w-auto h-auto object-contain rounded-lg"
                        onError={(e) => console.error("❌ Error loading image:", e)}
                      />
                    </div>
                  )}
                </div>

                {/* Summary Content */}
                <div className="mb-6">
                  {editing ? (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        📝 Resumen del artículo
                      </label>
                  <RichTextEditor
                    key={`article-${index}-summary`}
                    value={article.summary || ""}
                    onChange={(value) => {
                      handleArticleChange(index, "summary", value);
                    }}
                    placeholder="Escribe el resumen del artículo..."
                    height="250px"
                  />
                    </div>
                  ) : (
                    <div 
                      className="text-base text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: article.summary }}
                    />
                  )}
                </div>

                {/* Ver Artículo Button */}
                {(article.url || article.sourceUrl || article.link) && (
                  <div className="mt-4 mb-6 text-right">
                    <a
                      href={article.url || article.sourceUrl || article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-[#2b3e81] transition-colors duration-200 underline"
                    >
                      Ver más
                    </a>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8" style={{ 
          background: 'linear-gradient(135deg, #2b3e81 0%, #4d6fff 100%)', 
          padding: '40px 20px', 
          borderRadius: '0 0 8px 8px' 
        }}>
          {/* Logo */}
          <div className="text-center mb-5">
            <Image src="/logonuevo2.png" alt={config.appName} width={200} height={60} priority style={{ height: '60px', width: 'auto', maxWidth: '200px', display: 'block', margin: '0 auto' }} />
          </div>
          
          {/* Tagline */}
          <div className="text-center mb-6" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
            Un boletín de noticias para emprendedores
          </div>
          
          {/* Social Media Links */}
          <div className="text-center mb-6" style={{ margin: '25px 0' }}>
            {config.social?.instagram && (
              <a 
                href={config.social.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mx-2"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '50%', 
                  textDecoration: 'none',
                  verticalAlign: 'middle',
                  lineHeight: '40px'
                }}
                >
                <Image 
                  src={config.social?.instagramIconUrl || "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg"} 
                  alt="Instagram" 
                  width={20}
                  height={20}
                  unoptimized
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    display: 'block', 
                    margin: '10px auto' 
                  }} 
                />
              </a>
            )}
            {config.social?.linkedin && (
              <a 
                href={config.social.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mx-2"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '50%', 
                  textDecoration: 'none',
                  verticalAlign: 'middle',
                  lineHeight: '40px'
                }}
                >
                <Image 
                  src={config.social?.linkedinIconUrl || "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg"} 
                  alt="LinkedIn" 
                  width={20}
                  height={20}
                  unoptimized
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    display: 'block', 
                    margin: '10px auto' 
                  }} 
                />
              </a>
            )}
          </div>
          
          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '25px 0' }}></div>
          
          {/* Info */}
          <div className="text-center text-sm" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '13px', marginBottom: '15px', lineHeight: '1.6' }}>
            <p>Recibiste este email porque te suscribiste a nuestro newsletter</p>
          </div>
          
          {/* Unsubscribe */}
          <div className="text-center mt-5">
            <a 
              href="#" 
              className="underline text-xs"
              style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px' }}
            >
              Darse de baja
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
