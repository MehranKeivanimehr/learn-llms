# Adding a level

A level is a lesson file, a puzzle, a scene and a command table. Nothing in `src/arcade` needs to change.

1. **Model math (if new):** add pure functions to `src/models/` with unit tests in `tests/unit/`. No React or DOM code in `src/models/`.
2. **Puzzle rules:** create `src/puzzles/<id>.ts` exporting a `PuzzleDef` (`start`, `apply`, `conditions`, `par`, `hints`, `solution`). `apply` must be pure and return the *same* object when an action changes nothing. Add it to `src/puzzles/defs.ts`; `npm test` proves it doesn't start solved and that its solution works.
3. **Commands:** create `src/commands/levels/<id>.ts` exporting a `LevelCommandSet` that turns typed commands into the puzzle's actions, plus a one-line `summarize`. Add a typing-only solution to `tests/unit/levelCommands.test.ts`.
4. **Scene:** create `src/scenes/<Id>Scene.tsx`. It receives `state` and `dispatch`; animate changes with `useTween` and keep a "View as table" option (`SceneCard`). Every action must also be reachable by clicking or tapping.
5. **Register:** add a loader to `src/arcade/levelModules.ts`.
6. **Code challenge (optional):** create `src/challenges/<id>.ts`, register it in `src/challenges/registry.ts`, and add a deliberately wrong implementation to `tests/unit/challenges.test.ts`.
7. **Lesson:** create `src/content/levels/<track>/<NN>-<slug>.mdx`. Each `##` heading starts a slide in the intro dialog. Frontmatter: `levelId`, `track`, `order`, `title`, `summary`, `puzzle`, optional `challenge`, and `demo` (commands for "Show me" that do **not** solve the puzzle).
8. Add the slug to `tests/e2e/levels.ts`, write `tests/e2e/levelN.spec.ts` (solve by typing and by clicking), then run `npm test && npm run check && npm run test:e2e`.

Rules: plain English, keyboard and touch must both work, every motion respects reduced motion, no new runtime network requests, and all internal links use `withBase()`.
