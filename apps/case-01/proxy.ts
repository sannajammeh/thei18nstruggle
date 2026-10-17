import { createRouter } from "@concept/router/next";
import { routing } from "./i18n/config";

export const proxy = await createRouter(routing, {
  geolocate: (req) => {
    return {
      region: req.headers.get("x-vercel-ip-country") || "NO",
    };
  },
});

// The matcher must be an inline constant — Next.js statically analyzes it at
// build time; imported values are ignored.
export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml).*)",
};
