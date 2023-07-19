// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { AppProps } from "$fresh/server.ts";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import { Head } from "$fresh/runtime.ts";
import Meta from "@/components/Meta.tsx";
import { SITE_DESCRIPTION, SITE_NAME } from "../utils/constants.ts";

export default function App(props: AppProps) {
  return (
    <>
      <Head>
        <Meta
          title={props.data?.title
            ? `${props.data.title} 🦕💼 ${SITE_NAME}`
            : SITE_NAME}
          description={props.data?.description ?? SITE_DESCRIPTION}
          href={props.url.href}
        />
        <link href="/styles.css" rel="stylesheet" />
      </Head>
      <Header
        sessionId={props.data?.sessionId}
        hasNotifications={props.data?.hasNotifications}
      />
      <props.Component />
      <Footer />
    </>
  );
}
