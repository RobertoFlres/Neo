"use client";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Recibe cada mañana",
    description: "Tu resumen diario llega directamente a tu inbox, listo para leer mientras tomas tu café.",
    gradient: "from-[#3b82f6] to-[#22d3ee]"
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Contenido curado",
    description: "Solo las noticias más relevantes del ecosistema tech. Sin ruido, sin spam, solo lo importante.",
    gradient: "from-[#2563eb] to-[#60a5fa]"
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Resúmenes concisos",
    description: "Lee todo lo importante en 5 minutos. Resúmenes claros y directos al grano.",
    gradient: "from-[#1d4ed8] to-[#3b82f6]"
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Múltiples fuentes",
    description: "Noticias de las mejores fuentes: TechCrunch, Hacker News, medios latinoamericanos y más.",
    gradient: "from-[#0ea5e9] to-[#2563eb]"
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "100% Gratis",
    description: "Siempre gratuito. No hay planes premium, no hay límites. Solo contenido de calidad.",
    gradient: "from-[#38bdf8] to-[#22d3ee]"
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Cancela cuando quieras",
    description: "Sin compromisos. Cancela tu suscripción en cualquier momento con un solo click.",
    gradient: "from-[#312e81] to-[#4f46e5]"
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-b from-[#f6f8ff] via-white to-white text-[#0f1b35]">
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#dfe6ff_1px,transparent_1px),linear-gradient(to_bottom,#dfe6ff_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-[#0f1b35]">
            Todo lo que necesitas
          </h2>
          <p className="mt-4 text-lg md:text-xl text-[#4a5672] max-w-2xl mx-auto">
            Un newsletter diseñado para profesionales que valoran su tiempo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl border border-[#e7ecff] bg-white/80 backdrop-blur-xl px-8 py-10 flex gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform`}>
                  {feature.icon}
                </div>
              </div>

              <div className="text-left">
                <h3 className="text-xl font-semibold text-[#0f1b35] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-[#4a5672] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

