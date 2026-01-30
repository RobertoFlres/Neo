import axios from "axios";
import { filterByCategory } from "./categoryKeywords";

/**
 * Map our category names to NewsData.io search parameters
 */
export const mapCategoryToNewsData = (category) => {
  const mapping = {
    technology: {
      category: "technology",
      q: "tecnología OR technology OR AI OR software OR startup tech",
    },
    business: {
      category: "business",
      q: null,
    },
    startups: {
      category: null,
      q: "startup OR startups OR emprendimiento OR founder OR funding OR venture OR unicornio OR inversión",
    },
    general: { category: null, q: null },
  };
  return mapping[category] || { category: null, q: null };
};

/**
 * Fetch news from NewsData.io API
 * Better coverage for Mexico and Latin America
 *
 * @param {string} category - Category to fetch
 * @param {number} pageSize - Number of results
 * @returns {Promise<Array>} Array of news articles
 */
export const getNewsDataArticles = async (category = "technology", pageSize = 15) => {
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey) {
    console.error("⚠️ NEWSDATA_API_KEY not found in environment variables");
    return [];
  }

  const searchParams = mapCategoryToNewsData(category);
  console.log(`📝 NewsData - category "${category}" mapped to:`, searchParams);

  try {
    const url = "https://newsdata.io/api/1/news";
    let allArticles = [];

    // Fetch from multiple countries for better coverage
    const countries = ["mx", "us", "es", "ar"];

    for (const country of countries) {
      try {
        const params = {
          apikey: apiKey,
          country: country,
          language: "es,en",
          size: Math.ceil(pageSize / 2),
        };

        // Add category or keyword search
        if (searchParams.category) {
          params.category = searchParams.category;
        }
        if (searchParams.q) {
          params.q = searchParams.q;
        }

        const response = await axios.get(url, { params, timeout: 10000 });
        const articles = response.data.results || [];

        const formattedArticles = articles
          .filter((article) => article.title && article.link)
          .map((article) => ({
            title: article.title,
            description: article.description || "",
            url: article.link,
            source: article.source_name || "NewsData",
            publishedAt: article.pubDate || new Date().toISOString(),
            image: article.image_url,
          }));

        allArticles.push(...formattedArticles);
      } catch (err) {
        console.log(`⚠️ NewsData: Error fetching ${country}:`, err.message);
      }
    }

    // Remove duplicates by URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map((a) => [a.url, a])).values()
    );

    // Apply category filter for additional accuracy
    const filteredArticles = filterByCategory(uniqueArticles, category, false);

    const result = filteredArticles.slice(0, pageSize);

    console.log(`✅ NewsData: ${result.length} articles for category "${category}"`);

    return result;
  } catch (error) {
    console.error("❌ Error fetching from NewsData:", error.response?.data || error.message);
    return [];
  }
};

/**
 * Available countries supported by NewsData
 */
export const NEWSDATA_COUNTRIES = [
  { code: "mx", name: "México" },
  { code: "us", name: "USA" },
  { code: "ar", name: "Argentina" },
  { code: "br", name: "Brasil" },
  { code: "co", name: "Colombia" },
  { code: "cl", name: "Chile" },
  { code: "es", name: "España" },
];

/**
 * Available categories for NewsData.io
 */
export const NEWSDATA_CATEGORIES = [
  "technology",
  "business",
  "entertainment",
  "science",
  "health",
  "sports",
  "top",
];
