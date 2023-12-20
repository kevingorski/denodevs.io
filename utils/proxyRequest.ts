import { FreshContext } from "$fresh/server.ts";

const excludedIncomingHeaders = [
  "accept-encoding",
  "host",
  "keep-alive",
  "x-forwarded-for",
];

export default async function proxyRequest(
  proxiedUrl: URL,
  req: Request,
  ctx: FreshContext,
) {
  const { headers: originalHeaders, method: originalMethod, url: originalUrl } =
    req;
  const { host: originalHost, protocol: originalProtocol } = new URL(
    originalUrl,
  );

  // Maintain existing XFF if any, add remote IP
  const originalForwardedFor = originalHeaders.get("x-forwarded-for");
  const newForwardedFor = `${
    originalForwardedFor !== null ? originalForwardedFor + "," : ""
  }${ctx.remoteAddr.hostname}`;

  const headers = new Headers();
  headers.set("host", proxiedUrl.hostname);
  headers.set(
    "x-forwarded-for",
    newForwardedFor,
  );
  headers.set("x-forwarded-host", originalHost);
  headers.set("x-forwarded-proto", originalProtocol);

  for (const [key, value] of originalHeaders.entries()) {
    if (
      excludedIncomingHeaders.includes(key)
    ) {
      continue;
    }
    headers.set(key, value);
  }

  const requestInit: RequestInit = {
    body: req.body,
    headers,
    method: originalMethod,
  };
  return await fetch(proxiedUrl, requestInit);
}
