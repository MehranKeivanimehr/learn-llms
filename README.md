# Learn LLMs

An interactive website that teaches how large language models work. Each level gives you a tiny, real model to play with: explore an idea, solve a puzzle, and optionally write the code yourself. Everything runs in your browser — no accounts, no cookies, no tracking.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321
```

## Test

```bash
npm test           # unit tests (models, puzzles, challenges, progress)
npm run check      # type-check
npm run test:e2e   # browser tests incl. accessibility and mobile
```

## Retrain the level-8 model

```bash
npm run train      # writes src/models/weights/char-model.json
```

## Deploy

Every push to `main` is tested and published to GitHub Pages by `.github/workflows/deploy.yml`.

**One-time setup before the first push:** in the GitHub repository, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**. Without it the deploy job fails. A repository named `<username>.github.io` is served at `https://<username>.github.io/`; any other name is served at `https://<username>.github.io/<repo>/`. The workflow handles both.

See `CONTRIBUTING.md` to add a level.
