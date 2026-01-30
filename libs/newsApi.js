import axios from "axios";
import { filterByCategory, getCategorySearchQuery } from "./categoryKeywords";

/**
 * Map our category names to News API search parameters
 */
export const mapCategoryToNewsApi = (category) => {
  const mapping = {
    technology: { category: "technology", q: null },
    business: { category: "business", q: null },
    startups: { category: null, q: "startup OR startups OR founder OR funding OR venture capital OR unicorn" },
    general: { category: null, q: null },
  };
  return mapping[category] || { category: null, q: null };
};

/**
 * Fetches news articles from News API
 *
 * @param {string} category - Category to fetch (technology, business, startups, etc.)
 * @param {number} pageSize - Number of articles to fetch (default: 15)
 * @returns {Promise<Array>} Array of news articles
 */
export const getNewsArticles = async (category = "technology", pageSize = 15) => {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.error("⚠️ NEWS_API_KEY not found in environment variables");
    return [];
  }

  const searchParams = mapCategoryToNewsApi(category);
  console.log(`📝 News API - category "${category}" mapped to:`, searchParams);

  try {
    let articles = [];

    // If we have a specific category, use top-headlines
    if (searchParams.category) {
      const url = "https://newsapi.org/v2/top-headlines";

      // Try multiple countries for better coverage
      const countries = ["us", "mx", "es"];

      for (const country of countries) {
        try {
          const response = await axios.get(url, {
            params: {
              category: searchParams.category,
              country,
              pageSize: Math.ceil(pageSize / countries.length) + 5,
            },
            headers: { "X-API-Key": apiKey },
            timeout: 10000,
          });

          const countryArticles = (response.data.articles || [])
            .filter((article) => article.title && article.url && article.description)
            .map((article) => ({
              title: article.title,
              description: article.description,
              url: article.url,
              source: article.source?.name || "News API",
              publishedAt: article.publishedAt,
              image: article.urlToImage,
            }));

          articles.push(...countryArticles);
        } catch (err) {
          console.log(`⚠️ News API: Error fetching ${country}:`, err.message);
        }
      }
    }

    // If we have keywords to search, use everything endpoint
    if (searchParams.q) {
      console.log(`🔍 Searching News API with keywords: "${searchParams.q}"`);

      const url = "https://newsapi.org/v2/everything";

      try {
        const response = await axios.get(url, {
          params: {
            q: searchParams.q,
            sortBy: "publishedAt",
            language: "en",
            pageSize: pageSize * 2,
          },
          headers: { "X-API-Key": apiKey },
          timeout: 10000,
        });

        const searchArticles = (response.data.articles || [])
          .filter((article) => article.title && article.url && article.description)
          .map((article) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source?.name || "News API",
            publishedAt: article.publishedAt,
            image: article.urlToImage,
          }));

        articles.push(...searchArticles);
      } catch (err) {
        console.log(`⚠️ News API search error:`, err.message);
      }
    }

    // Remove duplicates by URL
    const uniqueArticles = Array.from(
      new Map(articles.map((a) => [a.url, a])).values()
    );

    // Apply category filter for additional accuracy
    const filteredArticles = filterByCategory(uniqueArticles, category, false);

    const result = filteredArticles.slice(0, pageSize);

    console.log(`✅ News API: ${result.length} articles for category "${category}"`);

    return result;
  } catch (error) {
    console.error("❌ Error fetching news:", error.response?.data || error.message);
    return [];
  }
};

/**
 * Fetch news with multiple categories
 * Returns articles from multiple sources mixed together
 */
export const getNewsFromMultipleSources = async (categories = ["technology", "business"]) => {
  try {
    const allArticles = [];

    for (const category of categories) {
      const articles = await getNewsArticles(category, 5);
      allArticles.push(...articles);
    }

    // Shuffle and limit to 10
    const shuffled = allArticles.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  } catch (error) {
    console.error("Error fetching multiple sources:", error);
    return [];
  }
};
