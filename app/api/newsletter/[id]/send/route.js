import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Newsletter from "@/models/Newsletter";
import Lead from "@/models/Lead";
import { sendEmail } from "@/libs/resend";
import config from "@/config";

/**
 * POST /api/newsletter/[id]/send
 * Sends a newsletter to all active subscribers
 */
export async function POST(req, context) {
  await connectMongo();

  try {
    const { id } = context.params;
    
    console.log("📧 Newsletter send request for ID:", id);
    
    // Validate ID
    if (!id || id === 'undefined') {
      console.error("❌ Invalid newsletter ID:", id);
      return NextResponse.json(
        { error: "Invalid newsletter ID" },
        { status: 400 }
      );
    }
    
    // Get the newsletter
    const newsletter = await Newsletter.findById(id);
    if (!newsletter) {
      console.error("❌ Newsletter not found for ID:", id);
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 }
      );
    }
    
    console.log("✅ Newsletter found:", newsletter.title);

    // Permitir reenvío de newsletters ya enviados
    // Si ya fue enviado, incrementaremos el contador de envíos
    const isResend = newsletter.status === "sent";

    // Get all active subscribers
    const subscribers = await Lead.find({ isActive: true });
    console.log(`📧 Found ${subscribers.length} active subscribers`);

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers found" },
        { status: 400 }
      );
    }

    // Generate HTML content for the newsletter
    const htmlContent = generateNewsletterHTML(newsletter);
    const textContent = generateNewsletterText(newsletter);

    // Send emails to all subscribers
    let sentCount = 0;
    const errors = [];

    console.log(`📧 Starting to send newsletter to ${subscribers.length} subscribers...`);

    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      try {
        console.log(`📧 [${i + 1}/${subscribers.length}] Processing ${subscriber.email}...`);
        
        // Generate personalized HTML with unsubscribe link
        const personalizedHTML = htmlContent.replace(
          'UNSUBSCRIBE_TOKEN',
          `${config.domainName}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
        );
        
        const personalizedText = textContent.replace(
          'UNSUBSCRIBE_TOKEN',
          `${config.domainName}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
        );

        // Construir URL de unsubscribe
        const unsubscribeUrl = `https://${config.domainName.replace(/^www\./, '')}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

        await sendEmail({
          to: subscriber.email,
          subject: newsletter.title,
          html: personalizedHTML,
          text: personalizedText,
          replyTo: config.mailgun.supportEmail,
          unsubscribeUrl: unsubscribeUrl,
        });
        sentCount++;
        console.log(`✅ [${i + 1}/${subscribers.length}] Email sent successfully to ${subscriber.email}`);
      } catch (error) {
        console.error(`❌ [${i + 1}/${subscribers.length}] Error sending to ${subscriber.email}:`, error);
        errors.push({ 
          email: subscriber.email, 
          error: error.message || error.toString(),
          details: error 
        });
        // Continuar con el siguiente suscriptor aunque haya un error
      }
    }

    console.log(`📧 Finished sending. Success: ${sentCount}, Errors: ${errors.length}`);

    // Update newsletter status
    // Si es un reenvío, sumar al contador existente; si no, establecer el nuevo valor
    const newSentCount = isResend ? (newsletter.sentCount || 0) + sentCount : sentCount;
    
    await Newsletter.findByIdAndUpdate(id, {
      status: "sent",
      sentCount: newSentCount,
      sentAt: new Date(),
    });

    console.log(`📧 Newsletter ${isResend ? 'resent' : 'sent'} to ${sentCount} subscribers (Total: ${newSentCount})`);

    return NextResponse.json({
      success: true,
      sentCount: newSentCount,
      newSentCount: sentCount, // Emails enviados en este envío
      isResend: isResend,
      totalSubscribers: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error("❌ Error sending newsletter:", error);
    return NextResponse.json(
      { error: "Error sending newsletter" },
      { status: 500 }
    );
  }
}

/**
 * Generate HTML content for the newsletter
 */
function generateNewsletterHTML(newsletter) {
  const { content, title, date } = newsletter;
  
  // Obtener URLs - usar las URLs hardcodeadas de los PNG (mejor compatibilidad con clientes de correo)
  // Estas son las URLs actuales de Cloudinary
  const logoUrl = "https://res.cloudinary.com/drolmne66/image/upload/v1762281918/newsletter/logonuevo2.png";
  const fondoUrl = "https://res.cloudinary.com/drolmne66/image/upload/v1762281921/newsletter/fondo2.png";
  
  // Debug: Log URLs para verificar
  console.log("🎨 Logo URL:", logoUrl);
  console.log("🎨 Fondo URL:", fondoUrl);
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .newsletter-container {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #2b3e81;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          color: white;
          padding: 30px 20px;
          text-align: center;
          position: relative;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .date {
          margin-top: 10px;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 30px 20px;
        }
        .summary {
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 30px;
          color: #555;
        }
        .articles {
          margin-top: 30px;
        }
        .article {
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid #eee;
        }
        .article:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .article-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
          line-height: 1.3;
        }
        .article-image {
          margin: 20px 0;
          text-align: center;
          max-height: 400px;
          overflow: hidden;
        }
        .article-image img {
          max-width: 600px;
          max-height: 400px;
          width: auto;
          height: auto;
          display: block;
          margin: 0 auto;
          border-radius: 8px;
          object-fit: contain;
        }
        .article-summary {
          font-size: 16px;
          line-height: 1.7;
          color: #555;
          margin-bottom: 15px;
        }
        .read-more {
          text-align: right;
          margin-top: 15px;
        }
        .read-more a {
          color: #2b3e81;
          text-decoration: underline;
          font-size: 14px;
        }
        .footer {
          background: linear-gradient(135deg, #2b3e81 0%, #4d6fff 100%);
          padding: 40px 20px;
          text-align: center;
          border-top: 1px solid #eee;
        }
        .footer-logo {
          margin-bottom: 20px;
        }
        .footer-logo img {
          height: 60px;
          width: auto;
          max-width: 200px;
          display: block;
          margin: 0 auto;
        }
        .footer-brand {
          font-size: 24px;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 10px;
        }
        .footer-tagline {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 25px;
          line-height: 1.6;
        }
        .social-links {
          margin: 25px 0;
          display: flex;
          justify-content: center;
          gap: 15px;
          align-items: center;
        }
        .social-link {
          display: inline-block;
          width: 40px;
          height: 40px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .social-link:hover {
          background-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        .social-icon {
          width: 20px;
          height: 20px;
          fill: #ffffff;
        }
        .footer-divider {
          height: 1px;
          background-color: rgba(255, 255, 255, 0.2);
          margin: 25px 0;
        }
        .footer-info {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 15px;
          line-height: 1.6;
        }
        .unsubscribe {
          margin-top: 20px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
        }
        .unsubscribe a {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: underline;
        }
        .unsubscribe a:hover {
          color: #ffffff;
        }
      </style>
    </head>
    <body>
      <div class="newsletter-container">
        <!-- Header -->
        <div class="header" style="background-color: #2b3e81; ${fondoUrl ? `background-image: url('${fondoUrl}');` : ''} background-size: cover; background-position: center; background-repeat: no-repeat; color: white; padding: 30px 20px; text-align: center; position: relative; min-height: 200px;">
          <!-- Date - Top Right -->
          <div style="text-align: right; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">
              ${new Date(date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <!-- Logo - Centered -->
          <div style="text-align: center; margin-top: 10px;">
            <img src="${logoUrl}" alt="${config.appName}" style="height: 120px; width: auto; max-width: 300px; display: block; margin: 0 auto;" />
          </div>
        </div>

        <!-- Content -->
        <div class="content">
          ${content.summary ? `<div class="summary">${content.summary}</div>` : ''}
          
          ${content.articles && content.articles.length > 0 ? `
            <div class="articles">
              ${content.articles.map(article => `
                <div class="article">
                  <h2 class="article-title" style="color: ${article.titleColor || '#2b3e81'}">
                    ${article.title}
                  </h2>
                  
                  ${article.image && article.image.startsWith('http') ? `
                    <div class="article-image" style="text-align: center; margin: 20px 0; max-height: 400px; overflow: hidden;">
                      <img src="${article.image}" alt="${article.title}" style="max-width: 600px; max-height: 400px; width: auto; height: auto; display: block; margin: 0 auto; border-radius: 8px; object-fit: contain;" />
                    </div>
                  ` : article.image && article.image.startsWith('data:image') ? `
                    <!-- Base64 image detected - converting or skipping. Please re-upload this image. -->
                  ` : ''}
                  
                  <div class="article-summary">
                    ${article.summary}
                  </div>
                  
                  ${(article.url || article.sourceUrl || article.link) ? `
                    <div class="read-more">
                      <a href="${article.url || article.sourceUrl || article.link}" target="_blank">
                        Ver más
                      </a>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div class="footer">
          <!-- Logo -->
          <div class="footer-logo">
            <img src="${logoUrl}" alt="${config.appName}" style="height: 60px; width: auto; max-width: 200px; display: block; margin: 0 auto;" />
          </div>
          
          <!-- Tagline -->
          <div class="footer-tagline">
            Un boletín de noticias para emprendedores
          </div>
          
          <!-- Social Media Links -->
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    ${config.social?.instagram && config.social?.instagramIconUrl ? `
                      <td style="padding: 0 8px;">
                        <a href="${config.social.instagram}" target="_blank" style="display: block; width: 40px; height: 40px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; text-decoration: none;">
                          <table width="40" height="40" border="0" cellpadding="0" cellspacing="0" style="border-radius: 50%; background-color: rgba(255, 255, 255, 0.2);">
                            <tr>
                              <td align="center" valign="middle">
                                <img src="${config.social.instagramIconUrl}" alt="Instagram" width="20" height="20" style="display: block; width: 20px; height: 20px;" />
                              </td>
                            </tr>
                          </table>
                        </a>
                      </td>
                    ` : ''}
                    ${config.social?.linkedin && config.social?.linkedinIconUrl ? `
                      <td style="padding: 0 8px;">
                        <a href="${config.social.linkedin}" target="_blank" style="display: block; width: 40px; height: 40px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; text-decoration: none;">
                          <table width="40" height="40" border="0" cellpadding="0" cellspacing="0" style="border-radius: 50%; background-color: rgba(255, 255, 255, 0.2);">
                            <tr>
                              <td align="center" valign="middle">
                                <img src="${config.social.linkedinIconUrl}" alt="LinkedIn" width="20" height="20" style="display: block; width: 20px; height: 20px;" />
                              </td>
                            </tr>
                          </table>
                        </a>
                      </td>
                    ` : ''}
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <!-- Divider -->
          <div class="footer-divider" style="height: 1px; background-color: rgba(255, 255, 255, 0.2); margin: 25px 0;"></div>
          
          <!-- Info -->
          <div class="footer-info">
            <p style="margin: 5px 0; font-size: 13px; color: rgba(255, 255, 255, 0.85); line-height: 1.6;">
              Recibiste este email porque te suscribiste a nuestro newsletter
            </p>
          </div>
          
          <!-- Unsubscribe -->
          <div class="unsubscribe">
            <a href="${config.domainName}/unsubscribe?token=UNSUBSCRIBE_TOKEN" style="color: rgba(255, 255, 255, 0.9); text-decoration: underline; font-size: 12px;">Darse de baja</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text content for the newsletter
 */
function generateNewsletterText(newsletter) {
  const { content, title, date } = newsletter;
  
  let text = `${config.appName}\n`;
  text += `${new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}\n\n`;
  
  if (content.summary) {
    text += `${content.summary}\n\n`;
  }
  
  if (content.articles && content.articles.length > 0) {
    content.articles.forEach((article, index) => {
      text += `${index + 1}. ${article.title}\n`;
      text += `${article.summary}\n`;
      if (article.url || article.sourceUrl || article.link) {
        text += `Ver más: ${article.url || article.sourceUrl || article.link}\n`;
      }
      text += '\n';
    });
  }
  
  text += `\n---\n`;
  text += `${config.appName} | Un boletín de noticias para emprendedores\n`;
  text += `Recibiste este email porque te suscribiste a nuestro newsletter\n`;
  text += `Darse de baja: ${config.domainName}/unsubscribe`;
  
  return text;
}
