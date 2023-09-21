/* Reverse proxy for Clicky beacon to enable analytics */
import { HandlerContext, Handlers } from "$fresh/server.ts";
import proxyRequest from "@/utils/proxyRequest.ts";

const proxiedUrl = "https://in.getclicky.com/in.php";

function proxyClickyRequest(req: Request, ctx: HandlerContext) {
  const requestedUrl = new URL(req.url);
  const withQueryString = new URL(proxiedUrl);
  withQueryString.search = requestedUrl.search;
  return proxyRequest(withQueryString, req, ctx);
}

export const handler: Handlers = {
  GET: proxyClickyRequest,
  POST: proxyClickyRequest,
};
