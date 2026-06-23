# Codex Escalation

Use Codex only when:
- A generated project fails TypeScript or build.
- A shared template is broken.
- QA reports missing required files.
- A minimal polish pass is needed after generation.

Minimal-fix prompt:

Fix the failing generated project with the smallest diff. Do not regenerate the factory. Do not rewrite unrelated templates. Do not add dependencies unless required and approved. Run the failing command again and report the exact fix.

