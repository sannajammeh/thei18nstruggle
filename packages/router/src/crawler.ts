/**
 * Crawler detection. The blueprint's first routing rule is "never redirect
 * search engine crawlers", so this errs on the side of treating unknown
 * automation as a crawler: a human falsely served the root loses nothing,
 * while a crawler falsely redirected costs indexation.
 */

/** Well-known crawler user-agent tokens. */
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

/** Generic automation markers that catch crawlers not in the curated list. */
const GENERIC_CRAWLER_PATTERN =
  /(?:bot|crawler|spider|slurp|archiver|headless)/i;

const KNOWN_CRAWLER_PATTERN = new RegExp(KNOWN_CRAWLERS.join("|"), "i");

/** Whether a user-agent belongs to a crawler/bot. Undefined/null agents are treated as crawlers. */
export function isCrawler(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return (
    KNOWN_CRAWLER_PATTERN.test(userAgent) ||
    GENERIC_CRAWLER_PATTERN.test(userAgent)
  );
}
