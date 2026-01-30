import axios from "axios";
import cheerio from "cheerio";

/**
 * Scrape article content from URL
 * Extracts the main text content from news articles with proper paragraph structure
 *
 * @param {string} url - Article URL
 * @returns {Promise<{text: string, paragraphs: string[], image: string|null}>} Article content
 */
export const scrapeArticle = async (url) => {
  try {
    console.log(`📄 Scraping article from: ${url}`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Try to find the main image
    let mainImage = null;
    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      "article img",
      ".article-image img",
      ".featured-image img",
      ".post-thumbnail img",
      "main img",
    ];

    for (const selector of imageSelectors) {
      const imgElement = $(selector).first();
      if (imgElement.length) {
        mainImage = imgElement.attr("content") || imgElement.attr("src");
        if (mainImage && mainImage.startsWith("http")) {
          break;
        }
      }
    }

    // Remove unwanted elements
    $("script, style, nav, header, footer, aside").remove();
    $(".advertisement, .ads, [class*='ad-'], [id*='ad-']").remove();
    $(".social-share, .comments, .related-posts, .newsletter-signup").remove();
    $(".sidebar, .menu, .navigation, form, iframe").remove();

    // Try to find main content
    let contentElement = null;
    const contentSelectors = [
      "article",
      "[role='main']",
      "main",
      ".article-content",
      ".article-body",
      ".post-content",
      ".entry-content",
      ".story-content",
      ".content-body",
      ".article__content",
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length && element.text().trim().length > 200) {
        contentElement = element;
        break;
      }
    }

    if (!contentElement) {
      contentElement = $("body");
    }

    // Extract paragraphs
    const paragraphs = [];
    contentElement.find("p").each((_, p) => {
      let text = $(p).text().trim();
      // Clean up whitespace
      text = text.replace(/\s+/g, " ").trim();

      // Only include substantial paragraphs (more than 50 chars)
      if (text.length > 50) {
        paragraphs.push(text);
      }
    });

    // If no paragraphs found, try to split by sentences
    if (paragraphs.length === 0) {
      const fullText = contentElement.text().trim();
      const sentences = fullText.split(/(?<=[.!?])\s+/);
      let currentParagraph = "";

      sentences.forEach((sentence) => {
        currentParagraph += sentence + " ";
        // Create paragraph every ~3 sentences or 300 chars
        if (currentParagraph.length > 300 || sentence.endsWith(".")) {
          const cleaned = currentParagraph.trim();
          if (cleaned.length > 50) {
            paragraphs.push(cleaned);
          }
          currentParagraph = "";
        }
      });

      if (currentParagraph.trim().length > 50) {
        paragraphs.push(currentParagraph.trim());
      }
    }

    // Limit to first 15 paragraphs
    const limitedParagraphs = paragraphs.slice(0, 15);

    console.log(`✅ Scraped ${limitedParagraphs.length} paragraphs from article`);

    return {
      text: limitedParagraphs.join("\n\n"),
      paragraphs: limitedParagraphs,
      image: mainImage,
    };
  } catch (error) {
    console.error(`❌ Error scraping article from ${url}:`, error.message);
    return { text: "", paragraphs: [], image: null };
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
      fullContent: content.text,
      paragraphs: content.paragraphs,
      scrapedImage: content.image,
    });

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return scrapedArticles;
};
