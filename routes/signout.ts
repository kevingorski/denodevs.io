import type { Handlers } from "$fresh/server.ts";
import { UserType } from "@/types/UserType.ts";
import type { State } from "./_middleware.ts";
import { deleteEmployerSession, deleteUserSession } from "@/utils/db.ts";
import { signOut } from "kv_oauth";
import { redirect } from "@/utils/redirect.ts";
import { EMPLOYER_SESSION_COOKIE_NAME } from "@/utils/constants.ts";
import { deleteCookie } from "std/http/cookie.ts";

async function handleEmployerSignout(employerSessionId?: string) {
  const response = redirect("/");

  if (employerSessionId) {
    await deleteEmployerSession(employerSessionId);
  }

  deleteCookie(response.headers, EMPLOYER_SESSION_COOKIE_NAME, { path: "/" });

  return response;
}

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(req, ctx) {
    const requestUrl = new URL(req.url);
    const userType = requestUrl.searchParams.get("type");

    switch (userType) {
      case UserType.Developer:
        if (ctx.state.sessionId) {
          await deleteUserSession(ctx.state.sessionId);
        }
        return await signOut(req);

      case UserType.Employer:
        return await handleEmployerSignout(ctx.state.employerSessionId);

      default:
        console.error(`Unknown user type on sign out: ${userType}`);
        return await signOut(req);
    }
  },
};
