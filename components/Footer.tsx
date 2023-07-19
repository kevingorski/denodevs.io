// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { SITE_NAME } from "@/utils/constants.ts";
import { GitHub } from "./Icons.tsx";

export default function Footer() {
  return (
    <footer class="SiteBar">
      <p>© {SITE_NAME}</p>
      <nav class="SiteNav">
        <a href="/stats">Stats</a>
        <a href="/blog">Blog</a>
        <a
          href="https://github.com/denoland/saaskit"
          target="_blank"
          aria-label="Deno SaaSKit repo on GitHub"
        >
          <GitHub />
        </a>
        <a href="https://fresh.deno.dev">
          <img
            width="197"
            height="37"
            src="https://fresh.deno.dev/fresh-badge.svg"
            alt="Made with Fresh"
          />
        </a>
      </nav>
    </footer>
  );
}
