import axios from "axios";

/**
 * Fetch news from NewsData.io API
 * Better coverage for Mexico and Latin America
 * 
 * @param {string} category - Category to fetch
 * @param {string} country - Country code
 * @param {number} pageSize - Number of results
 * @returns {Promise<Array>} Array of news articles
 */
export const getNewsDataArticles = async (category = "technology", country = "mx", pageSize = 10) => {
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey) {
    console.error("⚠️ NEWSDATA_API_KEY not found in environment variables");
    throw new Error("NewsData API key is not configured");
  }

  // Map category to NewsData.io format
  const searchParams = mapCategoryToNewsData(category);
  console.log(`📝 Mapping category "${category}" to:`, searchParams);

  try {
    const url = "https://newsdata.io/api/1/news";
    
    const params = {
      apikey: apiKey,
      country: country,
      language: "es,en", // Spanish or English
      size: pageSize,
    };

    // Add category or keyword search
    if (searchParams.category) {
      params.category = searchParams.category;
    }
    if (searchParams.q) {
      params.q = searchParams.q;
    }

    let response = await axios.get(url, { params });

    let articles = response.data.results || [];
    
    // If no articles found and we're using business category in MX, try without country filter
    if (articles.length === 0 && searchParams.category === "business" && country === "mx") {
      console.log("⚠️ No business articles for MX, trying without country filter...");
      params.country = null; // Remove country filter
      response = await axios.get(url, { params });
      articles = response.data.results || [];
    }
    
    // Filter and format articles
    const formattedArticles = articles
      .filter((article) => article.title && article.link && article.description)
      .map((article) => ({
        title: article.title,
        description: article.description || "",
        url: article.link,
        source: article.source_name || "NewsData",
        publishedAt: article.pubDate || new Date().toISOString(),
        image: article.image_url,
      }));

    console.log(`✅ Fetched ${formattedArticles.length} articles from NewsData.io (${country}, ${category})`);
    
    return formattedArticles;
  } catch (error) {
    console.error("❌ Error fetching from NewsData:", error.response?.data || error.message);
    
    if (error.response?.data?.status === "error") {
      console.error("NewsData error:", error.response.data.message);
      return [];
    }
    
    throw error;
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
 * See: https://newsdata.io/documentation
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

/**
 * Map our category names to NewsData.io search parameters
 */
export const mapCategoryToNewsData = (category) => {
  const mapping = {
    "technology": { category: null, q: "tecnología OR technology OR tech" },
    "business": { category: "business", q: null }, // Use category for business instead of keywords
    "startups": { category: null, q: "startups OR startup OR emprendimiento" },
    "general": { category: null, q: null },
  };
  return mapping[category] || { category: null, q: null };
};

