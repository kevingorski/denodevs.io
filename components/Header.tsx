// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { SITE_NAME } from "@/utils/constants.ts";
import { stripe } from "@/utils/payments.ts";
import { Bell, CircleFilled } from "./Icons.tsx";

export default function Header(
  props: { sessionId?: string; hasNotifications: boolean },
) {
  return (
    <header class="SiteBar">
      <h1>
        <a href="/">{SITE_NAME}</a>
      </h1>
      <nav class="SiteNav">
        {stripe ? <a href="/pricing">Pricing</a> : null}
        {props.sessionId
          ? <a href="/account">Account</a>
          : <a href="/signin">Sign in</a>}
        <a
          href="/account/notifications"
          aria-label="Notifications"
        >
          <Bell />
          {props.hasNotifications && <CircleFilled class="NotificationIcon" />}
        </a>
        <a href="/submit">Submit</a>
      </nav>
    </header>
  );
}
