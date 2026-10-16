import { createRouter } from "@concept/router/next";
import { routing } from "./i18n/config";

/**
 * Blueprint request handling (crawler bypass, geo routing, locale cookie,
 * Accept-Language negotiation) is owned by `@concept/router`.
 */
export const proxy = await createRouter(routing);

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml).*)",
};
