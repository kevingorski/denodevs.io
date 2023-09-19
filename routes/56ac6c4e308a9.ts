/* Reverse proxy for Clicky Beacon to enable analytics */
import { HandlerContext, Handlers } from "$fresh/server.ts";

async function proxyClickyRequest(req: Request, ctx: HandlerContext) {
  const { host, protocol } = new URL(req.url);
  const proxiedUrl = new URL(
    "https://static.getclicky.com/js?in=%2F335afc1fe2e63",
  );

  const headers = new Headers();
  headers.set("host", proxiedUrl.hostname);
  headers.set("x-forwarded-for", ctx.remoteAddr.hostname);
  headers.set("x-forwarded-host", host);
  headers.set("x-forwarded-proto", protocol);
  const response = await fetch(proxiedUrl, {
    headers,
    method: req.method,
  });
  return response;
}

export const handler: Handlers = {
  GET: proxyClickyRequest,
  POST: proxyClickyRequest,
};
