import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Términos de Servicio | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
            Términos de Servicio
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Última actualización: Enero 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al suscribirte y utilizar el servicio de newsletter de {config.appName}, aceptas estos Términos de Servicio en su totalidad. Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices nuestro servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {config.appName} es un servicio gratuito de newsletter que proporciona a sus suscriptores un resumen diario curado de noticias relacionadas con startups, tecnología y emprendimiento. El contenido que compartimos incluye:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Resúmenes y enlaces a artículos de fuentes públicas de noticias</li>
              <li>Análisis y comentarios sobre tendencias del sector tecnológico</li>
              <li>Información sobre startups, financiamiento e innovación</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Contenido de Terceros</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nuestro newsletter incluye resúmenes y enlaces a contenido publicado por terceros. Es importante que entiendas que:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>No somos propietarios ni responsables del contenido original de las fuentes externas</li>
              <li>Los resúmenes que proporcionamos son con fines informativos y de referencia</li>
              <li>Siempre incluimos la atribución y enlace a la fuente original</li>
              <li>El contenido original está sujeto a los términos y derechos de autor de cada publicación</li>
              <li>No garantizamos la exactitud, integridad o actualidad del contenido de terceros</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Propiedad Intelectual</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              El diseño, formato y selección editorial de {config.appName} son propiedad de Startup Chihuahua. Los artículos, imágenes y contenido enlazado pertenecen a sus respectivos propietarios y están protegidos por las leyes de derechos de autor aplicables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Uso Aceptable</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al utilizar nuestro servicio, te comprometes a:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Proporcionar información de contacto válida y actualizada</li>
              <li>No utilizar el servicio para actividades ilegales o no autorizadas</li>
              <li>No redistribuir masivamente el contenido del newsletter sin autorización</li>
              <li>No intentar acceder a sistemas o datos no autorizados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Suscripción y Cancelación</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              La suscripción a {config.appName} es gratuita y voluntaria. Puedes cancelar tu suscripción en cualquier momento utilizando el enlace de cancelación incluido en cada email o contactándonos directamente. La cancelación es efectiva de manera inmediata.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {config.appName} se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables de:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Decisiones tomadas basadas en la información proporcionada</li>
              <li>Interrupciones temporales del servicio</li>
              <li>Contenido inexacto o desactualizado de fuentes externas</li>
              <li>Daños directos o indirectos derivados del uso del servicio</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Modificaciones</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nos reservamos el derecho de modificar estos Términos de Servicio en cualquier momento. Los cambios significativos serán comunicados a través de nuestro newsletter. El uso continuado del servicio después de cualquier modificación constituye la aceptación de los nuevos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Ley Aplicable</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Estos Términos de Servicio se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes en el Estado de Chihuahua, México.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos en:{" "}
              <a
                href="mailto:contacto@startupchihuahua.org"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                contacto@startupchihuahua.org
              </a>
            </p>
          </section>
        </article>
      </div>
    </main>
  );
};

export default TOS;
