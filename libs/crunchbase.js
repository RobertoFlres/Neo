import Parser from "rss-parser";

const parser = new Parser();

export const getCrunchbaseNewsArticles = async (limit = 20) => {
  try {
    const feed = await parser.parseURL("https://news.crunchbase.com/feed/");

    return feed.items.slice(0, limit).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.summary || item.description || "",
      url: item.link,
      source: "Crunchbase News",
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      image:
        item.enclosure?.url ||
        item["media:content"]?.url ||
        item["media:thumbnail"]?.url ||
        null,
    }));
  } catch (error) {
    console.error("❌ Error fetching Crunchbase News articles:", error.message);
    return [];
  }
};
