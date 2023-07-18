// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getSessionId } from "kv_oauth";
import { getUserBySession, ifUserHasNotifications } from "@/utils/db.ts";
import type { MetaProps } from "@/components/Meta.tsx";

export interface State extends MetaProps {
  sessionId?: string;
  hasNotifications?: boolean;
}

async function setState(req: Request, ctx: MiddlewareHandlerContext<State>) {
  if (ctx.destination !== "route") return await ctx.next();

  const sessionId = await getSessionId(req);
  ctx.state.sessionId = sessionId;

  if (sessionId) {
    const user = await getUserBySession(sessionId);
    ctx.state.hasNotifications = await ifUserHasNotifications(user!.id);
  }

  return await ctx.next();
}

export const handler = [
  setState,
];
