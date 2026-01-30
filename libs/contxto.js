import axios from "axios";
import { JSDOM } from "jsdom";
import { filterByCategory } from "./categoryKeywords";

/**
 * Scrape articles from Contxto
 * https://contxto.com - Specialized in LATAM startups
 *
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of articles
 */
export const getContxtoArticles = async (limit = 30) => {
  try {
    console.log("📰 Scraping Contxto...");

    // Fetch from multiple sections for more content
    const sections = [
      "https://contxto.com/en/",
      "https://contxto.com/en/startups/",
      "https://contxto.com/en/venture-capital/",
      "https://contxto.com/en/fintech/",
    ];

    const allArticles = [];

    for (const sectionUrl of sections) {
      try {
        const response = await axios.get(sectionUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          timeout: 15000,
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        // Get all article links
        const allLinks = document.querySelectorAll("a[href]");

        allLinks.forEach((element) => {
          try {
            const link = element.href || element.getAttribute("href");

            // Filter for article links (exclude category pages, authors, etc.)
            if (
              link &&
              link.includes("contxto.com") &&
              !link.includes("/author/") &&
              !link.includes("/category/") &&
              !link.includes("/tag/") &&
              !link.includes("/page/") &&
              !link.endsWith("/en/") &&
              !link.endsWith("/es/") &&
              link !== "https://contxto.com/" &&
              link !== "https://contxto.com/en/" &&
              link !== "https://contxto.com/es/"
            ) {
              // Check if it looks like an article URL (has date pattern or slug)
              const isArticle = /\/\d{4}\/|\/[a-z0-9-]{10,}/.test(link);

              if (isArticle) {
                const titleElement = element.querySelector("h2, h3, h4") || element;
                let title =
                  titleElement.textContent?.trim() ||
                  element.getAttribute("title") ||
                  element.textContent?.trim() ||
                  "";

                // Clean up title
                title = title.replace(/\s+/g, " ").trim();

                // Get description if available
                let description = "";
                const descElement = element.closest("article")?.querySelector("p, .excerpt");
                if (descElement) {
                  description = descElement.textContent?.trim() || "";
                }

                if (title.length > 15 && title.length < 300) {
                  const fullUrl = link.startsWith("http") ? link : `https://contxto.com${link}`;

                  allArticles.push({
                    title,
                    description: description.substring(0, 200),
                    url: fullUrl,
                    source: "Contxto",
                    publishedAt: new Date().toISOString(),
                    image: null,
                  });
                }
              }
            }
          } catch (error) {
            // Ignore errors for individual links
          }
        });
      } catch (error) {
        console.log(`⚠️ Error fetching ${sectionUrl}:`, error.message);
      }
    }

    // Remove duplicates
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.url, article])).values()
    );

    console.log(`✅ Scraped ${uniqueArticles.length} articles from Contxto`);

    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error scraping Contxto:", error.message);
    return [];
  }
};

/**
 * Get Contxto articles filtered by category
 *
 * @param {string} category - Category to filter (technology, business, startups)
 * @param {number} limit - Number of articles
 * @returns {Promise<Array>} Filtered articles
 */
export const getContxtoNews = async (category = "startups", limit = 15) => {
  try {
    const articles = await getContxtoArticles(limit * 3);

    // Use centralized category filtering (strict mode)
    const filteredArticles = filterByCategory(articles, category, true);

    const result = filteredArticles.slice(0, limit);

    console.log(`✅ Contxto: ${result.length}/${articles.length} articles matched category "${category}"`);

    return result;
  } catch (error) {
    console.error("❌ Error filtering Contxto news:", error.message);
    return [];
  }
};
