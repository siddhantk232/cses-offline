import { load } from "cheerio";
import { writeFileSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";

const htmlText = await fetch("https://cses.fi/problemset/list/").then((r) =>
  r.text()
);

const $ = load(htmlText);

const links = $("[href]");

writeFileSync("index.html", htmlText);

links
  .toArray()
  .filter(
    (node) =>
      node.attribs["href"].includes("problemset") &&
      !node.attribs["href"].includes("https")
  )
  .forEach(async (node) => {
    const url = node.attribs["href"];
    const problemLink = `https://cses.fi${url}`;
    try {
      const path = "." + url.split("/").slice(0, -1).join("/");
      mkdirSync(path, { recursive: true });

      const pageText = await fetch(problemLink, {}).then((r) => r.text());
      writeFileSync("./" + url, pageText);
    } catch (e) {
      console.log(`failed ${problemLink}`);
    }
  });

const css = await fetch("https://cses.fi/cses.css?4").then((r) => r.text());
const cssDark = await fetch("https://cses.fi/cses-dark.css?4").then((r) =>
  r.text()
);

writeFile("./cses.css", css);
writeFile("./cses-dark.css", cssDark);
