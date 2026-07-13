import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Claude workshop experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="ko">/i);
  assert.match(html, /<title>AI와 일하는 사람으로 — Claude Workshop<\/title>/i);
  assert.match(html, /AI와 일하는 사람으로/);
  assert.match(html, /SKILL/);
  assert.match(html, /PLUGIN/);
  assert.match(html, /AGENT/);
  assert.match(html, /서제호/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps the finished experience assets and accessibility hooks", async () => {
  const [page, layout, experience, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/workshop-experience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /ClaudeWorkshopExperience/);
  assert.match(layout, /lang="ko"/);
  assert.match(experience, /prefers-reduced-motion/);
  assert.match(experience, /src="\/assets\/higgsfield-ai-core\.mp4"/);
  assert.match(experience, /preload="metadata"/);
  assert.match(experience, /disablePictureInPicture/);
  assert.match(experience, /aria-live="polite"/);
  assert.match(experience, /검은색 터틀넥을 입은 서제호 강사/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(packageJson, /"three":/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/assets/seo-jaeho-profile.jpg", import.meta.url)),
    access(new URL("../public/assets/seo-jaeho-night.jpeg", import.meta.url)),
  ]);
  const heroFilm = await stat(new URL("../public/assets/higgsfield-ai-core.mp4", import.meta.url));
  assert.ok(heroFilm.size > 0, "Higgsfield hero film should be present and non-empty");
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});
