import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createExampleBrief } from "../agents/briefAgent.js";

const target = process.argv[2] ?? join("factory", "briefs", "daily", "mock-brief.json");
const brief = createExampleBrief("generator");

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(brief, null, 2) + "\n", "utf8");
console.log("Created brief: " + target);

