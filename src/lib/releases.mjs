// Resolves what a reader can actually download, from the release the
// repository really has.
//
// This exists because the obvious thing does not work. GitHub's
// `/releases/latest/download/<name>` only ever points at the newest
// non-prerelease, and it requires the asset name to be byte-identical. The
// repository publishes:
//
//   v0.1.0-rc.2  orbit-linux-x86_64          orbit-windows-x86_64.exe
//   v0.1.0-rc.1  orbit-linux-x86_64.tar.gz   orbit-macos-x86_64.tar.gz
//                 orbit-windows-setup.exe
//
// So "latest" resolves to rc.1, whose asset names differ from rc.2's, and
// every `/releases/latest/download/...` URL on the site 404s. There is no
// arm64 build in either release, no checksum is published, and the newest
// release has no macOS asset at all. Any template built from
// `${platform}-${arch}` would be wrong in three separate ways.
//
// So the release is read from the API and the assets are matched by what
// they are rather than by what they should have been called. The result is
// written to a committed snapshot so an offline build still works, and
// scripts/check-downloads.mjs fails when the newest release stops shipping
// something the site promises.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const API = "https://api.github.com/repos/joacokhzyx/orbit-lang/releases?per_page=20";
const SNAPSHOT = "src/data/releases.snapshot.json";

/**
 * The platforms the site offers, in the order they are shown. A platform
 * with no asset in the newest release is left out of the matrix entirely
 * rather than rendered as a button that 404s.
 */
const PLATFORMS = [
  { id: "linux", label: "Linux", arch: "x86_64", match: /linux/i },
  { id: "windows", label: "Windows", arch: "x86_64", match: /windows|win/i },
  { id: "macos", label: "macOS", arch: "x86_64", match: /macos|darwin|osx/i },
];

/**
 * The formats a reader might get. The first match wins, so the specific
 * patterns come before the general "no extension" one: a Linux binary is
 * called `orbit-linux-x86_64`, which has hyphens and no extension at all.
 */
const FORMATS = [
  { id: "setup", label: "Windows installer", match: /setup.*\.exe$/i },
  { id: "exe", label: "Windows executable", match: /\.exe$/i },
  { id: "tar.gz", label: "tarball", match: /\.tar\.gz$/i },
  { id: "zip", label: "zip", match: /\.zip$/i },
  { id: "binary", label: "single binary", match: /^[^.]+$/ },
];

function classify(assetName) {
  return FORMATS.find((candidate) => candidate.match.test(assetName))?.id ?? "file";
}

function formatLabel(assetName) {
  return FORMATS.find((candidate) => candidate.match.test(assetName))?.label ?? "download";
}

/** Human-readable size, from the byte count the API reports. */
export function formatSize(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function summarise(release) {
  const downloads = PLATFORMS.flatMap((platform) => {
    const asset = release.assets.find((candidate) => platform.match.test(candidate.name));
    if (!asset) return [];
    return [
      {
        id: platform.id,
        platform: platform.label,
        arch: platform.arch,
        fileName: asset.name,
        format: classify(asset.name),
        formatLabel: formatLabel(asset.name),
        sizeBytes: asset.size,
        sizeLabel: formatSize(asset.size),
        url: asset.browser_download_url,
      },
    ];
  });

  return {
    version: release.tag_name.replace(/^v/, ""),
    tag: release.tag_name,
    name: release.name || release.tag_name,
    publishedAt: release.published_at,
    date: release.published_at.slice(0, 10),
    prerelease: release.prerelease,
    htmlUrl: release.html_url,
    downloads,
  };
}

async function fetchFromApi() {
  const headers = { accept: "application/vnd.github+json", "user-agent": "orbit-site-build" };
  // Unauthenticated requests are capped at 60 an hour, which a few
  // consecutive local builds can reach. A token raises the ceiling and is
  // never required: the public endpoint answers without one.
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const response = await fetch(API, { headers });
  if (!response.ok) {
    throw new Error(`GitHub releases API answered ${response.status} ${response.statusText}`);
  }
  const releases = await response.json();
  if (!Array.isArray(releases) || releases.length === 0) {
    throw new Error("GitHub reported no releases");
  }
  return releases
    .filter((release) => !release.draft)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .map(summarise);
}

function readSnapshot() {
  if (!existsSync(SNAPSHOT)) return null;
  try {
    return JSON.parse(readFileSync(SNAPSHOT, "utf8"));
  } catch {
    return null;
  }
}

let releases;
try {
  releases = await fetchFromApi();
  mkdirSync(dirname(resolve(SNAPSHOT)), { recursive: true });
  writeFileSync(SNAPSHOT, `${JSON.stringify(releases, null, 2)}\n`);
  console.log(`releases: read ${releases.length} from the GitHub API, snapshot refreshed`);
} catch (error) {
  releases = readSnapshot();
  if (!releases) {
    console.error(`could not read releases and no usable snapshot at ${SNAPSHOT}: ${error.message}`);
    process.exit(2);
  }
  console.warn(`releases: ${error.message}. Using the committed snapshot at ${SNAPSHOT}.`);
}

/** The newest release, which is what the download buttons point at. */
export const LATEST = releases[0];

/** Every release, newest first. The changelog reads this. */
export const RELEASES_RESOLVED = releases;

/** The platforms the newest release actually ships, in display order. */
export const DOWNLOADS = LATEST.downloads;

/** True when the newest release is a prerelease, which the site says out loud. */
export const IS_PRERELEASE = LATEST.prerelease;

/** Every tag the repository has, so the changelog can say what has no release. */
export const KNOWN_TAGS = releases.map((release) => release.tag);
