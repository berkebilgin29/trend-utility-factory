# Autonomous Agent Workflow

This layer keeps Codex out of routine production. Codex should maintain the factory and fix failures; local agents should handle research, scoring, brief writing, generation, and first-pass review.

## Roles
- Trend research agent: collects offline seed signals by default and can optionally read free public web/RSS sources with `--live`.
- Design research agent: applies a local design pattern library based on reusable utility-app UX principles. It does not copy brands, logos, or proprietary layouts.
- Idea council agent: scores usefulness, trend fit, SEO clarity, build simplicity, and originality safety.
- Production robot: writes the selected JSON briefs, generates projects through the existing factory, runs QA, and reviews outputs.
- Review agent: checks generated projects for SEO basics, FAQ, disclaimer, README commands, robots, sitemap, and JSON-LD.

## Commands
- Research only: `npm.cmd run agent:research`
- Research with free public web signals: `npm.cmd run agent:research -- --live`
- Dry-run daily production: `npm.cmd run agent:daily -- --dry-run --count 4`
- Generate the daily batch: `npm.cmd run agent:daily -- --count 4 --force`
- Review one generated project: `npm.cmd run agent:review -- phone-total-cost-calculator`
- Use local Ollama if running: `npm.cmd run agent:daily -- --provider ollama --count 4`

## ChatGPT and Gemini Use
Use ChatGPT and Gemini as external idea/review councils by pasting the research output from `agent:research` into the prompts in `chatgpt-gemini-idea-council.md`. Do not require paid APIs for the default workflow.

## Guardrails
- No games, POS focus, World Cup focus, or personal-history-based ideas.
- No paid APIs, deployments, external accounts, or analytics by default.
- Prefer JSON brief edits over code edits.
- Do not rewrite templates for a single project.
- Codex should only handle broken builds, TypeScript errors, broken templates, or final minimal polish.
