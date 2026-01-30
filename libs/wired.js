import Parser from "rss-parser";
import { filterByCategory } from "./categoryKeywords";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
  },
});

/**
 * Fetch articles from Wired RSS feed
 */
export const getWiredArticles = async (limit = 20) => {
  try {
    console.log("📰 Fetching Wired...");
    const feed = await parser.parseURL("https://www.wired.com/feed/rss");

    const articles = feed.items.slice(0, limit * 2).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.summary || item.description || "",
      url: item.link,
      source: "Wired",
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      image:
        item.enclosure?.url ||
        item["media:content"]?.url ||
        item["media:thumbnail"]?.url ||
        null,
    }));

    console.log(`✅ Fetched ${articles.length} articles from Wired`);
    return articles;
  } catch (error) {
    console.error("❌ Error fetching Wired articles:", error.message);
    return [];
  }
};

/**
 * Get Wired articles filtered by category
 */
export const getWiredNews = async (category = "technology", limit = 15) => {
  try {
    const articles = await getWiredArticles(limit * 2);
    const filteredArticles = filterByCategory(articles, category, true);
    const result = filteredArticles.slice(0, limit);

    console.log(`✅ Wired: ${result.length}/${articles.length} articles matched category "${category}"`);
    return result;
  } catch (error) {
    console.error("❌ Error filtering Wired news:", error.message);
    return [];
  }
};
