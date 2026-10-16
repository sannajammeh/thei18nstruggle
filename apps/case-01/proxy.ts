import { createRouter } from "@concept/router/next";
import { routing } from "./i18n/config";

export const proxy = await createRouter(routing);

// The matcher must be an inline constant — Next.js statically analyzes it at
// build time; imported values are ignored.
export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml).*)",
};
