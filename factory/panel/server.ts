import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { spawn } from "node:child_process";
import { estimateTokens, readPanelConfig, writePanelConfig, type PanelConfig } from "./panelConfig.js";

type Job = {
  id: number;
  action: string;
  status: "running" | "passed" | "failed";
  startedAt: string;
  finishedAt?: string;
  output: string[];
};

type PanelState = {
  lastAutoRunDate?: string;
  lastAutoRunStatus?: "passed" | "failed";
  lastAutoRunAt?: string;
};

const port = Number(process.env.PORT ?? 4177);
const panelRoot = join(process.cwd(), "factory", "panel", "static");
const statePath = join(process.cwd(), "factory", "panel", "panel-state.json");
const jobs: Job[] = [];
let nextJobId = 1;
let autoRunInProgress = false;

const actions: Record<string, (body: Record<string, unknown>) => { command: string; args: string[] }[]> = {
  research: () => [{ command: "npm.cmd", args: ["run", "agent:research"] }],
  researchLive: () => [{ command: "npm.cmd", args: ["run", "agent:research", "--", "--live"] }],
  dryDaily: (body) => [{ command: "npm.cmd", args: ["run", "agent:daily", "--", "--dry-run", "--count", String(body.count ?? 4)] }],
  generateDaily: (body) => [{ command: "npm.cmd", args: ["run", "agent:daily", "--", "--count", String(body.count ?? 4), "--force"] }],
  qa: () => [{ command: "npm.cmd", args: ["run", "qa"] }],
  review: (body) => [{ command: "npm.cmd", args: ["run", "agent:review", "--", String(body.slug ?? "phone-total-cost-calculator")] }],
  build: (body) => [{ command: "npm.cmd", args: ["run", "build:sample", "--", String(body.slug ?? "phone-total-cost-calculator")] }],
  autoDaily: (body) => buildAutoDailyCommands(readPanelConfig(), String(body.slug ?? readPanelConfig().selectedProjectSlug))
};

