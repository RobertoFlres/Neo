"use client";

import Image from "next/image";
import config from "@/config";

export function NewsletterPreviewModal({ newsletter, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Vista Previa del Newsletter</h2>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-8 bg-gray-50">
            <div className="bg-white max-w-3xl mx-auto shadow-lg rounded-lg p-8">
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
              </div>

              {/* Main Summary */}
              {newsletter.content?.summary && (
                <div className="mb-8 text-gray-800">
                  <div 
                    className="text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: newsletter.content.summary }}
                  />
                </div>
              )}

              {/* Gray separator line */}
              {newsletter.content?.summary && newsletter.content?.articles && newsletter.content.articles.length > 0 && (
                <div className="border-b border-[#eeeced] mb-8"></div>
              )}

              {/* Articles */}
              {newsletter.content?.articles && newsletter.content.articles.length > 0 && (
                <div className="space-y-10">
                  {newsletter.content.articles.map((article, index) => (
                    <div key={index} className="pb-8 border-b border-[#eeeced] last:border-0 last:pb-0">
                      {/* Title */}
                      <h2 
                        className="text-2xl font-bold leading-tight mb-5"
                        style={{ color: article.titleColor || "#2b3e81" }}
                      >
                        {article.title}
                      </h2>

                      {/* Image */}
                      {article.image && (
                        <div className="mb-4 flex justify-center">
                          <Image
                            src={article.image}
                            alt={article.title}
                            width={600}
                            height={400}
                            unoptimized
                            className="max-w-[600px] max-h-[400px] w-auto h-auto object-contain rounded-lg"
                          />
                        </div>
                      )}

                      {/* Summary */}
                      <div 
                        className="text-base text-gray-700 leading-relaxed mb-6"
                        dangerouslySetInnerHTML={{ __html: article.summary }}
                      />

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
        </div>
      </div>
    </div>
  );
}

