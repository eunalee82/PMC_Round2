# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser-based interactive quiz/game with a villain-boss theme ("빌런왕"). Built with vanilla JavaScript and Vite — no UI framework. Intended game flow (see `docs/assets-list.md`): opening video → oath/pledge signing screen → multi-stage quiz (Stage 1/2/3) with per-stage pass backgrounds → boss-defeat sequence. UI copy and asset descriptions are in Korean.

Current state: this is still a fresh Vite scaffold. `src/main.js`, `src/counter.js`, and `src/style.css` are the default starter files, and most directories below are empty. The layout described here is the intended structure to build into.

## Commands

```
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the built dist/ locally
```

No linter or test runner is configured — these three are the only npm scripts. Do not assume `npm test` or `npm run lint` exist; add the tooling first if needed.

## Architecture & conventions

- **Vanilla ESM, no framework.** `package.json` sets `"type": "module"`. Entry is `index.html` → `/src/main.js`, which renders by assigning `innerHTML` on `#app`. Keep this DOM-string rendering approach unless a framework is explicitly requested.
- **`public/` is served at the web root.** Files under `public/` are copied verbatim into the build and referenced by absolute path — e.g. `/images/backgrounds/opening.png`, `/audio/bgm/opening.mp3`. This is why `docs/assets-list.md` uses leading-slash paths. Reference these as absolute URLs at runtime; do not `import` them through `src/`. (`src/assets/` is the separate place for assets you `import` and let Vite bundle/hash.)
- **`docs/assets-list.md` is the asset manifest and source of truth** for required images, videos, and BGM. The Status column uses 준비 (planned/ready) and 미정 (undecided). Keep it in sync when adding or wiring assets — and note it may reference folders not yet created on disk (e.g. `/images/characters/`).
- **App source lives under `src/`**, organized into `src/css/`, `src/js/`, and `src/components/`.
- **`supabase/` is reserved for a planned Supabase backend** (currently empty).
- **`design/` holds design references.**

Runtime asset folders under `public/`: `images/{backgrounds,logos,questions,badges,icons,ui}`, `audio/{bgm,sfx}`, `videos/`.
