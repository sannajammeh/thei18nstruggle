const KNOWN_CRAWLERS = [
  "googlebot",
  "google-inspectiontool",
  "adsbot-google",
  "mediapartners-google",
  "bingbot",
  "yandex",
  "baiduspider",
  "sogou",
  "duckduckbot",
  "slurp",
  "facebookexternalhit",
  "facebookcatalog",
  "facebot",
  "linkedinbot",
  "twitterbot",
  "applebot",
  "petalbot",
  "semrushbot",
  "ahrefsbot",
  "dotbot",
  "mj12bot",
  "gptbot",
  "oai-searchbot",
  "chatgpt-user",
  "claudebot",
  "claude-web",
  "perplexitybot",
  "perplexity-crawler",
  "amazonbot",
  "bytespider",
  "ccbot",
  "diffbot",
  "ia_archiver",
  "archive.org_bot",
  "uptimerobot",
  "pingdom",
];

const GENERIC_CRAWLER_PATTERN =
  /(?:bot|crawler|spider|slurp|archiver|headless)/i;

const KNOWN_CRAWLER_PATTERN = new RegExp(KNOWN_CRAWLERS.join("|"), "i");

export function isCrawler(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return (
    KNOWN_CRAWLER_PATTERN.test(userAgent) ||
    GENERIC_CRAWLER_PATTERN.test(userAgent)
  );
}
