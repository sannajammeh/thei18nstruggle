import { type NextRequest, NextResponse } from "next/server";
import { resolveCookies } from "../cookies.ts";
import { type Geolocate, geolocate } from "../geolocate.ts";
import { type Negotiate, negotiate } from "../negotiate.ts";
import { getOutcome, type ResolveOutcome } from "../outcome.ts";
import type { Outcome, Routing } from "../types.ts";

export type ProxyFunction = (request: NextRequest) => Promise<NextResponse>;

export interface RouterStages {
  geolocate?: Geolocate;
  negotiate?: Negotiate;
  getOutcome?: ResolveOutcome;
}

export async function createRouter(
  config: Routing,
  stages: RouterStages = {},
): Promise<ProxyFunction> {
  const geolocateStage = stages.geolocate ?? geolocate;
  const negotiateStage = stages.negotiate ?? negotiate;
  const outcomeStage = stages.getOutcome ?? getOutcome;

  return async function proxy(request: NextRequest): Promise<NextResponse> {
    const geo = await geolocateStage(request, config);
    const locale = await negotiateStage(request, config);
    const outcome = await outcomeStage(request, { geo, locale }, config);
    return getResponse(outcome, config);
  };
}

export async function getResponse(
  outcome: Outcome,
  config: Routing,
): Promise<NextResponse> {
  const cookies = resolveCookies(config);

  let response: NextResponse;
  switch (outcome.type) {
    case "redirect":
      response = NextResponse.redirect(
        new URL(outcome.url),
        outcome.status ?? cookies.redirectStatus,
      );
      break;
    case "rewrite":
      response = NextResponse.rewrite(new URL(outcome.url));
      break;
    default:
      response = NextResponse.next();
  }

  if (outcome.setCookie) {
    response.cookies.set({
      name: cookies.locale,
      value: outcome.locale,
      path: "/",
      maxAge: cookies.localeMaxAge,
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return response;
}
