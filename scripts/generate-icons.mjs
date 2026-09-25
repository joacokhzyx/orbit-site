// Renders the raster icons the browser and social cards ask for from the
// same SVG the favicon uses, so a change to the mark shows up everywhere
// at once. Run with: node scripts/generate-icons.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync, statSync } from "node:fs";

const favicon = readFileSync("public/favicon.svg");

const targets = [
  { file: "public/apple-touch-icon.png", size: 180 },
  { file: "public/icon-192.png", size: 192 },
  { file: "public/icon-512.png", size: 512 },
];

for (const { file, size } of targets) {
  await sharp(favicon, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(`${file}  ${size}x${size}  ${(statSync(file).size / 1024).toFixed(1)} KB`);
}

// The social card. Text is drawn as an SVG so it stays crisp at any scale
// and the file stays in the repo as readable source.
const og = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f7f6f2"/>
  <rect x="0" y="0" width="8" height="630" fill="#322c87"/>
  <g transform="translate(96 300) scale(1.7)" fill="#111110">
    <path d="${readFileSync("public/logo.svg", "utf8").match(/d="([^"]+)"/)[1]}"/>
  </g>
  <text x="230" y="300" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="34" fill="#111110" letter-spacing="-0.5">Orbit</text>
  <text x="230" y="360" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="76" font-weight="600" fill="#111110" letter-spacing="-2.5">Do more with less.</text>
  <text x="230" y="428" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="27" fill="#56534c">A statically typed language for APIs and microservices,</text>
  <text x="230" y="466" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="27" fill="#56534c">with a compiler written in itself.</text>
  <text x="96" y="556" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="22" fill="#86827a">orbit-lang.dev</text>
</svg>`;

writeFileSync("scripts/og-card.svg", og, "utf8");

await sharp(Buffer.from(og), { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9, quality: 90 })
  .toFile("public/og.png");

console.log(`public/og.png  1200x630  ${(statSync("public/og.png").size / 1024).toFixed(1)} KB`);
