/**
 * Centralized category keywords for news filtering
 * Used by all scrapers to ensure consistent categorization
 */

// Keywords for each category - more comprehensive list
export const CATEGORY_KEYWORDS = {
  technology: {
    // English keywords
    en: [
      "ai", "artificial intelligence", "machine learning", "deep learning", "neural network",
      "chatgpt", "openai", "claude", "llm", "gpt",
      "software", "programming", "developer", "code", "coding", "github", "open source",
      "python", "javascript", "typescript", "react", "node", "rust", "golang",
      "api", "sdk", "framework", "library",
      "cloud", "aws", "azure", "google cloud", "saas", "paas", "iaas",
      "cybersecurity", "security", "hacking", "encryption", "privacy",
      "blockchain", "crypto", "web3", "nft", "defi",
      "iot", "internet of things", "smart home", "wearable",
      "5g", "6g", "wireless", "network",
      "robotics", "automation", "drone",
      "vr", "ar", "virtual reality", "augmented reality", "metaverse",
      "quantum", "computing",
      "data science", "big data", "analytics",
      "tech", "technology", "digital", "innovation",
      "apple", "google", "microsoft", "amazon", "meta", "nvidia", "tesla",
      "iphone", "android", "ios", "app", "mobile",
      "chip", "semiconductor", "processor", "gpu", "cpu",
    ],
    // Spanish keywords
    es: [
      "inteligencia artificial", "aprendizaje automático", "aprendizaje profundo",
      "software", "programación", "desarrollador", "código", "tecnología",
      "nube", "ciberseguridad", "seguridad informática",
      "cadena de bloques", "criptomoneda",
      "robótica", "automatización", "dron",
      "realidad virtual", "realidad aumentada",
      "ciencia de datos", "análisis de datos",
      "innovación", "digital", "transformación digital",
      "aplicación", "móvil", "celular",
      "procesador", "chip", "semiconductor",
    ],
  },

  business: {
    en: [
      "business", "company", "corporate", "enterprise", "organization",
      "ceo", "cfo", "cto", "executive", "leadership", "management",
      "revenue", "profit", "earnings", "sales", "growth",
      "market", "stock", "shares", "ipo", "valuation",
      "merger", "acquisition", "m&a", "deal", "partnership",
      "strategy", "consulting", "advisory",
      "finance", "financial", "banking", "investment", "investor",
      "economy", "economic", "gdp", "inflation", "recession",
      "retail", "ecommerce", "commerce", "consumer",
      "marketing", "advertising", "brand", "branding",
      "hr", "human resources", "hiring", "layoff", "workforce",
      "supply chain", "logistics", "manufacturing",
      "real estate", "property", "commercial",
      "insurance", "fintech", "payments",
      "entrepreneurship", "entrepreneur", "founder",
    ],
    es: [
      "negocio", "empresa", "corporativo", "organización", "compañía",
      "director", "ejecutivo", "liderazgo", "gestión", "gerencia",
      "ingresos", "ganancias", "ventas", "crecimiento", "utilidades",
      "mercado", "bolsa", "acciones", "valuación",
      "fusión", "adquisición", "alianza", "asociación",
      "estrategia", "consultoría", "asesoría",
      "finanzas", "financiero", "banca", "inversión", "inversionista",
      "economía", "económico", "inflación", "recesión",
      "comercio", "minorista", "consumidor",
      "mercadotecnia", "publicidad", "marca",
      "recursos humanos", "contratación", "despido",
      "cadena de suministro", "logística", "manufactura",
      "bienes raíces", "inmobiliario",
      "seguros", "pagos",
      "emprendimiento", "emprendedor", "fundador",
    ],
  },

  startups: {
    en: [
      "startup", "start-up", "start up", "startups",
      "founder", "co-founder", "founding", "founded",
      "entrepreneur", "entrepreneurship", "entrepreneurial",
      "venture", "venture capital", "vc", "investor", "angel investor",
      "funding", "fundraising", "raise", "raised", "round",
      "seed", "pre-seed", "series a", "series b", "series c", "series d",
      "unicorn", "decacorn", "valuation",
      "accelerator", "incubator", "y combinator", "yc", "techstars",
      "pitch", "pitching", "pitch deck", "demo day",
      "bootstrap", "bootstrapped", "bootstrapping",
      "mvp", "minimum viable product", "product market fit", "pmf",
      "scale", "scaling", "growth hacking", "hypergrowth",
      "pivot", "pivoting",
      "exit", "acquisition", "acqui-hire", "ipo",
      "disruption", "disruptive", "innovate", "innovation",
      "early stage", "late stage", "pre-revenue",
      "burn rate", "runway", "cap table",
      "equity", "stock options", "vesting",
      "fintech", "healthtech", "edtech", "proptech", "agritech", "cleantech",
      "saas", "b2b", "b2c", "d2c", "marketplace",
    ],
    es: [
      "startup", "startups", "emprendimiento", "emprendimientos",
      "fundador", "cofundador", "emprendedor", "emprendedora",
      "capital de riesgo", "inversionista", "inversor", "ángel inversionista",
      "financiamiento", "financiación", "levantamiento de capital", "ronda",
      "semilla", "pre-semilla", "serie a", "serie b",
      "unicornio", "valuación", "valoración",
      "aceleradora", "incubadora",
      "pitch", "presentación",
      "escalamiento", "escalar", "crecimiento",
      "pivote", "pivotar",
      "salida", "adquisición",
      "disrupción", "disruptivo", "innovación", "innovar",
      "etapa temprana", "pre-ingresos",
      "tasa de quema", "runway",
      "participación", "opciones",
    ],
  },
};

