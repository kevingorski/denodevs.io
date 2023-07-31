// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { SITE_NAME } from "@/utils/constants.ts";
import { GitHub } from "./Icons.tsx";

export default function Footer(
  props: { sessionId?: string },
) {
  return (
    <footer class="SiteBar">
      <p>© {SITE_NAME}</p>
      <nav class="SiteNav">
        {props.sessionId
          ? <a href="/account">Account</a>
          : <a href="/start">Sign in</a>}
        <a href="/about">About</a>
        <a href="/blog">Blog</a>
        <a
          href="https://github.com/denoland/saaskit"
          target="_blank"
          aria-label="Deno SaaSKit repo on GitHub"
        >
          <GitHub />
        </a>
      </nav>
    </footer>
  );
}
