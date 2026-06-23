# Local Panel

Run the local dashboard with:

```powershell
npm.cmd run panel
```

Open:

```text
http://localhost:4177
```

The panel shows:
- daily brief count
- generated project count
- selected AI/provider per pipeline stage
- estimated ChatGPT/Gemini manual-review tokens
- local Ollama token estimate when selected
- recent command output
- buttons for research, dry-run daily production, daily generation, QA, review, and build

Default behavior does not call paid APIs. ChatGPT and Gemini are represented as manual council stages so their token usage can be estimated before you paste prompts into those tools. Ollama can be selected when it is already running locally.

The panel only runs whitelisted npm scripts inside this repository.
