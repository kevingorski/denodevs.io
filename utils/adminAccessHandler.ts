import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { basicAuth } from "basic_auth";
import {
  createAdminSession,
  deleteAdminSession,
  getAdminSession,
} from "@/utils/db.ts";
import {
  ADMIN_SESSION_COOKIE_LIFETIME_MS,
  ADMIN_SESSION_COOKIE_NAME,
} from "@/utils/constants.ts";
import { setCookie } from "std/http/cookie.ts";
import { USE_SECURE_COOKIES } from "@/utils/config.ts";

export interface AdminState extends State {
  adminSessionId: string;
}

export async function adminAccessHandler(
  req: Request,
  ctx: MiddlewareHandlerContext<AdminState>,
) {
  const { adminSessionId } = ctx.state;

  if (adminSessionId) {
    const session = await getAdminSession(adminSessionId);
    if (session) {
      if (Date.now() < session.generated + ADMIN_SESSION_COOKIE_LIFETIME_MS) {
        return await ctx.next();
      }
      // Clear expired session
      await deleteAdminSession(adminSessionId);
    }
  }

  const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
  const ADMIN_USERNAME = Deno.env.get("ADMIN_USERNAME");

  if (!ADMIN_PASSWORD || !ADMIN_USERNAME) {
    return new Response(null, { status: 500 });
  }

  const unauthorized = basicAuth(req, "Admin access", {
    [ADMIN_USERNAME]: ADMIN_PASSWORD,
  });
  if (unauthorized) {
    return unauthorized;
  }

  const session = await createAdminSession();
  ctx.state.adminSessionId = session.uuid;
  const response = await ctx.next();
  setCookie(
    response.headers,
    {
      path: "/",
      httpOnly: true,
      secure: USE_SECURE_COOKIES,
      maxAge: ADMIN_SESSION_COOKIE_LIFETIME_MS,
      sameSite: "Strict",
      name: ADMIN_SESSION_COOKIE_NAME,
      value: session.uuid,
    },
  );
  return response;
}
