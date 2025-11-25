import axios from "axios";
import { JSDOM } from "jsdom";

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

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const articles = [];
    const seenUrls = new Set();
    
    // Get all links from the page
    const allLinks = document.querySelectorAll('a[href]');
    
    console.log(`Found ${allLinks.length} total links on page`);
    
    allLinks.forEach((element) => {
      try {
        let link = element.href || element.getAttribute('href');
        
        if (!link) return;
        
        // Normalize the link
        if (link && !link.startsWith('http') && !link.startsWith('#')) {
          link = 'https://www.referente.mx' + link;
        }
        
        // Remove anchors and fragments
        link = link.split('#')[0];
        
        // Validate URL format
        try {
          const url = new URL(link);
          if (!url.protocol.startsWith('http')) return;
        } catch (e) {
          // Invalid URL, skip
          return;
        }
        
        // Get title from various elements
        const titleElement = element.querySelector('h2, h3, h4, h5, .entry-title, .post-title, .title') || element;
        let title = titleElement.textContent?.trim() || 
                   element.getAttribute('title') || 
                   element.getAttribute('data-title') ||
                   element.textContent?.trim() || 
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
 * Get articles filtered by category keywords
 */
export const getReferenteNews = async (category = "startups", limit = 10) => {
  try {
    // Get all articles
    const allArticles = await getReferenteArticles(100);
    
    // Filter by category keywords
    const keywords = {
      technology: ["IA", "inteligencia artificial", "tecnología", "tech", "ChatGPT", "AI", "software", "semiconductores", "digital", "innovación"],
      business: ["negocios", "empresa", "startup", "emprendedor", "financiamiento", "nearshoring", "inversión", "capital", "manufacturero"],
      startups: ["startup", "emprendimiento", "unicornio", "financiamiento", "funding", "inversión", "negocio", "invent", "capital", "ecosistema"],
    };
    
    const categoryKeywords = keywords[category] || keywords.technology;
    
    const filteredArticles = allArticles.filter((article) => {
      const title = article.title.toLowerCase();
      const description = article.description.toLowerCase();
      return categoryKeywords.some(keyword => 
        title.includes(keyword.toLowerCase()) || description.includes(keyword.toLowerCase())
      );
    });
    
    return filteredArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error filtering Referente.mx news:", error.message);
    return [];
  }
};
