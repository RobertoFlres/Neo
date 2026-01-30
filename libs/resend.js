import { Resend } from "resend";
import config from "@/config";

const resend = new Resend(process.env.RESEND_API_KEY);

// Obtener el dominio de Resend desde variable de entorno o usar el configurado
// Formato esperado: "tu-dominio.com" o "neo@tu-dominio.com"
const getResendFromEmail = () => {
  // Si hay una variable de entorno específica para Resend, usarla (prioridad más alta)
  if (process.env.RESEND_FROM_EMAIL) {
    return process.env.RESEND_FROM_EMAIL;
  }
  
  // Si hay un dominio configurado en RESEND_DOMAIN, construir el email
  if (process.env.RESEND_DOMAIN) {
    const domain = process.env.RESEND_DOMAIN.replace(/^www\./, ''); // Remover www. si existe
    // Usar un formato más personal para evitar que se clasifique como promoción
    return `${config.appName} <newsletter@${domain}>`;
  }
  
  // Fallback: usar el dominio del config (startupchihuahua.org)
  // Remover www. del dominio si existe para emails
  // Usar "newsletter@" en lugar de solo el nombre para mejor deliverabilidad
  const domainFromConfig = config.domainName?.replace(/^www\./, '') || 'startupchihuahua.org';
  return `${config.appName} <newsletter@${domainFromConfig}>`;
};

export const sendEmail = async ({ to, subject, text, html, replyTo, unsubscribeUrl }) => {
  try {
    // Agregar delay para evitar rate limit (600ms entre emails - Resend permite 2 req/seg)
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const fromEmail = getResendFromEmail();
    const domainFromConfig = config.domainName?.replace(/^www\./, '') || 'startupchihuahua.org';
    
    console.log(`📧 Sending email from: ${fromEmail} to: ${to}`);
    
    // Headers para mejorar deliverabilidad y evitar que vaya a promociones
    const unsubscribeLink = unsubscribeUrl || `https://${domainFromConfig}/unsubscribe?email=${encodeURIComponent(to)}`;
    
    const headers = {
      // List-Unsubscribe header (requerido por Gmail para newsletters)
      // Formato: <mailto:email> o <https://url> o ambos
      'List-Unsubscribe': `<${unsubscribeLink}>`,
      // List-Unsubscribe-Post para one-click unsubscribe (RFC 8058)
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      // Prevenir que se marque como spam
      'X-Mailer': 'neo-newsletter',
    };
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: to,
      reply_to: replyTo,
      subject: subject,
      text: text,
      html: html,
      headers: headers,
    });

    if (error) {
      console.error("❌ Error sending email with Resend:", error);
      throw error;
    }

    console.log("✅ Email sent successfully with Resend:", data?.id);
    return data;
  } catch (error) {
    console.error("❌ Error in sendEmail:", error);
    throw error;
  }
};