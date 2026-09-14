#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { basename, join } = require("node:path");
const { ROOT, ensureDir } = require("./spec-utils.cjs");

const input = process.argv[2] || "out/exemplo.mp4";
const target = (process.argv[3] || "youtube").replace(/^--target=/, "");
const output =
  process.argv[4] ||
  join("out", `${basename(input, ".mp4")}-${target}.mp4`);

const presets = {
  youtube: [
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "18",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
  ],
  social: [
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
  ],
  instagram: [
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
  ],
  reels: [
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
  ],
};

const ffmpegArgs = presets[target];
if (!ffmpegArgs) {
  console.error(`Unknown target "${target}". Use youtube, social, instagram or reels.`);
  process.exit(1);
}

ensureDir(join(ROOT, "out"));

const result = spawnSync(
  "ffmpeg",
  ["-y", "-i", input, ...ffmpegArgs, output],
  { cwd: ROOT, stdio: "inherit" },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Compressed video written to ${output}`);
