import { createHash } from "crypto";
import connectMongo from "@/libs/mongoose";
import LandingNews from "@/models/LandingNews";
import { getNewsArticles } from "@/libs/newsApi";
import { getNewsDataArticles } from "@/libs/newsData";
import { getTechCrunchArticles } from "@/libs/techcrunch";
import { getHackerNewsStories } from "@/libs/hackerNews";
import { getStartuplinksArticles } from "@/libs/startuplinks";
import { getExpansionArticles } from "@/libs/expansion";
import { getTheVergeArticles } from "@/libs/theVerge";
import { getWiredArticles } from "@/libs/wired";
import { getCrunchbaseNewsArticles } from "@/libs/crunchbase";

const STALE_HOURS = 6;
const MAX_ARTICLES = 9;
const BLOCKED_DOMAINS = ["noro.mx", "referente.mx", "www.noro.mx", "www.referente.mx"];

const truncate = (str = "", length = 180) => {
  const cleanStr = str.replace(/\s+/g, " ").trim();
  if (cleanStr.length <= length) return cleanStr;
  return `${cleanStr.slice(0, length)}…`;
};

export const computeArticleSlug = (url = "") =>
  createHash("sha256").update(url).digest("hex").slice(0, 24);

const normalizeArticle = (article = {}) => {
  const url = article.url || article.link;
  if (!url || !article.title) {
    return null;
  }

  let source = article.source || article.source_name;
  let hostname;

  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
    if (!source) {
      source = hostname;
    }
  } catch (error) {
    hostname = undefined;
  }

  if (hostname && BLOCKED_DOMAINS.includes(hostname)) {
    return null;
  }

  const summary = truncate(article.summary || article.description || article.contentSnippet || "");
  const publishedAt = article.publishedAt
    ? new Date(article.publishedAt)
    : article.pubDate
    ? new Date(article.pubDate)
    : new Date();

  return {
    slug: computeArticleSlug(url),
    title: article.title.trim(),
    summary,
    url,
    source: source || "",
    image: article.image || article.image_url || article.enclosure?.url || null,
    publishedAt,
  };
};

const dedupeAndSort = (articles) => {
  const map = new Map();

  articles.forEach((raw) => {
    const normalized = normalizeArticle(raw);
    if (!normalized) return;

    if (!map.has(normalized.slug)) {
      map.set(normalized.slug, normalized);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
};

const safeFetch = async (fn, label) => {
  try {
    const data = await fn();
    console.log(`✅ Landing news source "${label}" returned ${data.length} articles`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching from ${label}:`, error.message || error);
    return [];
  }
};

export const fetchLatestLandingNews = async () => {
  const fetchers = [
    () => getNewsArticles("technology", "us", 12),
    () => getNewsArticles("technology", "mx", 12),
    () => getNewsDataArticles("technology", "mx", 12),
    () => getTechCrunchArticles(15),
    () => getHackerNewsStories("technology", "mx", 15),
    () => getTheVergeArticles(15),
    () => getWiredArticles(15),
    () => getCrunchbaseNewsArticles(15),
    () => getExpansionArticles(20),
    () => getStartuplinksArticles(20),
  ];

  const settled = await Promise.all(fetchers.map((fn, idx) => safeFetch(fn, `source-${idx + 1}`)));
  const combined = settled.flat();

  const cleaned = dedupeAndSort(combined).slice(0, MAX_ARTICLES);

  return cleaned.map((article) => ({
    ...article,
    summary:
      article.summary && article.summary.length > 0
        ? article.summary
        : "Lee esta historia completa en la fuente.",
  }));
};

const isStale = (generatedAt) => {
  if (!generatedAt) return true;
  const ageHours = (Date.now() - new Date(generatedAt).getTime()) / (1000 * 60 * 60);
  return ageHours >= STALE_HOURS;
};

export const refreshLandingNews = async () => {
  await connectMongo();
  const articles = await fetchLatestLandingNews();

  const landingNews = await LandingNews.findOneAndUpdate(
    {},
    {
      generatedAt: new Date(),
      articles,
    },
    {
      new: true,
      upsert: true,
      sort: { generatedAt: -1 },
    }
  );

  return landingNews;
};

export const getLandingNewsArticles = async ({ forceRefresh = false } = {}) => {
  await connectMongo();

  let landingNews = await LandingNews.findOne().sort({ generatedAt: -1 });

  if (!landingNews || forceRefresh || isStale(landingNews.generatedAt)) {
    landingNews = await refreshLandingNews();
  }

  // Ensure all articles have slug for legacy documents
  const articlesWithSlug = landingNews.articles.map((article) => {
    if (!article.slug) {
      article.slug = computeArticleSlug(article.url);
    }
    return article;
  });

  if (articlesWithSlug.some((article, idx) => article.slug !== landingNews.articles[idx].slug)) {
    landingNews.articles = articlesWithSlug;
    await landingNews.save();
  }

  return landingNews.toObject();
};
