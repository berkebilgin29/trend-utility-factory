# How It Works

The factory turns a small JSON brief into a runnable Vite, React, TypeScript utility app. Codex builds and fixes the factory; future projects should mostly be created by editing briefs and running CLI scripts.

Flow:
1. Write or generate a brief in `factory/briefs`.
2. Run `npm.cmd run create:project -- <brief-path>`.
3. Review the generated project in `factory/generated-projects/<slug>`.
4. Run QA and sample builds before publishing.

Default generation uses the mock provider and does not call external APIs.

