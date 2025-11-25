import Link from "next/link";
import { getLandingNewsArticles, computeArticleSlug } from "@/libs/landingNews";

const formatDate = (date) => {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch (error) {
    return "";
  }
};

const truncate = (text = "", length = 140) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= length) return clean;
  return `${clean.slice(0, length)}…`;
};

const NewsCards = ({ articles }) => {
  if (!articles.length) {
    return (
      <div className="text-center text-[#4a5672] bg-white/70 border border-white/60 rounded-3xl py-16 px-6">
        <p className="text-lg font-medium text-[#0f1b35] mb-2">
          Estamos preparando las últimas noticias
        </p>
        <p className="text-sm text-[#4a5672]">
          Revisa de nuevo en unas horas mientras recopilamos nuevas historias.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => {
        const slug = article.slug || computeArticleSlug(article.url);
        return (
          <Link
            key={slug}
            href={`/news/${slug}`}
            className="group relative overflow-hidden rounded-3xl border border-white/30 bg-white/75 backdrop-blur-lg px-6 py-8 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_80px_-50px_rgba(67,97,238,0.45)]"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#3b82f6] to-[#22d3ee] text-white text-lg">
                ⚡
              </div>
              <span className="text-xs font-semibold text-[#4a5672] bg-white/70 border border-white/90 px-3 py-1 rounded-full">
                {formatDate(article.publishedAt)}
              </span>
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#3b4c6e]/70 block mb-2">
                {article.source}
              </span>
              <h3 className="text-xl font-semibold text-[#0f1b35] mb-2 group-hover:text-[#1d4ed8] transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-[#4a5672] leading-relaxed">
                {truncate(article.summary)}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-[#1d4ed8] group-hover:text-[#1d4ed8]/80">
              Leer más
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const NewsletterGrid = async () => {
  const landingNews = await getLandingNewsArticles();
  const articles = landingNews?.articles || [];

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-white via-[#f5f7ff] to-[#ecf3ff] overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#d7e2ff_1px,transparent_1px),linear-gradient(to_bottom,#d7e2ff_1px,transparent_1px)] bg-[size:70px_70px]"></div>
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-blue-200/30 blur-[180px]"></div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#0f1b35]">
            Ejemplos recientes
          </h2>
          <p className="mt-4 text-lg md:text-xl text-[#4a5672] max-w-2xl mx-auto">
            Echa un vistazo a algunos de nuestros últimos envíos.
          </p>
        </div>

        <NewsCards articles={articles.slice(0, 6)} />
      </div>
    </section>
  );
};

export default NewsletterGrid;
