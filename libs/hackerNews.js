import axios from "axios";
import { filterByCategory, matchesCategory } from "./categoryKeywords";

/**
 * Fetch top stories from Hacker News
 * Great for tech/startup news
 *
 * @param {string} category - Category to filter (technology, business, startups)
 * @param {number} limit - Number of stories to fetch (default: 20)
 * @returns {Promise<Array>} Array of news articles
 */
export const getHackerNewsStories = async (category = "technology", limit = 20) => {
  try {
    // First, get the list of top story IDs
    const topStoriesResponse = await axios.get(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );

    // Get more stories to have better filtering results
    const storyIds = topStoriesResponse.data.slice(0, limit * 5);

    // Fetch details for each story in parallel
    const storiesPromises = storyIds.map(async (id) => {
      try {
        const storyResponse = await axios.get(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
          { timeout: 5000 }
        );
        return storyResponse.data;
      } catch (err) {
        return null;
      }
    });

    const stories = (await Promise.all(storiesPromises)).filter(Boolean);

    // Format stories first
    let articles = stories
      .filter((story) => story && story.url && story.type === "story" && story.title)
      .map((story) => ({
        title: story.title,
        description: `${story.score || 0} puntos | ${story.descendants || 0} comentarios`,
        url: story.url,
        source: "Hacker News",
        publishedAt: new Date(story.time * 1000).toISOString(),
        image: null,
        score: story.score,
      }));

    // Filter by category using centralized keywords (strict mode)
    const filteredArticles = filterByCategory(articles, category, true);

    // Limit results
    const result = filteredArticles.slice(0, limit);

    console.log(`✅ Hacker News: ${result.length}/${articles.length} articles matched category "${category}"`);

    return result;
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
    // Use Algolia HN Search API for better keyword search
    const response = await axios.get(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(searchTerm)}&tags=story&hitsPerPage=${limit}`,
      { timeout: 10000 }
    );

    const articles = (response.data.hits || [])
      .filter((hit) => hit.url && hit.title)
      .map((hit) => ({
        title: hit.title,
        description: `${hit.points || 0} puntos | ${hit.num_comments || 0} comentarios`,
        url: hit.url,
        source: "Hacker News",
        publishedAt: hit.created_at || new Date().toISOString(),
        image: null,
        score: hit.points,
      }));

    console.log(`✅ Found ${articles.length} Hacker News stories matching "${searchTerm}"`);

    return articles;
  } catch (error) {
    console.error("❌ Error searching Hacker News:", error.message);
    return [];
  }
};

/**
 * Get today's top tech/startup stories from Hacker News
 *
 * @param {number} limit - Number of stories to fetch (default: 10)
 * @returns {Promise<Array>} Array of news articles
 */
export const getTodayTechNews = async (limit = 10) => {
  try {
    return await getHackerNewsStories("technology", limit);
  } catch (error) {
    console.error("❌ Error fetching tech news from Hacker News:", error.message);
    return [];
  }
};
