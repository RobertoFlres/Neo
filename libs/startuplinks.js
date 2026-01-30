import axios from "axios";
import cheerio from "cheerio";
import { filterByCategory } from "./categoryKeywords";

/**
 * Scrape articles from Startuplinks.world
 * https://www.startuplinks.world/comunidad/noticias
 *
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of articles
 */
export const getStartuplinksArticles = async (limit = 30) => {
  try {
    const url = "https://www.startuplinks.world/comunidad/noticias";
    console.log(`📰 Scraping Startuplinks.world...`);

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
        if (link && !link.startsWith('http')) {
          if (link.startsWith('/')) {
            link = 'https://www.startuplinks.world' + link;
          } else {
            link = 'https://www.startuplinks.world/' + link;
          }
        }

        // Remove anchors and fragments
        link = link.split('#')[0].split('?')[0];

        // Filter for valid article links
        if (!link || !link.includes('startuplinks.world')) return;

        // Skip if it's the main listing page
        if (link === 'https://www.startuplinks.world/comunidad/noticias' ||
            link === 'https://www.startuplinks.world/comunidad/noticias/' ||
            link.endsWith('/comunidad/noticias')) {
          return;
        }

        // Check if it's an article link
        const excludedPaths = [
          '/comunidad/noticias',
          '/',
          '/comunidad',
          '/login',
          '/register',
          '/about',
        ];

        const isExcluded = excludedPaths.some(path =>
          link === `https://www.startuplinks.world${path}` ||
          link === `https://www.startuplinks.world${path}/` ||
          link.endsWith(path) ||
          link.endsWith(`${path}/`)
        );

        const isArticleLink = !isExcluded &&
          link.includes('startuplinks.world') &&
          link !== 'https://www.startuplinks.world' &&
          link !== 'https://www.startuplinks.world/';

        if (isArticleLink) {
          // Validate URL format
          try {
            const urlObj = new URL(link);
            if (!urlObj.protocol.startsWith('http')) return;
          } catch (e) {
            return;
          }

          // Skip if already seen
          if (seenUrls.has(link)) return;

          // Get title from various elements
          let title = '';

          // Strategy 1: Get from title attribute
          title = $(element).attr('title') || $(element).attr('data-title') || '';

          // Strategy 2: Get from heading element inside or near the link
          if (!title) {
            const headingElement = $(element).find('h1, h2, h3, h4, h5, h6').first();
            if (headingElement.length) {
              title = headingElement.text()?.trim() || '';
            }
          }

          // Strategy 3: Get from element with class containing "title"
          if (!title) {
            const titleClassElement = $(element).find('[class*="title"], .title').first();
            if (titleClassElement.length) {
              title = titleClassElement.text()?.trim() || '';
            }
          }

          // Strategy 4: Get from element textContent
          if (!title || title.length < 10) {
            const text = $(element).text()?.trim() || '';
            if (text.length >= 10 && text.length <= 200) {
              title = text;
            }
          }

          // Clean up title
          title = title.replace(/\s+/g, ' ').trim();

          // Only add if we have a meaningful title
          if (title.length > 10 && !/^\d+$/.test(title)) {
            seenUrls.add(link);

            articles.push({
              title,
              description: '',
              url: link,
              source: "Startuplinks",
              publishedAt: new Date().toISOString(),
              image: null,
            });
          }
        }
      } catch (error) {
        // Ignore errors for individual links
      }
    });

    // Remove duplicates by URL
    const uniqueArticles = Array.from(
      new Map(articles.map(article => [article.url, article])).values()
    );

    console.log(`✅ Scraped ${uniqueArticles.length} articles from Startuplinks.world`);

    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error(`❌ Error scraping Startuplinks.world:`, error.message);
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
export const getStartuplinksNews = async (category = "startups", limit = 15) => {
  try {
    const articles = await getStartuplinksArticles(limit * 3);

    // Use centralized category filtering (strict mode)
    const filteredArticles = filterByCategory(articles, category, true);

    const result = filteredArticles.slice(0, limit);

    console.log(`✅ Startuplinks: ${result.length}/${articles.length} articles matched category "${category}"`);

    return result;
  } catch (error) {
    console.error("❌ Error filtering Startuplinks news:", error.message);
    return [];
  }
};
