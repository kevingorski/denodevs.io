import { FreshContext } from "$fresh/server.ts";
import { getSessionId } from "kv_oauth";
import type { MetaProps } from "@/components/Meta.tsx";
import { EMPLOYER_SESSION_COOKIE_NAME } from "@/utils/constants.ts";
import { getCookies } from "std/http/cookie.ts";

export interface State extends MetaProps {
  employerSessionId?: string;
  sessionId?: string;
}

async function setState(req: Request, ctx: FreshContext<State>) {
  if (ctx.destination !== "route") return await ctx.next();

  const sessionId = await getSessionId(req);
  ctx.state.sessionId = sessionId;

  const employerSessionId =
    getCookies(req.headers)[EMPLOYER_SESSION_COOKIE_NAME];

  if (employerSessionId) {
    ctx.state.employerSessionId = employerSessionId;
  }

  return await ctx.next();
}

export const handler = [
  setState,
];
