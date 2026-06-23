import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const generatedRoot = join(process.cwd(), "factory", "generated-projects");
if (!existsSync(generatedRoot)) {
  console.error("No generated projects folder found.");
  process.exit(1);
}

const projects = readdirSync(generatedRoot)
  .map((name) => join(generatedRoot, name))
  .filter((path) => statSync(path).isDirectory())
  .sort();

if (projects.length === 0) {
  console.error("No generated projects found. Run npm.cmd run create:project first.");
  process.exit(1);
}

const sample = projects[0];
console.log("Building sample generated project: " + sample);

const install = runNpm(sample, ["install"]);
if (install.status !== 0) {
  console.error("npm.cmd install failed for sample project.");
  process.exit(install.status ?? 1);
}

const build = runNpm(sample, ["run", "build"]);
if (build.status !== 0) {
  console.error("npm.cmd run build failed for sample project.");
  process.exit(build.status ?? 1);
}

console.log("Sample build passed: " + sample);

function runNpm(cwd: string, args: string[]) {
  if (process.platform === "win32") {
    return spawnSync("cmd.exe", ["/d", "/s", "/c", "npm.cmd", ...args], { cwd, stdio: "inherit" });
  }
  return spawnSync("npm", args, { cwd, stdio: "inherit" });
}
