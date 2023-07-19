// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { SITE_DESCRIPTION, SITE_NAME } from "@/utils/constants.ts";
import Logo from "./Logo.tsx";
import { stripe } from "@/utils/payments.ts";
import { Bell, CircleFilled } from "./Icons.tsx";

export default function Header(
  props: { sessionId?: string; hasNotifications: boolean },
) {
  return (
    <header class="SiteBar">
      <div class="flex flex-row gap-4">
        <a href="/">
          <Logo height="48" />
        </a>
        <div>
          <h1 class="text-3xl">{SITE_NAME}</h1>
          <h2>{SITE_DESCRIPTION}</h2>
        </div>
      </div>
      <nav class="SiteNav">
        {stripe ? <a href="/pricing">Pricing</a> : null}
        {props.sessionId
          ? <a href="/account">Account</a>
          : <a href="/signin">Sign in</a>}
        <a
          href="/account/notifications"
          aria-label="Notifications"
        >
          <Bell class="w-6 h-6" />
          {props.hasNotifications && (
            <CircleFilled class="absolute top-0.5 right-0.5 text-pink-700 w-2 h-2" />
          )}
        </a>
        <a href="/submit">Submit</a>
      </nav>
    </header>
  );
}
