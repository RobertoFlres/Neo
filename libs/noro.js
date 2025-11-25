import axios from "axios";
import { JSDOM } from "jsdom";

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
        
        // Filter for section links (tecnologia or negocios)
        if (link && (
          link.includes(`/${section}/`) || 
          link.includes(`/${section}`) ||
          // Also include links to articulos that might be in the section
          (link.includes('/tecnologia/') || link.includes('/negocios/'))
        )) {
          const titleElement = element.querySelector('h2, h3, h4, p') || element;
          let title = titleElement.textContent?.trim() || 
                     element.getAttribute('title') || 
                     element.textContent?.trim() || 
                     '';
          
          // Clean up title
          title = title.replace(/\s+/g, ' ').trim();
          
          // Only add if we have a meaningful title (more than 10 chars and not just dates/numbers)
          if (title.length > 10 && !/^\d+$/.test(title)) {
            const fullUrl = link.startsWith('http') ? link : `https://noro.mx${link}`;
            
            articles.push({
              title,
              description: '',
              url: fullUrl,
              source: `Noro.mx ${section === 'tecnologia' ? 'Tecnología' : 'Negocios'}`,
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
    
    console.log(`✅ Scraped ${uniqueArticles.length} articles from Noro.mx ${section}`);
    
    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error(`❌ Error scraping Noro.mx ${section}:`, error.message);
    return [];
  }
};

/**
 * Get tech/news articles from both sections
 */
export const getNoroTechNews = async (category = "startups", limit = 10) => {
  try {
    // Fetch from both sections if needed
    const techArticles = await getNoroArticles('tecnologia', limit);
    const businessArticles = await getNoroArticles('negocios', limit);
    
    // Combine and remove duplicates
    const allArticles = [...techArticles, ...businessArticles];
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.url, article])).values()
    );
    
    // Filter by category keywords if needed
    const keywords = {
      technology: ["IA", "inteligencia artificial", "tecnología", "tech", "ChatGPT", "AI", "software", "semiconductores"],
      business: ["negocios", "empresa", "startup", "emprendedor", "financiamiento", "nearshoring"],
      startups: ["startup", "emprendimiento", "unicornio", "financiamiento", "funding", "inversión", "negocio"],
    };
    
    const categoryKeywords = keywords[category] || keywords.technology;
    
    const filteredArticles = uniqueArticles.filter((article) => {
      const title = article.title.toLowerCase();
      return categoryKeywords.some(keyword => title.includes(keyword.toLowerCase()));
    });
    
    return filteredArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error filtering Noro.mx news:", error.message);
    return [];
  }
};

