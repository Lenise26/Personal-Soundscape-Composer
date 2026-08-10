# Personal Soundscape Composer

A professional, responsive browser application for creating layered ambient sound environments for creative projects, focused work, small-business client spaces, and relaxation.

Users can add ambient layers, control individual volume, define exact start/end times, set fade-in and fade-out durations, toggle looping or muting, preview the arrangement, save multiple compositions, and duplicate a composition before experimenting. Each composition includes a visual timeline, and a reusable configuration library provides realistic U.S.-focused starter setups.

## Highlights

- **Original, self-contained codebase** — not copied from an existing open-source repository.
- **No third-party runtime dependencies** — the app uses browser APIs and modern JavaScript only.
- **No bundled copyrighted audio** — ambient layers are synthesized at runtime with the Web Audio API.
- **Small-business friendly** — no account, backend, paid API, or external audio hosting is needed for the core workflow.
- **U.S.-focused realistic sample data** — examples include Seattle, Brooklyn, Big Sur, and Portland.
- **Responsive UI** — optimized for desktop, tablet, and mobile layouts.
- **Production-minded quality** — safe HTML escaping, local persistence, keyboard focus states, semantic labels, syntax checks, unit tests, integrity tests, and a reproducible static build.

## Features

- Multiple compositions with local browser persistence
- Composition duplication/versioning
- Eight reusable ambient sound types
- Per-layer volume control
- Precise start/end timing
- Fade-in and fade-out controls
- Loop and mute settings
- Visual timeline with playhead and seek support
- Web Audio preview playback
- Reusable sound-configuration library
- Searchable sound palette
- Realistic sample compositions and business use cases
- Responsive layout
- Automated Node test suite

## Tech stack

- HTML5
- Modern CSS
- JavaScript ES modules
- Web Audio API
- LocalStorage API
- Node.js built-in test runner and build scripts

There are **zero package dependencies**, which keeps installation fast and avoids supply-chain or registry issues for this starter project.

## Run locally

Requires Node.js 20 or newer.

```bash
npm run dev
```

Open `http://127.0.0.1:5173`.

## Quality checks

```bash
npm test
npm run check
npm run build
```

`npm run build` creates the deployment-ready static site in `dist/`.

## Deploy

The `dist/` folder can be deployed to any static host such as GitHub Pages, Cloudflare Pages, Netlify, an S3-compatible static site, or a standard web server. No server-side runtime is required for the current feature set.

## Repository structure

```text
Personal Soundscape Composer/
├── src/
│   ├── index.html          Application shell and metadata
│   ├── app.js              State, UI rendering, timeline/editor workflows
│   ├── audioEngine.js      Web Audio synthesis and playback scheduling
│   ├── data.js             U.S.-focused starter data and reusable configs
│   ├── format.js           Shared formatting and numeric helpers
│   ├── storage.js          Local persistence adapter
│   └── styles.css          Responsive design system
├── tests/                  Unit, data integrity, and repository tests
├── scripts/                Dependency-free dev server and build script
├── CONTRIBUTING.md
├── SECURITY.md
├── UPLOAD_DESCRIPTION.txt
└── package.json
```

## Data and privacy

Composition data is stored only in the user's browser through `localStorage`. This version does not transmit project data to a server. For a future team edition, replace `src/storage.js` with an authenticated backend adapter and apply server-side authorization to every composition.

## GitHub repository description

> Professional browser-based ambient soundscape composer with layered Web Audio, visual timeline arrangement, fades, looping, reusable U.S.-focused presets, local saving, responsive UI, and automated tests.

## Suggested GitHub topics

`web-audio-api` `javascript` `ambient-sound` `audio` `productivity` `small-business` `responsive-design` `localstorage` `node-test-runner`

## Production expansion ideas

For a multi-user business release, natural next steps are team workspaces, authenticated cloud synchronization, licensed audio uploads, export/render jobs, organization-level permissions, audit history, and shared preset collections. The storage and audio layers are separated so those additions can be made without rewriting the editor UI.

## License

Copyright (c) 2026. All rights reserved by the repository owner unless you choose to add a separate license when publishing.
