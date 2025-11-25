import axios from "axios";
import { JSDOM } from "jsdom";

/**
 * Scrape Entrepreneur Spanish Tech News
 * https://spanish.entrepreneur.com/tecnologia
 * 
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of articles
 */
export const getEntrepreneurSpanishArticles = async (limit = 20) => {
  try {
    console.log("📰 Scraping Entrepreneur Spanish...");
    
    const response = await axios.get("https://spanish.entrepreneur.com/tecnologia", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const articles = [];
    
    // Try to find article containers
    // Common selectors for article links
    const articleSelectors = [
      'a[href*="/tecnologia/"]',
      '.article-link',
      '.post-link',
      'article a',
    ];
    
    let articleElements = [];
    for (const selector of articleSelectors) {
      articleElements = document.querySelectorAll(selector);
      if (articleElements.length > 0) break;
    }
    
    articleElements.forEach((element, index) => {
      if (index < limit) {
        try {
          const link = element.href || element.getAttribute('href');
          const title = element.textContent?.trim() || 
                       element.querySelector('h2, h3')?.textContent?.trim() ||
                       element.getAttribute('title') || 
                       '';
          
          if (title && link && link.includes('/tecnologia/')) {
            articles.push({
              title,
              description: '',
              url: link.startsWith('http') ? link : `https://spanish.entrepreneur.com${link}`,
              source: "Entrepreneur Español",
              publishedAt: new Date().toISOString(),
              image: null,
            });
          }
        } catch (error) {
          console.error("Error extracting article:", error);
        }
      }
    });
    
    // Remove duplicates
    const uniqueArticles = Array.from(
      new Map(articles.map(article => [article.url, article])).values()
    );
    
    console.log(`✅ Scraped ${uniqueArticles.length} articles from Entrepreneur Spanish`);
    
    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error scraping Entrepreneur Spanish:", error.message);
    return [];
  }
};

/**
 * Get tech news filtered by keywords
 */
export const getEntrepreneurTechNews = async (category = "startups", limit = 10) => {
  try {
    const articles = await getEntrepreneurSpanishArticles(limit * 2);
    
    // Filter by category keywords
    const keywords = {
      technology: ["IA", "inteligencia artificial", "tecnología", "tech", "ChatGPT", "AI"],
      business: ["negocios", "empresa", "startup", "emprendedor"],
      startups: ["startup", "emprendimiento", "unicornio", "financiamiento", "funding"],
    };
    
    const categoryKeywords = keywords[category] || keywords.technology;
    
    const filteredArticles = articles.filter((article) => {
      const title = article.title.toLowerCase();
      return categoryKeywords.some(keyword => title.includes(keyword.toLowerCase()));
    });
    
    return filteredArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error filtering Entrepreneur news:", error.message);
    return [];
  }
};

