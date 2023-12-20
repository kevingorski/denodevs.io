import { State } from "@/routes/_middleware.ts";
import { FreshContext } from "$fresh/server.ts";
import { basicAuth } from "basic_auth";

export interface AdminState extends State {
  adminSessionId: string;
}

export async function adminAccessHandler(
  req: Request,
  ctx: FreshContext<AdminState>,
) {
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

  return await ctx.next();
}
