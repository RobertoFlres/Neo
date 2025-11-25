import axios from "axios";
import { JSDOM } from "jsdom";

/**
 * Scrape Expansión Tech News
 * https://expansion.mx/tecnologia
 * 
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of articles
 */
export const getExpansionArticles = async (limit = 20) => {
  try {
    console.log("📰 Scraping Expansión...");
    
    const response = await axios.get("https://expansion.mx/tecnologia", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const articles = [];
    
    // Get all links from the page
    const allLinks = document.querySelectorAll('a[href]');
    
    console.log(`Found ${allLinks.length} total links on page`);
    
    allLinks.forEach((element) => {
      try {
        const link = element.href || element.getAttribute('href');
        
        // Filter for technology links
        if (link && (link.includes('/tecnologia/') || link.includes('/tecnologia'))) {
          const titleElement = element.querySelector('h2, h3, h4, p') || element;
          let title = titleElement.textContent?.trim() || 
                     element.getAttribute('title') || 
                     element.textContent?.trim() || 
                     '';
          
          // Clean up title
          title = title.replace(/\s+/g, ' ').trim();
          
          // Only add if we have a meaningful title (more than 10 chars)
          if (title.length > 10) {
            const fullUrl = link.startsWith('http') ? link : `https://expansion.mx${link}`;
            
            articles.push({
              title,
              description: '',
              url: fullUrl,
              source: "Expansión",
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
      new Map(articles.map(article => [article.url, article])).values()
    );
    
    console.log(`✅ Scraped ${uniqueArticles.length} articles from Expansión`);
    
    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error scraping Expansión:", error.message);
    return [];
  }
};

/**
 * Get tech news filtered by keywords
 */
export const getExpansionTechNews = async (category = "startups", limit = 10) => {
  try {
    const articles = await getExpansionArticles(limit * 2);
    
    // Filter by category keywords
    const keywords = {
      technology: ["IA", "inteligencia artificial", "tecnología", "tech", "ChatGPT", "AI", "software"],
      business: ["negocios", "empresa", "startup", "emprendedor", "financiamiento"],
      startups: ["startup", "emprendimiento", "unicornio", "financiamiento", "funding", "inversión"],
    };
    
    const categoryKeywords = keywords[category] || keywords.technology;
    
    const filteredArticles = articles.filter((article) => {
      const title = article.title.toLowerCase();
      return categoryKeywords.some(keyword => title.includes(keyword.toLowerCase()));
    });
    
    return filteredArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error filtering Expansión news:", error.message);
    return [];
  }
};