/**
 * Check if text matches a category
 * @param {string} text - Text to check (title, description, etc.)
 * @param {string} category - Category to match (technology, business, startups)
 * @param {number} minMatches - Minimum keyword matches required (default: 1)
 * @returns {boolean} Whether the text matches the category
 */
export const matchesCategory = (text, category, minMatches = 1) => {
  if (!text || !category) return false;

  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords) return false;

  const textLower = text.toLowerCase();
  let matchCount = 0;

  // Check English keywords
  for (const keyword of keywords.en) {
    if (textLower.includes(keyword.toLowerCase())) {
      matchCount++;
      if (matchCount >= minMatches) return true;
    }
  }

  // Check Spanish keywords
  for (const keyword of keywords.es) {
    if (textLower.includes(keyword.toLowerCase())) {
      matchCount++;
      if (matchCount >= minMatches) return true;
    }
  }

  return false;
};

/**
 * Filter articles by category
 * @param {Array} articles - Array of articles with title and description
 * @param {string} category - Category to filter
 * @param {boolean} strict - If true, returns empty array when no matches (default: true)
 * @returns {Array} Filtered articles
 */
export const filterByCategory = (articles, category, strict = true) => {
  if (!articles || !Array.isArray(articles)) return [];
  if (!category || category === "general") return articles;

  const filtered = articles.filter((article) => {
    const textToCheck = `${article.title || ""} ${article.description || ""}`;
    return matchesCategory(textToCheck, category);
  });

  // If strict mode and no matches, return empty array
  // This prevents returning unrelated content
  if (strict && filtered.length === 0) {
    console.log(`⚠️ No articles matched category "${category}" - returning empty (strict mode)`);
    return [];
  }

  return filtered;
};

/**
 * Get search query string for APIs that support keyword search
 * @param {string} category - Category
 * @param {string} language - Language preference (en, es, or both)
 * @returns {string} Search query string
 */
export const getCategorySearchQuery = (category, language = "both") => {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords) return "";

  let selectedKeywords = [];

  if (language === "en" || language === "both") {
    // Select top keywords for search (not all, to avoid too long queries)
    selectedKeywords.push(...keywords.en.slice(0, 10));
  }

  if (language === "es" || language === "both") {
    selectedKeywords.push(...keywords.es.slice(0, 10));
  }

  return selectedKeywords.join(" OR ");
};

export default CATEGORY_KEYWORDS;
