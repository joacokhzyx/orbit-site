// Types for the release resolver, which is plain JavaScript because it runs
// at build time and in the gates. Without this file every consumer of
// LATEST or DOWNLOADS is an `any`, and a typo in a download URL typechecks.

export type DownloadFormat = "setup" | "exe" | "tar.gz" | "zip" | "binary" | "file";

export interface Download {
  id: string;
  platform: string;
  arch: string;
  fileName: string;
  format: DownloadFormat;
  formatLabel: string;
  sizeBytes: number;
  sizeLabel: string;
  url: string;
}

export interface Release {
  version: string;
  tag: string;
  name: string;
  publishedAt: string;
  /** ISO date, for the changelog's <time> and for ordering. */
  date: string;
  prerelease: boolean;
  htmlUrl: string;
  downloads: Download[];
}

export declare function formatSize(bytes: number): string;
export declare const LATEST: Release;
export declare const RELEASES_RESOLVED: Release[];
export declare const DOWNLOADS: Download[];
export declare const IS_PRERELEASE: boolean;
export declare const KNOWN_TAGS: string[];
