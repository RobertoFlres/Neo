import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Política de Privacidad | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Volver al inicio
        </Link>

        <article className="prose prose-gray max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Política de Privacidad
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Última actualización: Enero 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introducción</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En {config.appName} (&quot;nosotros&quot;, &quot;nuestro&quot;), operado por Startup Chihuahua, nos comprometemos a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información personal cuando utilizas nuestro servicio de newsletter.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al suscribirte a nuestro newsletter, aceptas las prácticas descritas en esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Información que Recopilamos</h2>

            <h3 className="text-lg font-medium text-gray-800 mb-3">2.1 Datos Personales</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Recopilamos únicamente la información necesaria para proporcionar nuestro servicio:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Dirección de correo electrónico:</strong> Para enviarte el newsletter y comunicaciones relacionadas con el servicio</li>
              <li><strong>Nombre (opcional):</strong> Para personalizar nuestras comunicaciones contigo</li>
              <li><strong>Preferencias de contenido:</strong> Si las proporcionas, para personalizar el contenido que recibes</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-3">2.2 Datos No Personales</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              También recopilamos información técnica de forma automática:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Datos de uso del email:</strong> Tasas de apertura y clics para mejorar nuestro contenido</li>
              <li><strong>Información del dispositivo:</strong> Tipo de navegador, sistema operativo</li>
              <li><strong>Cookies:</strong> Para mejorar la experiencia en nuestro sitio web</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Uso de la Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos tu información para los siguientes propósitos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Enviar el newsletter con noticias de startups, tecnología y emprendimiento</li>
              <li>Personalizar el contenido según tus intereses</li>
              <li>Comunicar actualizaciones importantes sobre el servicio</li>
              <li>Mejorar y optimizar nuestro contenido y servicio</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Base Legal para el Procesamiento</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Procesamos tus datos personales bajo las siguientes bases legales:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Consentimiento:</strong> Al suscribirte, nos das tu consentimiento para recibir comunicaciones</li>
              <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y contenido</li>
              <li><strong>Cumplimiento legal:</strong> Para cumplir con las leyes aplicables</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Compartir Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>No vendemos, alquilamos ni compartimos tu información personal con terceros para fines de marketing.</strong>
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos compartir información únicamente en los siguientes casos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Proveedores de servicios:</strong> Utilizamos servicios de terceros para el envío de emails (como Mailgun) que procesan datos en nuestro nombre bajo estrictos acuerdos de confidencialidad</li>
              <li><strong>Requerimientos legales:</strong> Si es requerido por ley o para proteger nuestros derechos legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Seguridad de los Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, pérdida o alteración, incluyendo:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Encriptación de datos en tránsito (HTTPS/SSL)</li>
              <li>Almacenamiento seguro en bases de datos protegidas</li>
              <li>Acceso restringido a datos personales</li>
              <li>Revisiones periódicas de seguridad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Retención de Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conservamos tu información personal mientras mantengas una suscripción activa. Si cancelas tu suscripción, eliminaremos o anonimizaremos tus datos dentro de los 30 días siguientes, excepto cuando sea necesario retenerlos por obligaciones legales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Tus Derechos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tienes los siguientes derechos sobre tus datos personales:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Acceso:</strong> Solicitar una copia de los datos que tenemos sobre ti</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de tus datos</li>
              <li><strong>Cancelación:</strong> Darte de baja del newsletter en cualquier momento</li>
              <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para ejercer cualquiera de estos derechos, contáctanos en la dirección proporcionada al final de esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nuestro sitio web utiliza cookies para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Recordar tus preferencias</li>
              <li>Analizar el tráfico del sitio web</li>
              <li>Mejorar la funcionalidad del sitio</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades del sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Menores de Edad</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nuestro servicio no está dirigido a menores de 13 años. No recopilamos intencionalmente información de niños. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información personal, contáctanos para que podamos eliminarla.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Cambios a esta Política</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios significativos a través del newsletter o mediante un aviso en nuestro sitio web. Te recomendamos revisar esta política periódicamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tienes preguntas, comentarios o solicitudes relacionadas con esta Política de Privacidad o el tratamiento de tus datos personales, puedes contactarnos en:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Startup Chihuahua</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Email:{" "}
                <a
                  href="mailto:contacto@startupchihuahua.org"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  contacto@startupchihuahua.org
                </a>
              </p>
              <p className="text-gray-700">
                Sitio web:{" "}
                <a
                  href="https://www.startupchihuahua.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  www.startupchihuahua.org
                </a>
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
