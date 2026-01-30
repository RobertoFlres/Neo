import axios from "axios";
import { JSDOM } from "jsdom";
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

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const articles = [];
    const seenUrls = new Set();
    
    // Try to find article cards or links
    // Common patterns: article links, news items, card components
    const articleSelectors = [
      'a[href*="/noticias/"]',
      'a[href*="/comunidad/noticias/"]',
      '.article-link',
      '.news-item a',
      '[class*="article"] a',
      '[class*="news"] a',
      'article a',
    ];
    
    // First, try to get all links
    let allLinks = Array.from(document.querySelectorAll('a[href]'));
    
    console.log(`Found ${allLinks.length} total links on page`);
    
    allLinks.forEach((element) => {
      try {
        let link = element.href || element.getAttribute('href');
        
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
        // Accept links that:
        // 1. Are from startuplinks.world
        // 2. Contain "noticias" in path
        // 3. Are not the main listing page
        // 4. Have additional path segments (specific article)
        
        if (!link || !link.includes('startuplinks.world')) return;
        
        // Skip if it's the main listing page
        if (link === 'https://www.startuplinks.world/comunidad/noticias' ||
            link === 'https://www.startuplinks.world/comunidad/noticias/' ||
            link.endsWith('/comunidad/noticias')) {
          return;
        }
        
        // Check if it's an article link
        // Be more flexible - accept any link from startuplinks.world that's not the main pages
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
          console.log(`🔍 Processing link: ${link}`);
          
          // Validate URL format
          try {
            const url = new URL(link);
            if (!url.protocol.startsWith('http')) return;
          } catch (e) {
            // Invalid URL, skip
            return;
          }
          
          // Skip if already seen
          if (seenUrls.has(link)) return;
          
          console.log(`🔍 Checking link: ${link}`);
          
          // Get title from various elements - try multiple strategies
          let title = '';
          
          // Strategy 1: Get from title attribute
          if (!title) {
            title = element.getAttribute('title') || 
                   element.getAttribute('data-title') || '';
          }
          
          // Strategy 2: Get from heading element inside or near the link
          if (!title) {
            const headingElement = element.querySelector('h1, h2, h3, h4, h5, h6') ||
                                  element.closest('article')?.querySelector('h1, h2, h3, h4, h5, h6') ||
                                  element.parentElement?.querySelector('h1, h2, h3, h4, h5, h6');
            if (headingElement) {
              title = headingElement.textContent?.trim() || '';
            }
          }
          
          // Strategy 3: Get from element with class containing "title"
          if (!title) {
            const titleClassElement = element.querySelector('[class*="title"], .title, [class*="Title"]') ||
                                     element.closest('article')?.querySelector('[class*="title"], .title') ||
                                     element.parentElement?.querySelector('[class*="title"], .title');
            if (titleClassElement) {
              title = titleClassElement.textContent?.trim() || '';
            }
          }
          
          // Strategy 4: Get from element textContent (but filter out very long text)
          if (!title || title.length < 10) {
            const text = element.textContent?.trim() || '';
            // Only use textContent if it's a reasonable length (10-200 chars)
            if (text.length >= 10 && text.length <= 200) {
              title = text;
            }
          }
          
          // Clean up title
          title = title.replace(/\s+/g, ' ').trim();
          
          console.log(`📝 Extracted title: "${title.substring(0, 60)}${title.length > 60 ? '...' : ''}"`);
          
          // Get description if available
          let description = '';
          const descElement = element.querySelector('p, .description, [class*="description"]') ||
                            element.closest('article')?.querySelector('p');
          if (descElement) {
            description = descElement.textContent?.trim() || '';
          }
          
          // Get date if available
          let publishedAt = new Date().toISOString();
          const dateElement = element.querySelector('time, .date, [class*="date"]') ||
                            element.closest('article')?.querySelector('time, .date');
          if (dateElement) {
            const dateText = dateElement.textContent?.trim() || dateElement.getAttribute('datetime');
            if (dateText) {
              try {
                publishedAt = new Date(dateText).toISOString();
              } catch (e) {
                // Keep default date
              }
            }
          }
          
          // Get category/type if available
          let category = '';
          const categoryElement = element.querySelector('.category, .type, [class*="category"], [class*="badge"]') ||
                                element.closest('article')?.querySelector('.category, .type, [class*="badge"]');
          if (categoryElement) {
            category = categoryElement.textContent?.trim() || '';
          }
          
          // Only add if we have a meaningful title
          if (title.length > 10 && !/^\d+$/.test(title)) {
            
            seenUrls.add(link);
            
            console.log(`✅ Added article: ${title.substring(0, 50)}...`);
            
            articles.push({
              title,
              description: description || '',
              url: link,
              source: "Startuplinks",
              publishedAt,
              image: null,
              category: category || undefined,
            });
          } else {
            console.log(`⚠️ Skipped - title too short or invalid: "${title}"`);
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

