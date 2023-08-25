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
  USE_SECURE_COOKIES,
} from "@/utils/constants.ts";
import { setCookie } from "https://deno.land/std@0.192.0/http/cookie.ts";

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
    const deniedResponse = new Response(null, { status: 401 });
    if (!session) {
      console.error(`adminSessionId ${adminSessionId} not found`);
      return deniedResponse;
    }

    if (
      session.generated + ADMIN_SESSION_COOKIE_LIFETIME_MS < Date.now()
    ) {
      await deleteAdminSession(adminSessionId);
      return deniedResponse;
    }

    return await ctx.next();
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
