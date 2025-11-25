import axios from "axios";
import Parser from "rss-parser";

const parser = new Parser();

/**
 * Fetch latest articles from TechCrunch RSS feed
 * TechCrunch provides an official RSS feed at https://techcrunch.com/feed/
 * 
 * @param {number} limit - Number of articles to fetch (default: 20)
 * @returns {Promise<Array>} Array of news articles
 */
export const getTechCrunchArticles = async (limit = 20) => {
  try {
    const feed = await parser.parseURL("https://techcrunch.com/feed/");
    
    const articles = feed.items
      .slice(0, limit)
      .map((item) => ({
        title: item.title,
        description: item.contentSnippet || item.description || "",
        url: item.link,
        source: "TechCrunch",
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
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
 * @param {string} category - Category to search for (startups, venture, etc.)
 * @param {number} limit - Number of articles to fetch (default: 20)
 * @returns {Promise<Array>} Array of news articles
 */
export const getTechCrunchByCategory = async (category = "startups", limit = 20) => {
  try {
    const articles = await getTechCrunchArticles(limit * 2);
    
    // Filter by category
    const categoryLower = category.toLowerCase();
    const filteredArticles = articles.filter((article) => {
      const title = article.title.toLowerCase();
      const description = (article.description || "").toLowerCase();
      const categories = (article.categories || []).join(" ").toLowerCase();
      
      return (
        title.includes(categoryLower) ||
        description.includes(categoryLower) ||
        categories.includes(categoryLower)
      );
    });
    
    console.log(
      `✅ Found ${filteredArticles.length} TechCrunch articles in category "${category}"`
    );
    
    return filteredArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error searching TechCrunch:", error.message);
    return [];
  }
};

/**
 * Get today's top tech/startup stories from TechCrunch
 * 
 * @param {string} category - Filter category (technology, business, startups)
 * @param {number} limit - Number of stories to fetch (default: 10)
 * @returns {Promise<Array>} Array of news articles
 */
export const getTechCrunchStories = async (category = "technology", limit = 10) => {
  try {
    // Map category to TechCrunch relevant terms
    const categoryMap = {
      technology: "tech",
      business: "business",
      startups: "startup",
    };
    
    const searchTerm = categoryMap[category] || category;
    const articles = await getTechCrunchByCategory(searchTerm, limit);
    
    // If no specific category articles, return general articles
    if (articles.length === 0) {
      return await getTechCrunchArticles(limit);
    }
    
    return articles;
  } catch (error) {
    console.error("❌ Error fetching TechCrunch stories:", error.message);
    return [];
  }
};

