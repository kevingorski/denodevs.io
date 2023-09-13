/* Reverse proxy for Clicky Beacon to enable analytics */
import { HandlerContext, Handlers } from "$fresh/server.ts";

async function proxyClickyRequest(req: Request, ctx: HandlerContext) {
  const { host, protocol, search } = new URL(req.url);
  const proxiedUrl = new URL("https://in.getclicky.com/in.php");
  proxiedUrl.search = search;

  const headers = new Headers();
  headers.set("Host", proxiedUrl.hostname);
  headers.set("X-Forwarded-Host", host);
  headers.set("X-Forwarded-Proto", protocol);
  headers.set("X-Forwarded-For", ctx.remoteAddr.hostname);

  return await fetch(proxiedUrl, {
    headers,
    method: req.method,
  });
}

export const handler: Handlers = {
  GET: proxyClickyRequest,
  POST: proxyClickyRequest,
};
