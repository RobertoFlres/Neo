import Parser from "rss-parser";
import { filterByCategory } from "./categoryKeywords";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
  },
});

/**
 * Fetch articles from The Verge RSS feed
 */
export const getTheVergeArticles = async (limit = 20) => {
  try {
    console.log("📰 Fetching The Verge...");
    const feed = await parser.parseURL("https://www.theverge.com/rss/index.xml");

    const articles = feed.items.slice(0, limit * 2).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.summary || item.description || "",
      url: item.link,
      source: "The Verge",
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      image:
        item.enclosure?.url ||
        item["media:content"]?.url ||
        item["media:thumbnail"]?.url ||
        null,
    }));

    console.log(`✅ Fetched ${articles.length} articles from The Verge`);
    return articles;
  } catch (error) {
    console.error("❌ Error fetching The Verge articles:", error.message);
    return [];
  }
};

/**
 * Get The Verge articles filtered by category
 */
export const getTheVergeNews = async (category = "technology", limit = 15) => {
  try {
    const articles = await getTheVergeArticles(limit * 2);
    const filteredArticles = filterByCategory(articles, category, true);
    const result = filteredArticles.slice(0, limit);

    console.log(`✅ The Verge: ${result.length}/${articles.length} articles matched category "${category}"`);
    return result;
  } catch (error) {
    console.error("❌ Error filtering The Verge news:", error.message);
    return [];
  }
};
