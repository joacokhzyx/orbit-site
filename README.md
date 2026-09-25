# orbit-site

Official Orbit site. Astro + TypeScript (strict) + Tailwind CSS.

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Local dev at `localhost:4321` |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run check` | `astro check` diagnostics |

## Notes

- TypeScript is pinned to 5.9.x because `astro check` (language-server) does not yet support the TS 7 native API. Astro 7 + Tailwind 4 stay latest.
- Voice follows `ORBIT_BRAND_LANGUAGE_SYSTEM.md`: calm, precise, no hype. Headline + datum + `Source: IEA Energy and AI.`
- Drop the mission illustration exported from Figma as `public/mission-street.jpg` (16:9, WebP under 120KB recommended).
