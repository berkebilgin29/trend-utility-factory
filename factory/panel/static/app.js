const stageLabels = {
  trendResearch: "Trend research",
  designResearch: "Design research",
  ideaCouncil: "ChatGPT / Gemini idea council",
  productionRobot: "Local production robot",
  review: "Final review"
};

const providerOptions = [
  ["local-agent", "Local agent"],
  ["local-agent-live", "Local agent + free web/RSS"],
  ["ollama", "Ollama local LLM"],
  ["chatgpt-manual", "ChatGPT manual"],
  ["gemini-manual", "Gemini manual"],
  ["chatgpt-gemini-manual", "ChatGPT + Gemini manual"],
  ["local-pattern-library", "Local design library"],
  ["factory-cli", "Factory CLI"]
];

let state = null;

document.getElementById("refreshButton").addEventListener("click", refresh);
document.getElementById("saveConfigButton").addEventListener("click", saveConfig);
document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => runAction(button.dataset.action));
});

await refresh();
setInterval(refresh, 2500);

async function refresh() {
  const response = await fetch("/api/status");
  state = await response.json();
  render();
}

function render() {
  document.getElementById("briefCount").textContent = String(state.dailyBriefs.length);
  document.getElementById("projectCount").textContent = String(state.generatedProjects.length);
  document.getElementById("totalTokens").textContent = formatNumber(state.estimates.totalExternalTokens) + " est. external tokens";
  document.getElementById("perProjectTokens").textContent = formatNumber(state.estimates.averageExternalTokensPerProject);
  document.getElementById("paidTokens").textContent = formatNumber(state.estimates.paidApiTokens);
  document.getElementById("localTokens").textContent = formatNumber(state.estimates.localTokens);
  document.getElementById("tokenNote").textContent = state.estimates.note;

  renderStages();
  renderProjectSelect();
  renderBriefs();
  renderJobs();
}

function renderStages() {
  const grid = document.getElementById("stageGrid");
  grid.innerHTML = "";
  for (const [stage, label] of Object.entries(stageLabels)) {
    const card = document.createElement("div");
    card.className = "stage-card";
    const title = document.createElement("h3");
    title.textContent = label;
    const select = document.createElement("select");
    select.dataset.stage = stage;
    for (const [value, text] of providerOptions) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      option.selected = state.config.stages[stage] === value;
      select.append(option);
    }
    card.append(title, select);
    grid.append(card);
  }
}

function renderProjectSelect() {
  const select = document.getElementById("projectSelect");
  const current = state.config.selectedProjectSlug;
  select.innerHTML = "";
  for (const slug of state.generatedProjects) {
    const option = document.createElement("option");
    option.value = slug;
    option.textContent = slug;
    option.selected = slug === current;
    select.append(option);
  }
}

function renderBriefs() {
  const list = document.getElementById("briefList");
  list.innerHTML = "";
  for (const brief of state.dailyBriefs) {
    const item = document.createElement("li");
    item.textContent = brief;
    list.append(item);
  }
}

function renderJobs() {
  const jobs = document.getElementById("jobs");
  jobs.innerHTML = "";
  if (state.jobs.length === 0) {
    jobs.textContent = "No jobs yet.";
    return;
  }
  for (const job of state.jobs) {
    const item = document.createElement("article");
    item.className = "job";
    const header = document.createElement("div");
    header.className = "job-header";
    const title = document.createElement("span");
    title.textContent = "#" + job.id + " " + job.action;
    const status = document.createElement("span");
    status.className = "status-" + job.status;
    status.textContent = job.status;
    const output = document.createElement("pre");
    output.textContent = job.output.join("");
    header.append(title, status);
    item.append(header, output);
    jobs.append(item);
  }
}

async function saveConfig() {
  const config = structuredClone(state.config);
  config.selectedProjectSlug = document.getElementById("projectSelect").value || config.selectedProjectSlug;
  document.querySelectorAll("[data-stage]").forEach((select) => {
    config.stages[select.dataset.stage] = select.value;
  });
  await fetch("/api/config", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(config)
  });
  await refresh();
}

async function runAction(action) {
  await saveConfig();
  const payload = {
    action,
    count: state.config.dailyCount,
    slug: document.getElementById("projectSelect").value || state.config.selectedProjectSlug
  };
  await fetch("/api/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  await refresh();
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

