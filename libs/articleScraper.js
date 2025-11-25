import axios from "axios";
import { JSDOM } from "jsdom";

/**
 * Scrape article content from URL
 * Extracts the main text content from news articles
 * 
 * @param {string} url - Article URL
 * @returns {Promise<string>} Article content
 */
export const scrapeArticle = async (url) => {
  try {
    console.log(`📄 Scraping article from: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 10000, // 10 second timeout
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    // Remove unwanted elements
    const unwantedSelectors = "script, style, nav, header, footer, aside, .advertisement, .ads, [class*='ad-'], [id*='ad-']";
    document.querySelectorAll(unwantedSelectors).forEach(el => el.remove());
    
    // Try to find main content - common patterns
    let content = "";
    
    // Try different selectors for article content
    const selectors = [
      "article",
      "[role='main']",
      "main",
      ".article-content",
      ".post-content",
      ".entry-content",
      ".content",
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        // Get text content from the first element
        content = elements[0].textContent.trim();
        if (content.length > 200) {
          break;
        }
      }
    }
    
    // If we couldn't find content with specific selectors, try to get from body
    if (content.length < 200) {
      content = document.body.textContent.trim();
    }
    
    // Clean up the content
    content = content
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n+/g, "\n") // Replace multiple newlines with single newline
      .trim();
    
    console.log(`✅ Scraped ${content.length} characters from article`);
    
    return content;
  } catch (error) {
    console.error(`❌ Error scraping article from ${url}:`, error.message);
    return "";
  }
};

/**
 * Scrape multiple articles
 * 
 * @param {Array} articles - Array of article objects with url property
 * @returns {Promise<Array>} Array of articles with scraped content
 */
export const scrapeArticles = async (articles) => {
  const scrapedArticles = [];
  
  for (const [index, article] of articles.entries()) {
    console.log(`📄 Scraping article ${index + 1}/${articles.length}`);
    
    const content = await scrapeArticle(article.url);
    
    scrapedArticles.push({
      ...article,
      fullContent: content,
    });
    
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  
  return scrapedArticles;
};

