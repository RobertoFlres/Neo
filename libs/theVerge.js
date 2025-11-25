import Parser from "rss-parser";

const parser = new Parser();

export const getTheVergeArticles = async (limit = 20) => {
  try {
    const feed = await parser.parseURL("https://www.theverge.com/rss/index.xml");

    return feed.items.slice(0, limit).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.summary || item.description || "",
      url: item.link,
      source: "The Verge",
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      image:
        item.enclosure?.url ||
        item["media:content"]?.url ||
        item["media:thumbnail"]?.url ||
        null,
    }));
  } catch (error) {
    console.error("❌ Error fetching The Verge articles:", error.message);
    return [];
  }
};
