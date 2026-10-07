/// <reference types="astro/client" />

// Starlight's component overrides import its own components through virtual
// module ids, and TypeScript cannot resolve those — they are created by a
// Vite plugin at build time and have no file on disk to find.
//
// `astro check` typechecks `src/`, so a component that imports one fails the
// build with "Cannot find module 'virtual:starlight/components/…'". The
// module exists and resolves fine at build time; only the type is missing.
// Declaring it here is what lets a component override use Starlight's own
// pieces — DocsSidebar.astro pulls MobileMenuFooter from it so the mobile
// menu keeps its edit link and last-updated line.
//
// The shape is deliberately loose. These are `.astro` components and their
// props differ per component; `any` is honest about that in a way a
// hand-written interface per component would not be, and it is scoped to a
// single declaration rather than leaking into the rest of the project.
declare module "virtual:starlight/components/*" {
  const component: any;
  export default component;
}