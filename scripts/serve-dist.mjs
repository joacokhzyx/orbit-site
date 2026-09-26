// Serves the built site for the browser tests.
//
// `astro preview` was the obvious choice and it daemonises, which leaves a
// process holding the port between runs and makes the test server fail to
// start for no visible reason. This is a plain static server instead: it
// exits with the test run, and it redirects a slashless page address to the
// canonical one, so the tests exercise the same address a visitor gets.

import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const DIST = "dist";
const PORT = Number(process.env.PORT ?? 4321);
const HOST = process.env.HOST ?? "127.0.0.1";

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
};

function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const base = join(DIST, clean);
  for (const candidate of [base, `${base}.html`, join(base, "index.html")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const { pathname } = url;
  const file = resolveFile(pathname);

  if (!file) {
    // The 404 body is a built page like any other, so it is looked for rather
    // than assumed. Streaming a file that is not there would end the response
    // with neither a body nor an end, and every browser test would fail as a
    // navigation timeout with nothing pointing at the missing build.
    const notFound = join(DIST, "404.html");
    if (!existsSync(notFound)) {
      response.writeHead(404, {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(`404 ${pathname}\n`);
      return;
    }
    response.writeHead(404, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    });
    createReadStream(notFound).pipe(response);
    return;
  }

  // One address per page. "/docs", "/docs/" and "/docs/index.html" are
  // three URLs for one document, and the sitemap publishes only the second
  // form. Redirect the other two rather than serve them, or a crawler
  // indexes the same text three times.
  const isDirectoryIndex = pathname.endsWith("/index.html");
  const looksLikePage = !extname(pathname) || isDirectoryIndex;
  if (looksLikePage && !pathname.endsWith("/")) {
    const canonical = isDirectoryIndex
      ? pathname.slice(0, -"index.html".length)
      : `${pathname}/`;
    response.writeHead(301, { location: `${canonical}${url.search}` });
    response.end();
    return;
  }

  response.writeHead(200, {
    "content-type": CONTENT_TYPES[extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(response);
});

server.listen(PORT, HOST, () => {
  console.log(`serving ${DIST} at http://${HOST}:${PORT}`);
});
