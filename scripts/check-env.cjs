#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { ROOT } = require("./spec-utils.cjs");

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed:\n${result.stderr || result.stdout}`,
    );
  }

  return (result.stdout || "").trim();
};

const firstLine = (text) => text.split("\n")[0];

try {
  const ffmpeg = firstLine(run("ffmpeg", ["-version"]));
  const ffprobe = firstLine(run("ffprobe", ["-version"]));

  console.log("Environment OK");
  console.log(`  node    ${process.version}`);
  console.log(`  ffmpeg  ${ffmpeg}`);
  console.log(`  ffprobe ${ffprobe}`);
  console.log(`  root    ${ROOT}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
