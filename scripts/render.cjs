#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { join } = require("node:path");
const { ROOT, ensureDir, loadSpecById } = require("./spec-utils.cjs");

const specId = process.argv[2] || "exemplo";
const spec = loadSpecById(specId);
const output = process.argv[3] || join("out", `${spec.id}.mp4`);

ensureDir(join(ROOT, "out"));

const result = spawnSync(
  "npx",
  ["remotion", "render", spec.id, output],
  { cwd: ROOT, stdio: "inherit" },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Rendered ${output}`);
