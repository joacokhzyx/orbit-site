import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

// Two things have to be declared here that Starlight 0.42 does not do for
// you.
//
// 1. The collection. Without this file the build reports it as empty and
//    emits no docs route at all, and it fails quietly: the marketing pages
//    still build, so only the link gate noticed that /docs had vanished.
//
// 2. The prefix. Starlight injects its route at /[...slug], so slugs land at
//    the site root and /start/tour competes with the home page. Prefixing
//    every id with docs/ puts the documentation at /docs where the
//    navigation says it is, without a second Astro instance and without
//    a mirrored content directory. An index file resolves to its directory,
//    so index.md at the root of the collection is /docs.
const toSlug = (entry: string): string => {
  const withoutExtension = entry.replace(/\.(md|mdx|markdown)$/i, "");
  const asPath = withoutExtension.replace(/(^|\/)index$/, "");
  return `docs${asPath ? `/${asPath}` : ""}`;
};

export const collections = {
  docs: defineCollection({
    loader: docsLoader({ generateId: ({ entry }) => toSlug(entry) }),
    schema: docsSchema(),
  }),
};
