# Adding a level

A level is one lesson file plus one puzzle. Nothing in `src/engine` needs to change.

1. **Model math (if new):** add pure functions to `src/models/` with unit tests in `tests/unit/`. No React or DOM code in `src/models/`.
2. **Puzzle definition:** create `src/puzzles/<id>.ts` exporting a `PuzzleDef` (`start`, `apply`, `conditions`, `par`, `hints`, `solution`). `apply` must be pure and must return the *same* object when an action changes nothing.
3. **Stage:** create `src/puzzles/<Id>Stage.tsx`. It receives `state` and `dispatch` and must not change state any other way. Use components from `src/viz/` so every visual gets a "View as table" option.
4. **Register:** add the def to `src/puzzles/defs.ts` and the `{ def, Stage }` module to `src/puzzles/registry.ts`. `npm test` now proves the puzzle doesn't start solved and that its solution works.
5. **Code challenge (optional):** create `src/challenges/<id>.ts`, register it in `src/challenges/registry.ts`, and add a deliberately wrong implementation to the `wrong` map in `tests/unit/challenges.test.ts`.
6. **Explore widget:** create `src/explore/<Name>.tsx`, wrapped with `withBoundary`.
7. **Lesson:** create `src/content/levels/<track>/<NN>-<slug>.mdx` with the frontmatter fields `levelId`, `track`, `order`, `title`, `summary`, `puzzle` and optionally `challenge`. Embed the Explore widget with `client:visible`.
8. Add the slug to `tests/e2e/levels.ts`, then run `npm test && npm run check && npm run test:e2e`.

Rules: plain English, keyboard and touch must both work, no new runtime network requests, and all internal links use `withBase()`.
