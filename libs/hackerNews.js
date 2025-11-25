import axios from "axios";

/**
 * Fetch top stories from Hacker News
 * Great for tech/startup news
 * 
 * @param {string} category - Category to filter (technology, business, startups)
 * @param {string} country - Country context (currently not used for HN)
 * @param {number} limit - Number of stories to fetch (default: 20)
 * @returns {Promise<Array>} Array of news articles
 */
export const getHackerNewsStories = async (category = "technology", country = "mx", limit = 20) => {
  try {
    // Map category to search keywords
    const categoryKeywords = {
      "technology": ["tech", "software", "code", "app", "api", "github", "python", "javascript", "react", "node", "AI", "machine learning", "cloud", "dev", "programming", "zig", "computer", "language", "OS"],
      "business": ["business", "funding", "venture", "entrepreneur", "company", "enterprise", "revenue", "market"],
      "startups": ["startup", "founder", "entrepreneur", "launch", "seed", "series", "investor", "unicorn"],
      "general": []
    };

    const keywords = categoryKeywords[category] || categoryKeywords["general"];

    // First, get the list of top story IDs
    const topStoriesResponse = await axios.get(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );
    
    const storyIds = topStoriesResponse.data.slice(0, limit * 3); // Get even more stories for better filtering
    
    // Fetch details for each story
    const storiesPromises = storyIds.map(async (id) => {
      const storyResponse = await axios.get(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return storyResponse.data;
    });
    
    const stories = await Promise.all(storiesPromises);
    
    // Filter and format stories
    let articles = stories
      .filter((story) => story.url && story.type === "story")
      .map((story) => ({
        title: story.title,
        description: `🔗 ${story.score || 0} puntos • ${story.descendants || 0} comentarios`,
        url: story.url,
        source: "Hacker News",
        publishedAt: new Date(story.time * 1000).toISOString(),
        image: null,
        score: story.score,
      }));

    // Filter by keywords if category is not "general"
    if (category !== "general" && keywords.length > 0) {
      articles = articles.filter((article) => {
        const title = article.title.toLowerCase();
        // Check if title contains ANY of the keywords
        return keywords.some(keyword => 
          title.includes(keyword.toLowerCase().replace(/\s+/g, ' '))
        );
      });
      
      // If no filtered results, return top stories without filtering
      if (articles.length === 0) {
        console.log(`⚠️ No ${category} stories found, returning top general stories`);
        articles = stories
          .filter((story) => story.url && story.type === "story")
          .map((story) => ({
            title: story.title,
            description: `🔗 ${story.score || 0} puntos • ${story.descendants || 0} comentarios`,
            url: story.url,
            source: "Hacker News",
            publishedAt: new Date(story.time * 1000).toISOString(),
            image: null,
            score: story.score,
          }));
      }
    }

    // Limit results
    articles = articles.slice(0, limit);
    
    console.log(`✅ Fetched ${articles.length} stories from Hacker News (category: ${category})`);
    
    return articles;
  } catch (error) {
    console.error("❌ Error fetching Hacker News stories:", error.message);
    return [];
  }
};

/**
 * Fetch Hacker News stories matching specific keywords
 * 
 * @param {string} searchTerm - Keywords to search for
 * @param {number} limit - Number of stories to fetch (default: 20)
 * @returns {Promise<Array>} Array of news articles
 */
export const getHackerNewsByKeyword = async (searchTerm, limit = 20) => {
  try {
    // Get top stories
    const articles = await getHackerNewsStories(limit * 2);
    
    // Filter by keyword in title
    const searchLower = searchTerm.toLowerCase();
    const filteredArticles = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower)
    );
    
    console.log(
      `✅ Found ${filteredArticles.length} Hacker News stories matching "${searchTerm}"`
    );
    
    return filteredArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error searching Hacker News:", error.message);
    return [];
  }
};

/**
 * Get today's top tech/startup stories from Hacker News
 * Filters for relevant keywords
 * 
 * @param {number} limit - Number of stories to fetch (default: 10)
 * @returns {Promise<Array>} Array of news articles
 */
export const getTodayTechNews = async (limit = 10) => {
  try {
    const keyword = "startup OR tech OR technology OR funding OR entrepreneur";
    const articles = await getHackerNewsStories(limit * 3);
    
    const techArticles = articles.filter((article) => {
      const title = article.title.toLowerCase();
      return (
        title.includes("startup") ||
        title.includes("tech") ||
        title.includes("technology") ||
        title.includes("funding") ||
        title.includes("entrepreneur") ||
        title.includes("business")
      );
    });
    
    console.log(
      `✅ Found ${techArticles.length} tech/startup stories from Hacker News`
    );
    
    return techArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error fetching tech news from Hacker News:", error.message);
    return [];
  }
};

