# Daily Workflow

1. Collect trend ideas from public demand signals.
2. Convert the best ideas into compact JSON briefs.
3. Run `npm.cmd run factory:daily` for five mock projects or `npm.cmd run create:batch -- factory/briefs/daily`.
4. Run `npm.cmd run qa`.
5. Run `npm.cmd run build:sample`.
6. Escalate to Codex only for broken templates, TypeScript errors, build failures, or final polish.

Do not build 20 projects at once. Keep the batch small and review results.

