import axios from "axios";
import { JSDOM } from "jsdom";
import { filterByCategory } from "./categoryKeywords";

/**
 * Scrape Noro.mx News
 * Supports both /tecnologia/ and /negocios/ sections
 *
 * @param {string} section - Section to scrape: 'tecnologia' or 'negocios'
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of articles
 */
export const getNoroArticles = async (section = "tecnologia", limit = 20) => {
  try {
    const url = `https://noro.mx/${section}/`;
    console.log(`📰 Scraping Noro.mx ${section}...`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const articles = [];

    // Get all links from the page
    const allLinks = document.querySelectorAll("a[href]");

    allLinks.forEach((element) => {
      try {
        const link = element.href || element.getAttribute("href");

        // Filter for section links (tecnologia or negocios)
        if (
          link &&
          (link.includes(`/${section}/`) ||
            link.includes("/tecnologia/") ||
            link.includes("/negocios/"))
        ) {
          const titleElement = element.querySelector("h2, h3, h4, p") || element;
          let title =
            titleElement.textContent?.trim() ||
            element.getAttribute("title") ||
            element.textContent?.trim() ||
            "";

          // Clean up title
          title = title.replace(/\s+/g, " ").trim();

          // Only add if we have a meaningful title (more than 15 chars and not just dates/numbers)
          if (title.length > 15 && !/^\d+$/.test(title)) {
            const fullUrl = link.startsWith("http") ? link : `https://noro.mx${link}`;

            articles.push({
              title,
              description: "",
              url: fullUrl,
              source: "Noro.mx",
              publishedAt: new Date().toISOString(),
              image: null,
            });
          }
        }
      } catch (error) {
        // Ignore errors for individual links
      }
    });

    // Remove duplicates
    const uniqueArticles = Array.from(
      new Map(articles.map((article) => [article.url, article])).values()
    );

    console.log(`✅ Scraped ${uniqueArticles.length} articles from Noro.mx ${section}`);

    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error(`❌ Error scraping Noro.mx ${section}:`, error.message);
    return [];
  }
};

/**
 * Get tech/news articles from both sections, filtered by category
 *
 * @param {string} category - Category to filter (technology, business, startups)
 * @param {number} limit - Number of articles
 * @returns {Promise<Array>} Filtered articles
 */
export const getNoroTechNews = async (category = "technology", limit = 15) => {
  try {
    // Fetch from both sections for more content
    const [techArticles, businessArticles] = await Promise.all([
      getNoroArticles("tecnologia", limit * 2),
      getNoroArticles("negocios", limit * 2),
    ]);

    // Combine and remove duplicates
    const allArticles = [...techArticles, ...businessArticles];
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.url, article])).values()
    );

    // Use centralized category filtering (strict mode)
    const filteredArticles = filterByCategory(uniqueArticles, category, true);

    const result = filteredArticles.slice(0, limit);

    console.log(`✅ Noro.mx: ${result.length}/${uniqueArticles.length} articles matched category "${category}"`);

    return result;
  } catch (error) {
    console.error("❌ Error filtering Noro.mx news:", error.message);
    return [];
  }
};
