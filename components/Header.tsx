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
      <div class="SiteIdentification">
        <a href="/">
          <Logo height="48" />
        </a>
        <div>
          <h1>
            <a href="/">{SITE_NAME}</a>
          </h1>
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
          <Bell />
          {props.hasNotifications && <CircleFilled class="NotificationIcon" />}
        </a>
        <a href="/submit">Submit</a>
      </nav>
    </header>
  );
}
