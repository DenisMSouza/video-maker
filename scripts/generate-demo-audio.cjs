#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { ensureDir, publicPath } = require("./spec-utils.cjs");

const runFfmpeg = (args) => {
  const result = spawnSync("ffmpeg", ["-y", ...args], {
    cwd: ROOT,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

ensureDir(publicPath("audio/sfx"));

runFfmpeg([
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=196:duration=12",
  "-af",
  "volume=0.25,afade=t=in:st=0:d=0.2,afade=t=out:st=11.6:d=0.4",
  "-codec:a",
  "libmp3lame",
  "-q:a",
  "4",
  publicPath("audio/narracao.mp3"),
]);

runFfmpeg([
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=110:duration=12",
  "-af",
  "volume=0.2,afade=t=in:st=0:d=0.4,afade=t=out:st=11.4:d=0.6",
  "-codec:a",
  "libmp3lame",
  "-q:a",
  "4",
  publicPath("audio/musica.mp3"),
]);

runFfmpeg([
  "-f",
  "lavfi",
  "-i",
  "anoisesrc=duration=0.55:color=white:sample_rate=48000",
  "-af",
  "highpass=f=400,lowpass=f=1800,volume=0.5,afade=t=in:st=0:d=0.05,afade=t=out:st=0.2:d=0.35",
  "-codec:a",
  "libmp3lame",
  "-q:a",
  "4",
  publicPath("audio/sfx/whoosh.mp3"),
]);

console.log("Demo audio written to public/audio");
