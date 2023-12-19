#!/usr/bin/env -S deno run -A --watch=routes/,utils/,styles/

import dev from "$fresh/dev.ts";
import "std/dotenv/load.ts";
import { browserslistToTargets, bundle } from "lightningcss";
import browserslist from "browserslist";

const targets = browserslistToTargets(
  browserslist("last 2 versions, not dead, > 0.2%"),
);
const { code, map } = bundle({
  filename: "./styles/index.css",
  minify: true,
  sourceMap: true,
  targets,
});

if (!map) throw new Error("No source map");

const generatedCss = new TextDecoder().decode(code);
const generatedCssSourceMap = new TextDecoder().decode(map);

await Promise.all([
  Deno.writeTextFile("./static/styles.gen.css", generatedCss),
  Deno.writeTextFile("./static/styles.gen.css.map", generatedCssSourceMap),
]);
await dev(import.meta.url, "./main.ts");
