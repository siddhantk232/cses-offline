import { load } from "cheerio";
import { writeFileSync, mkdirSync, createWriteStream } from "fs";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import https from "https";

const htmlText = await fetch("https://cses.fi/problemset/list/").then((r) =>
  r.text()
);

const $ = load(htmlText);

const links = $("[href]");

writeFileSync("index.html", htmlText);

function download(uri, filename, callback) {
  https.get(uri, (res) => {
    res.pipe(createWriteStream(filename));
    res.on("close", callback);
  });
}

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

      const $problem = load(pageText);

      $problem("img")
        .toArray()
        .filter((node) => node.attribs["src"].includes("file"))
        .forEach(async (img) => {
          download(
            `https://cses.fi${img.attribs["src"]}`,
            "." + img.attribs["src"],
            function () {
              console.log(`downloaded image: ${img.attribs["src"]}`);
            }
          );
        });
    } catch (e) {
      console.log(`failed ${problemLink}`);
      console.error(e);
    }
  });

const css = await fetch("https://cses.fi/cses.css?4").then((r) => r.text());
const cssDark = await fetch("https://cses.fi/cses-dark.css?4").then((r) =>
  r.text()
);

writeFile("./cses.css", css);
writeFile("./cses-dark.css", cssDark);
