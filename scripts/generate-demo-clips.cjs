#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { ensureDir, publicPath } = require("./spec-utils.cjs");

const runFfmpeg = (args) => {
  const result = spawnSync("ffmpeg", ["-y", ...args], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

ensureDir(publicPath("clips"));

runFfmpeg([
  "-f",
  "lavfi",
  "-i",
  "testsrc2=size=1920x1080:rate=30:duration=4",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=220:duration=4",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac",
  "-shortest",
  publicPath("clips/demo-movimento.mp4"),
]);

runFfmpeg([
  "-f",
  "lavfi",
  "-i",
  "mandelbrot=size=1920x1080:rate=30",
  "-t",
  "4",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-an",
  publicPath("clips/demo-produto.mp4"),
]);

console.log("Demo clips written to public/clips");
