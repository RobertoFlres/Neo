import axios from "axios";
import { parseString } from "xml2js";

/**
 * Generic RSS reader for multiple sources
 * 
 * @param {string} url - RSS feed URL
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of articles
 */
export const readRSSFeed = async (url, limit = 10) => {
  try {
    console.log(`📡 Reading RSS feed: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/rss+xml, text/xml, */*",
      },
      timeout: 10000,
    });

    const xml = response.data;
    
    // Parse XML to JSON
    const json = await new Promise((resolve, reject) => {
      parseString(xml, { explicitArray: false }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    // Extract items from RSS
    const items = json.rss?.channel?.item || [];
    const articles = [];
    
    items.slice(0, limit).forEach((item) => {
      const title = item.title || "";
      const link = item.link || "";
      const description = item.description || "";
      const pubDate = item.pubDate || "";
      
      if (title && link) {
        articles.push({
          title: title.trim(),
          description: (description.trim() || "").replace(/<[^>]*>/g, ""), // Remove HTML tags
          url: link.trim(),
          source: "RSS Feed",
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          image: item.enclosure?.url || item["media:thumbnail"]?.["$"]?.url || null,
        });
      }
    });
    
    console.log(`✅ Fetched ${articles.length} articles from RSS`);
    
    return articles;
  } catch (error) {
    console.error(`❌ Error reading RSS feed from ${url}:`, error.message);
    return [];
  }
};

/**
 * Read multiple RSS feeds and combine results
 * 
 * @param {Array<string>} urls - Array of RSS feed URLs
 * @param {number} limit - Number of articles per feed
 * @returns {Promise<Array>} Combined array of articles
 */
export const readMultipleFeeds = async (urls, limit = 10) => {
  const allArticles = [];
  
  for (const url of urls) {
    const articles = await readRSSFeed(url, limit);
    allArticles.push(...articles);
    
    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  
  // Remove duplicates based on URL
  const uniqueArticles = Array.from(
    new Map(allArticles.map(article => [article.url, article])).values()
  );
  
  return uniqueArticles;
};

/**
 * Pre-configured RSS sources for tech and startup news
 * Note: Some of these RSS feeds may not be publicly accessible
 */
export const TECH_SOURCES = {
  // TechCrunch RSS (works well)
  techcrunchRSS: {
    name: "TechCrunch (RSS)",
    url: "https://techcrunch.com/feed/",
    category: "startups",
    country: "us",
  },
  
  // The Verge RSS
  verge: {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "technology",
    country: "us",
  },
  
  // Wired RSS
  wired: {
    name: "Wired",
    url: "https://www.wired.com/feed/",
    category: "technology",
    country: "us",
  },
  
  // Ars Technica RSS
  arsTechnica: {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
    category: "technology",
    country: "us",
  },
};

/**
 * Get articles from a specific source
 */
export const getTechNewsFromSource = async (source, limit = 10) => {
  const sourceConfig = TECH_SOURCES[source];
  
  if (!sourceConfig) {
    console.error(`Unknown source: ${source}`);
    return [];
  }
  
  const articles = await readRSSFeed(sourceConfig.url, limit);
  
  return articles.map(article => ({
    ...article,
    source: sourceConfig.name,
  }));
};

/**
 * Get tech news by category and country
 */
export const getTechNewsByCategory = async (category, country = "mx", limit = 10) => {
  const sourcesForCategory = Object.values(TECH_SOURCES).filter(
    source => source.category === category
  );
  
  const allArticles = [];
  
  for (const sourceConfig of sourcesForCategory) {
    try {
      const articles = await readRSSFeed(sourceConfig.url, limit);
      allArticles.push(...articles);
    } catch (error) {
      console.error(`Error fetching from ${sourceConfig.name}:`, error.message);
    }
  }
  
  // Remove duplicates
  const uniqueArticles = Array.from(
    new Map(allArticles.map(article => [article.url, article])).values()
  );
  
  return uniqueArticles.slice(0, limit);
};

