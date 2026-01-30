import Parser from "rss-parser";
import { filterByCategory } from "./categoryKeywords";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
  },
});

/**
 * Fetch latest articles from TechCrunch RSS feed
 *
 * @param {number} limit - Number of articles to fetch (default: 20)
 * @returns {Promise<Array>} Array of news articles
 */
export const getTechCrunchArticles = async (limit = 20) => {
  try {
    const feed = await parser.parseURL("https://techcrunch.com/feed/");

    const articles = feed.items.slice(0, limit * 2).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.description || "",
      url: item.link,
      source: "TechCrunch",
      publishedAt: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString(),
      image: item.enclosure?.url || item["media:content"]?.url || null,
      categories: item.categories || [],
    }));

    console.log(`✅ Fetched ${articles.length} articles from TechCrunch`);

    return articles;
  } catch (error) {
    console.error("❌ Error fetching TechCrunch articles:", error.message);
    return [];
  }
};

/**
 * Fetch TechCrunch articles by category
 *
 * @param {string} category - Category to filter (technology, business, startups)
 * @param {number} limit - Number of articles to fetch (default: 20)
 * @returns {Promise<Array>} Array of news articles
 */
export const getTechCrunchByCategory = async (category = "technology", limit = 20) => {
  try {
    const articles = await getTechCrunchArticles(limit * 2);

    // Use centralized category filtering (strict mode)
    const filteredArticles = filterByCategory(articles, category, true);

    const result = filteredArticles.slice(0, limit);

    console.log(`✅ TechCrunch: ${result.length}/${articles.length} articles matched category "${category}"`);

    return result;
  } catch (error) {
    console.error("❌ Error filtering TechCrunch:", error.message);
    return [];
  }
};

/**
 * Get TechCrunch stories filtered by category
 *
 * @param {string} category - Filter category (technology, business, startups)
 * @param {number} limit - Number of stories to fetch (default: 10)
 * @returns {Promise<Array>} Array of news articles
 */
export const getTechCrunchStories = async (category = "technology", limit = 10) => {
  try {
    return await getTechCrunchByCategory(category, limit);
  } catch (error) {
    console.error("❌ Error fetching TechCrunch stories:", error.message);
    return [];
  }
};
