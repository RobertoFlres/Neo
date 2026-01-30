import Link from "next/link";
import Image from "next/image";
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

  // Scrape full article content
  let scrapedContent = { paragraphs: [], image: null };
  try {
    scrapedContent = await scrapeArticle(article.url);
  } catch (error) {
    console.error("❌ Error scraping article content:", error.message);
  }

  // Use scraped image or article image
  const articleImage = scrapedContent.image || article.image;
  const paragraphs = scrapedContent.paragraphs || [];

  return (
    <section className="relative bg-gradient-to-b from-white via-[#f5f7ff] to-white min-h-screen py-12 md:py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#dfe6ff_1px,transparent_1px),linear-gradient(to_bottom,#dfe6ff_1px,transparent_1px)] bg-[size:70px_70px]"></div>

      <div className="relative max-w-3xl mx-auto px-4 md:px-6">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2b3e81] hover:text-[#2b3e81]/80 transition-colors"
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

        {/* Article card */}
        <article className="bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
          {/* Featured image */}
          {articleImage && (
            <div className="relative w-full h-64 md:h-80 bg-gray-100">
              <img
                src={articleImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          )}

          <div className="px-6 md:px-10 py-8 md:py-10">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2b3e81] bg-[#2b3e81]/10 rounded-full">
                  {article.source}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDateLong(article.publishedAt)}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {article.title}
              </h1>
            </header>

            {/* Summary */}
            <div className="mb-8 p-4 bg-gray-50 border-l-4 border-[#2b3e81] rounded-r-lg">
              <p className="text-lg text-gray-700 leading-relaxed italic">
                {article.summary}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {paragraphs.length > 0 ? (
                <div className="space-y-6">
                  {paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-gray-700 leading-relaxed text-base md:text-lg"
                      style={{ textAlign: "justify" }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    El contenido completo esta disponible en la fuente original.
                  </p>
                  <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#2b3e81] text-white font-medium rounded-lg hover:bg-[#2b3e81]/90 transition-colors"
                  >
                    Leer articulo completo
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Fuente: <span className="font-semibold text-gray-700">{article.source}</span>
                </div>
                <Link
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Ver en fuente original
                </Link>
              </div>
            </footer>
          </div>
        </article>

        {/* Newsletter CTA */}
        <div className="mt-10 p-6 bg-gradient-to-r from-[#2b3e81] to-[#4d6fff] rounded-2xl text-white text-center">
          <h3 className="text-xl font-bold mb-2">
            Recibe las mejores noticias en tu correo
          </h3>
          <p className="text-white/80 mb-4 text-sm">
            Suscribete a nuestro newsletter y mantente informado
          </p>
          <Link
            href="/#newsletter"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#2b3e81] font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            Suscribirme gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
