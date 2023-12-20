/* Reverse proxy for Clicky tracking code to enable analytics */
import { FreshContext, Handlers } from "$fresh/server.ts";
import proxyRequest from "@/utils/proxyRequest.ts";

const proxiedUrl = new URL(
  "https://static.getclicky.com/js?in=%2F335afc1fe2e63",
);

function proxyClickyRequest(req: Request, ctx: FreshContext) {
  return proxyRequest(proxiedUrl, req, ctx);
}

export const handler: Handlers = {
  GET: proxyClickyRequest,
  POST: proxyClickyRequest,
};
