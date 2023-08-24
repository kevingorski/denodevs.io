import type { Handlers } from "$fresh/server.ts";
import type { State } from "./_middleware.ts";
import { deleteUserSession } from "@/utils/db.ts";
import { signOut } from "kv_oauth";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(req, ctx) {
    if (ctx.state.sessionId) {
      await deleteUserSession(ctx.state.sessionId);
    }

    return await signOut(req);
  },
};
