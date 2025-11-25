import axios from "axios";
import xml2js from "xml2js";

/**
 * Fetch RSS feeds and convert to articles format
 */
export const fetchRSSFeed = async (url) => {
  try {
    const response = await axios.get(url);
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);

    const items = result.rss?.channel?.[0]?.item || [];
    
    return items.map((item) => ({
      title: item.title?.[0] || "",
      description: item.description?.[0] || "",
      url: item.link?.[0] || "",
      source: url.includes("eleconomista") ? "El Economista" : url.includes("expansion") ? "Expansión" : "News",
      publishedAt: item.pubDate?.[0] || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return [];
  }
};

/**
 * Available RSS feeds for Mexican startups & tech
 */
export const MEXICAN_NEWS_RSS = [
  "https://www.eleconomista.com.mx/rss/section-tecnologia.xml",
  "https://expansion.mx/tecnologia/rss.xml",
  // Add more as needed
];

/**
 * Mix USA news with Mexican RSS feeds
 */
export const getMixedNews = async (category = "technology") => {
  try {
    // Get USA news (works well)
    const usaResponse = await fetch(`/api/test-news?country=us&category=${category}`);
    const usaData = await usaResponse.json();
    
    // Try to get Mexican RSS feeds (optional)
    // const rssArticles = await fetchRSSFeed(MEXICAN_NEWS_RSS[0]);
    
    return usaData.articles || [];
  } catch (error) {
    console.error("Error getting mixed news:", error);
    return [];
  }
};

