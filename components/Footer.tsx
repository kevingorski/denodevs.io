import { SITE_NAME } from "@/utils/constants.ts";
import { GitHub } from "./Icons.tsx";
import AuthenticationLinks from "@/components/AuthenticationLinks.tsx";

export default function Footer(
  props: {
    employerSessionId?: string;
    sessionId?: string;
  },
) {
  return (
    <footer class="SiteBar">
      <p>© {SITE_NAME}</p>
      <nav class="SiteNav">
        <AuthenticationLinks {...props} />
        <a href="/about">About</a>
        <a
          href="https://github.com/kevingorski/denodevs.io"
          target="_blank"
          aria-label="Deno Devs repo on GitHub"
        >
          <GitHub />
        </a>
      </nav>
    </footer>
  );
}
