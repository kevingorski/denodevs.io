import { ContentSecurityPolicy } from "$fresh/src/runtime/csp.ts";

// TODO: refactor this to something reusable when it drops
// https://github.com/denoland/fresh/issues/1705
export default function denoDevsCsp(csp: ContentSecurityPolicy) {
  const { directives } = csp;
  directives.defaultSrc = [];
  directives.baseUri = ["'none'"];
  if (!directives.connectSrc) {
    directives.connectSrc = [];
  }
  directives.connectSrc.push("'self'");

  if (!directives.scriptSrc) {
    directives.scriptSrc = [];
  }
  directives.scriptSrc.push("'strict-dynamic'");
  directives.scriptSrc.push("'unsafe-inline'");
  directives.scriptSrc.push("http:");
  directives.scriptSrc.push("https:");

  if (!directives.styleSrc) {
    directives.styleSrc = [];
  }
  directives.styleSrc.push("'self'");

  if (!directives.imgSrc) {
    directives.imgSrc = [];
  }
  directives.imgSrc.push("'self'");
  directives.imgSrc.push("avatars.githubusercontent.com");
  directives.imgSrc.push("www.gravatar.com");
}
