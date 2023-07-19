// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import { calcLastPage, calcPageNum, PAGE_LENGTH } from "@/utils/pagination.ts";
import type { State } from "./_middleware.ts";
import {
  compareScore,
  getAllItems,
  getAreVotedBySessionId,
  getItemsSince,
  getManyUsers,
  type Item,
  type User,
} from "@/utils/db.ts";
import { DAY, WEEK } from "std/datetime/constants.ts";

interface HomePageData extends State {
  itemsUsers: User[];
  items: Item[];
  lastPage: number;
  areVoted: boolean[];
}

function calcTimeAgoFilter(url: URL) {
  return url.searchParams.get("time-ago");
}

export const handler: Handlers<HomePageData, State> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const pageNum = calcPageNum(url);
    const timeAgo = calcTimeAgoFilter(url);
    let allItems: Item[];
    if (timeAgo === "week" || timeAgo === null) {
      allItems = await getItemsSince(WEEK);
    } else if (timeAgo === "month") {
      allItems = await getItemsSince(30 * DAY);
    } else {
      allItems = await getAllItems();
    }

    const items = allItems
      .toSorted(compareScore)
      .slice((pageNum - 1) * PAGE_LENGTH, pageNum * PAGE_LENGTH);

    const itemsUsers = await getManyUsers(items.map((item) => item.userId));

    const areVoted = await getAreVotedBySessionId(
      items,
      ctx.state.sessionId,
    );
    const lastPage = calcLastPage(allItems.length, PAGE_LENGTH);

    return ctx.render({ ...ctx.state, items, itemsUsers, areVoted, lastPage });
  },
};

export default function HomePage(props: PageProps<HomePageData>) {
  return (
    <main class="flex-1 p-4">
      <h1 class="text-2xl">Welcome to the Deno Devs reverse job board beta!</h1>
      <h2 class="text-xl">What is Deno?</h2>
      <p>
        Deno is a modern JavaScript runtime built on Chrome's V8 JavaScript
        engine.
      </p>
      <h2 class="text-xl">What is a reverse job board?</h2>
      <p>
        Instead of employers posting job openings, developers fill out their
        profiles and employers apply to them.
      </p>
      <h2 class="text-xl">What is a beta?</h2>
      <p>
        While in beta, the product is still in active development and may be
        missing key features.
      </p>
      <p>
        Your feedback will help set the direction for the product as those
        features are built.
      </p>
      <h2 class="text-xl">What can I expect if I sign up as a developer?</h2>
      <p>A great experience</p>
      <h2 class="text-xl">What can I expect if I sign up as an employer?</h2>
      <p>A great experience</p>
    </main>
  );
}