const server = createServer(async (request, response) => {
  try {
    if (!request.url) return send(response, 404, "Not found");
    const url = new URL(request.url, "http://localhost:" + port);

    if (request.method === "GET" && url.pathname === "/api/status") {
      return sendJson(response, {
        config: readPanelConfig(),
        estimates: estimateTokens(readPanelConfig()),
        automationState: readPanelState(),
        ollama: await getOllamaStatus(),
        dailyBriefs: listJsonNames(join(process.cwd(), "factory", "briefs", "daily")),
        generatedProjects: listFolders(join(process.cwd(), "factory", "generated-projects")),
        jobs: jobs.slice(-10).reverse()
      });
    }

    if (request.method === "POST" && url.pathname === "/api/config") {
      const body = (await readJson(request)) as PanelConfig;
      writePanelConfig(body);
      return sendJson(response, { ok: true, config: readPanelConfig(), estimates: estimateTokens(readPanelConfig()) });
    }

    if (request.method === "POST" && url.pathname === "/api/run") {
      const body = (await readJson(request)) as Record<string, unknown>;
      const action = String(body.action ?? "");
      const commandFactory = actions[action];
      if (!commandFactory) return sendJson(response, { ok: false, error: "Unknown action" }, 400);
      const job = runJob(action, commandFactory(body));
      return sendJson(response, { ok: true, jobId: job.id });
    }

    return serveStatic(url.pathname, response);
  } catch (error) {
    return sendJson(response, { ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

server.listen(port, () => {
  console.log("Trend Utility Factory panel running at http://localhost:" + port);
});

setInterval(() => {
  void maybeRunDailyAutomation();
}, 60_000);
void maybeRunDailyAutomation();

function runJob(action: string, commandSpecs: { command: string; args: string[] }[], onFinish?: (status: "passed" | "failed") => void): Job {
  const job: Job = { id: nextJobId++, action, status: "running", startedAt: new Date().toISOString(), output: [] };
  jobs.push(job);

  void runCommandSequence(job, commandSpecs).then((status) => {
    job.status = status;
    job.finishedAt = new Date().toISOString();
    onFinish?.(status);
  });

  return job;
}

async function runCommandSequence(job: Job, commandSpecs: { command: string; args: string[] }[]): Promise<"passed" | "failed"> {
  for (const commandSpec of commandSpecs) {
    pushOutput(job, "\n$ " + commandSpec.command + " " + commandSpec.args.join(" ") + "\n");
    const code = await runOneCommand(job, commandSpec);
    pushOutput(job, "\n[exit " + code + "]\n");
    if (code !== 0) return "failed";
  }
  return "passed";
}

function runOneCommand(job: Job, commandSpec: { command: string; args: string[] }): Promise<number> {
  return new Promise((resolve) => {
    const child =
      process.platform === "win32"
        ? spawn("cmd.exe", ["/d", "/s", "/c", commandSpec.command, ...commandSpec.args], { cwd: process.cwd(), shell: false })
        : spawn(commandSpec.command.replace(/\.cmd$/, ""), commandSpec.args, { cwd: process.cwd(), shell: false });

    child.stdout.on("data", (chunk) => pushOutput(job, chunk));
    child.stderr.on("data", (chunk) => pushOutput(job, chunk));
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", (error) => {
      pushOutput(job, error.message);
      resolve(1);
    });
  });
}

function pushOutput(job: Job, chunk: unknown): void {
  const text = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
  job.output.push(text);
  if (job.output.length > 80) job.output.splice(0, job.output.length - 80);
}

async function maybeRunDailyAutomation(): Promise<void> {
  const config = readPanelConfig();
  if (!config.automation.enabled || autoRunInProgress) return;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentTime = now.toTimeString().slice(0, 5);
  const state = readPanelState();
  if (state.lastAutoRunDate === today || currentTime < config.automation.time) return;

  autoRunInProgress = true;
  runJob("autoDaily", buildAutoDailyCommands(config, config.selectedProjectSlug), (status) => {
    writePanelState({ lastAutoRunDate: today, lastAutoRunStatus: status, lastAutoRunAt: new Date().toISOString() });
    autoRunInProgress = false;
  });
}

function buildAutoDailyCommands(config: PanelConfig, slug: string): { command: string; args: string[] }[] {
  const commands = [
    { command: "npm.cmd", args: ["run", "agent:research", ...(config.automation.liveResearch ? ["--", "--live"] : [])] },
    {
      command: "npm.cmd",
      args: [
        "run",
        "agent:daily",
        "--",
        "--count",
        String(config.automation.count),
        "--provider",
        config.automation.provider,
        "--force",
        ...(config.automation.liveResearch ? ["--live"] : [])
      ]
    },
    { command: "npm.cmd", args: ["run", "qa"] },
    { command: "npm.cmd", args: ["run", "agent:review", "--", slug] }
  ];
  if (config.automation.buildAfterGenerate) {
    commands.push({ command: "npm.cmd", args: ["run", "build:sample", "--", slug] });
  }
  return commands;
}

function readPanelState(): PanelState {
  if (!existsSync(statePath)) return {};
  try {
    return JSON.parse(readFileSync(statePath, "utf8")) as PanelState;
  } catch {
    return {};
  }
}

function writePanelState(state: PanelState): void {
  writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n", "utf8");
}

async function getOllamaStatus(): Promise<{ reachable: boolean; models: string[]; message: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 700);
  try {
    const response = await fetch("http://localhost:11434/api/tags", { signal: controller.signal });
    if (!response.ok) return { reachable: false, models: [], message: "Ollama cevap verdi ama model listesi alinamadi." };
    const json = (await response.json()) as { models?: { name?: string }[] };
    const models = (json.models ?? []).map((model) => model.name ?? "").filter(Boolean);
    return { reachable: true, models, message: models.length ? "Ollama calisiyor." : "Ollama calisiyor ama model listesi bos." };
  } catch {
    return { reachable: false, models: [], message: "Ollama calismiyor veya localhost:11434 ulasilamiyor." };
  } finally {
    clearTimeout(timeout);
  }
}

function serveStatic(pathname: string, response: ServerResponse): void {
  const normalized = pathname === "/" ? "/index.html" : pathname;
  const filePath = join(panelRoot, normalized.replace(/^\/+/, ""));
  if (!filePath.startsWith(panelRoot) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return send(response, 404, "Not found");
  }
  const contentType: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8"
  };
  response.writeHead(200, { "content-type": contentType[extname(filePath)] ?? "text/plain; charset=utf-8" });
  response.end(readFileSync(filePath));
}

function listJsonNames(folder: string): string[] {
  if (!existsSync(folder)) return [];
  return readdirSync(folder).filter((name) => name.endsWith(".json")).sort();
}

function listFolders(folder: string): string[] {
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((name) => statSync(join(folder, name)).isDirectory())
    .sort();
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function sendJson(response: ServerResponse, value: unknown, status = 200): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value, null, 2));
}

function send(response: ServerResponse, status: number, text: string): void {
  response.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  response.end(text);
}
