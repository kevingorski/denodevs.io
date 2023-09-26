import { defineRoute, RouteContext } from "$fresh/server.ts";
import { stripe } from "@/utils/payments.ts";
import type { AccountState } from "./_middleware.ts";
import { redirect } from "@/utils/redirect.ts";

export default defineRoute(
  async (req, ctx: RouteContext<void, AccountState>) => {
    if (
      stripe === undefined || ctx.state.developer.stripeCustomerId === undefined
    ) {
      return ctx.renderNotFound();
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer: ctx.state.developer.stripeCustomerId,
      return_url: new URL(req.url).origin + "/account",
    });

    return redirect(url);
  },
);
