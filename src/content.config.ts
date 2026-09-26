import { defineCollection } from "astro:content";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
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
  // Starlight reads a collection called "i18n" for its UI strings on every
  // build. Declaring it is what stops the build logging "the collection
  // i18n does not exist or is empty" and returning nothing, which is a
  // warning about a collection that is supposed to be empty on an
  // English-only site.
  i18n: defineCollection({ loader: i18nLoader() }),
};
