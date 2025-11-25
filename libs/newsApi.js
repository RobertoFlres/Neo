import axios from "axios";

/**
 * Map our category names to News API search parameters
 */
export const mapCategoryToNewsApi = (category) => {
  const mapping = {
    "technology": { category: "technology", q: null }, // Use category for tech
    "business": { category: "business", q: null }, // Use category for business
    "startups": { category: null, q: "startups" }, // Use keyword search for startups
    "general": { category: null, q: null },
  };
  return mapping[category] || { category: null, q: null };
};

/**
 * Fetches news articles from News API
 * 
 * @param {string} category - Category to fetch (technology, business, startups, etc.)
 * @param {string} country - Country code (us, mx, ar, etc.)
 * @param {number} pageSize - Number of articles to fetch (default: 10)
 * @returns {Promise<Array>} Array of news articles
 */
export const getNewsArticles = async (category = "technology", country = "us", pageSize = 10) => {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.error("⚠️ NEWS_API_KEY not found in environment variables");
    throw new Error("News API key is not configured");
  }

  // Map category to News API format
  const searchParams = mapCategoryToNewsApi(category);
  console.log(`📝 Mapping category "${category}" to:`, searchParams);

  try {
    let articles = [];

    // If we have a specific category, use top-headlines
    if (searchParams.category) {
      const url = `https://newsapi.org/v2/top-headlines`;
      
      let params = {
        category: searchParams.category,
        country,
        pageSize,
      };

      let response = await axios.get(url, {
        params,
        headers: {
          "X-API-Key": apiKey,
        },
      });

      articles = response.data.articles || [];

      // Filter and format articles
      articles = articles
        .filter((article) => article.title && article.url && article.description)
        .map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source?.name || "News API",
          publishedAt: article.publishedAt,
          image: article.urlToImage,
        }));

      // If no articles with category, try without category
      if (articles.length === 0) {
        console.log(`⚠️ No articles with category '${searchParams.category}'. Trying without category...`);
        
        params = {
          country,
          pageSize,
        };

        response = await axios.get(url, {
          params,
          headers: {
            "X-API-Key": apiKey,
          },
        });

        articles = response.data.articles || [];
        articles = articles
          .filter((article) => article.title && article.url && article.description)
          .map((article) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source?.name || "News API",
            publishedAt: article.publishedAt,
            image: article.urlToImage,
          }));
      }
    }
    
    // If we have keywords to search, use everything endpoint
    if (searchParams.q) {
      console.log(`🔍 Searching News API with keywords: "${searchParams.q}"`);
      
      const url = `https://newsapi.org/v2/everything`;
      
      // Build search query with country context
      let queryString = searchParams.q;
      if (country === "mx") {
        queryString = `${searchParams.q} mexico`;
      }
      
      const params = {
        q: queryString,
        sortBy: "publishedAt",
        pageSize: pageSize * 2, // Get more to filter
      };

      const response = await axios.get(url, {
        params,
        headers: {
          "X-API-Key": apiKey,
        },
      });

      const allArticles = response.data.articles || [];
      
      // Filter and format articles
      articles = allArticles
        .filter((article) => article.title && article.url && article.description)
        .map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source?.name || "News API",
          publishedAt: article.publishedAt,
          image: article.urlToImage,
        }))
        .slice(0, pageSize); // Limit to pageSize
    }

    console.log(`✅ Fetched ${articles.length} articles from News API (${country}, ${category})`);
    
    if (articles.length === 0) {
      console.warn(`⚠️ No articles found for ${country} - ${category}`);
    }
    
    return articles;
  } catch (error) {
    console.error("❌ Error fetching news:", error.response?.data || error.message);
    
    // Return empty array instead of throwing to allow graceful degradation
    if (error.response?.data?.status === "error") {
      console.error("News API error:", error.response.data.message);
      return [];
    }
    
    throw error;
  }
};

/**
 * Fetch news with multiple categories
 * Returns articles from multiple sources mixed together
 */
export const getNewsFromMultipleSources = async (categories = ["technology", "business"], country = "us") => {
  try {
    const allArticles = [];
    
    for (const category of categories) {
      const articles = await getNewsArticles(category, country, 5);
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

