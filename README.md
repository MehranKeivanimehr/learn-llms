# Learn LLMs

An interactive, game-like website that teaches how large language models work. Each level is a full-screen arcade: type commands in the terminal (or use the canvas), watch a tiny real model react, and solve the goal. Lessons open as short slides with a "Show me" demo, and every level has an optional code challenge. Everything runs in your browser — no accounts, no cookies, no tracking.

Created by Mehran Keivanimehr.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321
```

## Test

```bash
npm test           # unit tests (models, puzzles, commands, challenges, progress)
npm run check      # type-check
npm run test:e2e   # browser tests incl. accessibility, phones and reduced motion
```

## Retrain the level-8 model

```bash
npm run train      # writes src/models/weights/char-model.json
```

## Deploy

Every push to `main` is tested and published to GitHub Pages by `.github/workflows/deploy.yml`.

**One-time setup before the first push:** in the GitHub repository, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**. A repository named `<username>.github.io` is served at `https://<username>.github.io/`; any other name is served at `https://<username>.github.io/<repo>/`. The workflow handles both.

See `CONTRIBUTING.md` to add a level.
