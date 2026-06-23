# Daily Workflow

1. Run `npm.cmd run agent:research` to inspect local trend/design signals.
2. Optionally run `npm.cmd run agent:research -- --live` for free public web/RSS signals.
3. Run `npm.cmd run agent:daily -- --dry-run --count 4` to preview briefs and scores.
4. Run `npm.cmd run agent:daily -- --count 4 --force` to write daily briefs and generate projects.
5. Run `npm.cmd run qa`.
6. Run `npm.cmd run build:sample -- <project-slug>`.
7. Escalate to Codex only for broken templates, TypeScript errors, build failures, or final polish.

Do not build 20 projects at once. Keep the batch small and review results.
