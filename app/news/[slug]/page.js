import Link from "next/link";
import { notFound } from "next/navigation";
import { getLandingNewsArticles, computeArticleSlug } from "@/libs/landingNews";
import { scrapeArticle } from "@/libs/articleScraper";

const getArticle = async (slug) => {
  let landingNews = await getLandingNewsArticles();
  let article = landingNews?.articles?.find((item) => item.slug === slug);

  if (!article) {
    article = landingNews?.articles?.find((item) => computeArticleSlug(item.url) === slug);
  }

  if (!article) {
    landingNews = await getLandingNewsArticles({ forceRefresh: true });
    article = landingNews?.articles?.find((item) => item.slug === slug);

    if (!article) {
      article = landingNews?.articles?.find((item) => computeArticleSlug(item.url) === slug);
    }
  }

  return article;
};

const formatDateLong = (date) => {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch (error) {
    return "";
  }
};

const splitContent = (text = "") =>
  text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} | neo`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      url: article.url,
      images: article.image ? [{ url: article.image }] : undefined,
    },
  };
}

export default async function NewsArticlePage({ params }) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  let fullText = "";
  try {
    fullText = await scrapeArticle(article.url);
  } catch (error) {
    console.error("❌ Error scraping article content:", error.message);
  }

  const paragraphs = splitContent(fullText);

  return (
    <section className="relative bg-gradient-to-b from-white via-[#f5f7ff] to-white min-h-screen py-16 md:py-24">
      <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#dfe6ff_1px,transparent_1px),linear-gradient(to_bottom,#dfe6ff_1px,transparent_1px)] bg-[size:70px_70px]"></div>

      <div className="relative max-w-4xl mx-auto px-6 md:px-8">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1d4ed8] hover:text-[#1d4ed8]/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>
        </div>

        <article className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl px-8 md:px-12 py-10">
          <header className="mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-[#3b4c6e]/70 block mb-4">
              {article.source}
            </span>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#0f1b35] mb-3">
              {article.title}
            </h1>
            <p className="text-sm text-[#4a5672]">
              {formatDateLong(article.publishedAt)}
            </p>
          </header>

          <section className="prose prose-slate max-w-none">
            <p className="text-lg text-[#25324d] leading-relaxed mb-6">
              {article.summary}
            </p>

            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={index} className="text-[#3b4c6e] leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-[#3b4c6e] leading-relaxed">
                Visita la fuente original para leer el artículo completo.
              </p>
            )}
          </section>

          <footer className="mt-10 pt-6 border-t border-[#e5eafc] text-sm text-[#4a5672] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span>
              Fuente: <span className="font-medium">{article.source}</span>
            </span>
            <Link
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d4ed8] hover:text-[#1d4ed8]/80"
            >
              Leer en la fuente original
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 11l4 4m0 0l-4 4m4-4H7"
                />
              </svg>
            </Link>
          </footer>
        </article>
      </div>
    </section>
  );
}
