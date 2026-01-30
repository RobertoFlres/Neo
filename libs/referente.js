import axios from "axios";
import cheerio from "cheerio";
import { filterByCategory } from "./categoryKeywords";

/**
 * Scrape articles from Referente.mx
 * Fetches articles from the main page covering various categories
 *
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of articles
 */
export const getReferenteArticles = async (limit = 30) => {
  try {
    const url = "https://www.referente.mx/";
    console.log(`📰 Scraping Referente.mx...`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    const articles = [];
    const seenUrls = new Set();

    // Get all links from the page
    $('a[href]').each((_, element) => {
      try {
        let link = $(element).attr('href');

        if (!link) return;

        // Normalize the link
        if (link && !link.startsWith('http') && !link.startsWith('#')) {
          link = 'https://www.referente.mx' + link;
        }

        // Remove anchors and fragments
        link = link.split('#')[0];

        // Validate URL format
        try {
          const urlObj = new URL(link);
          if (!urlObj.protocol.startsWith('http')) return;
        } catch (e) {
          return;
        }

        // Get title from various elements
        const titleElement = $(element).find('h2, h3, h4, h5, .entry-title, .post-title, .title').first();
        let title = titleElement.text()?.trim() ||
                   $(element).attr('title') ||
                   $(element).attr('data-title') ||
                   $(element).text()?.trim() ||
                   '';

        // Clean up title
        title = title.replace(/\s+/g, ' ').trim();

        // Filter for valid article links
        if (link &&
            typeof link === 'string' &&
            link.includes('referente.mx') &&
            !link.includes('/wp-content/') &&
            !link.includes('/wp-admin/') &&
            !link.includes('/author/') &&
            !link.includes('/category/') &&
            !link.includes('/tag/') &&
            !link.includes('/?s=') &&
            !link.includes('/wp-json') &&
            !link.includes('/feed') &&
            !link.includes('/comments') &&
            title.length > 10 &&
            !/^\d+$/.test(title) &&
            !seenUrls.has(link) &&
            link !== 'https://www.referente.mx/' &&
            link !== 'https://www.referente.mx' &&
            !link.endsWith('referente.mx')) {

          seenUrls.add(link);

          articles.push({
            title,
            description: '',
            url: link,
            source: "Referente.mx",
            publishedAt: new Date().toISOString(),
            image: null,
          });
        }
      } catch (error) {
        // Ignore errors for individual links
      }
    });

    // Remove duplicates by URL
    const uniqueArticles = Array.from(
      new Map(articles.map(article => [article.url, article])).values()
    );

    console.log(`✅ Scraped ${uniqueArticles.length} articles from Referente.mx`);

    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error(`❌ Error scraping Referente.mx:`, error.message);
    return [];
  }
};

/**
 * Get articles filtered by category using centralized keywords
 *
 * @param {string} category - Category to filter (technology, business, startups)
 * @param {number} limit - Number of articles
 * @returns {Promise<Array>} Filtered articles
 */
export const getReferenteNews = async (category = "technology", limit = 15) => {
  try {
    const articles = await getReferenteArticles(limit * 3);

    // Use centralized category filtering (strict mode)
    const filteredArticles = filterByCategory(articles, category, true);

    const result = filteredArticles.slice(0, limit);

    console.log(`✅ Referente.mx: ${result.length}/${articles.length} articles matched category "${category}"`);

    return result;
  } catch (error) {
    console.error("❌ Error filtering Referente.mx news:", error.message);
    return [];
  }
};
