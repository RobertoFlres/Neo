import Parser from "rss-parser";
import { filterByCategory } from "./categoryKeywords";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
  },
});

/**
 * Fetch articles from Crunchbase News RSS feed
 */
export const getCrunchbaseNewsArticles = async (limit = 20) => {
  try {
    console.log("📰 Fetching Crunchbase News...");
    const feed = await parser.parseURL("https://news.crunchbase.com/feed/");

    const articles = feed.items.slice(0, limit * 2).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.summary || item.description || "",
      url: item.link,
      source: "Crunchbase News",
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      image:
        item.enclosure?.url ||
        item["media:content"]?.url ||
        item["media:thumbnail"]?.url ||
        null,
    }));

    console.log(`✅ Fetched ${articles.length} articles from Crunchbase News`);
    return articles;
  } catch (error) {
    console.error("❌ Error fetching Crunchbase News articles:", error.message);
    return [];
  }
};

/**
 * Get Crunchbase News articles filtered by category
 */
export const getCrunchbaseNews = async (category = "startups", limit = 15) => {
  try {
    const articles = await getCrunchbaseNewsArticles(limit * 2);
    const filteredArticles = filterByCategory(articles, category, true);
    const result = filteredArticles.slice(0, limit);

    console.log(`✅ Crunchbase: ${result.length}/${articles.length} articles matched category "${category}"`);
    return result;
  } catch (error) {
    console.error("❌ Error filtering Crunchbase news:", error.message);
    return [];
  }
};
