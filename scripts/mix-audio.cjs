#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { join } = require("node:path");
const {
  ROOT,
  ensureDir,
  fileExistsInPublic,
  loadSpecById,
  publicPath,
} = require("./spec-utils.cjs");

const specId = process.argv[2] || "exemplo";
const spec = loadSpecById(specId);
const audio = spec.audio;

if (!audio) {
  console.error(`${specId} does not define audio`);
  process.exit(1);
}

const inputs = [];
const filters = [];
const labels = [];
let inputIndex = 0;

const addInput = (relativePath, filter) => {
  if (!fileExistsInPublic(relativePath)) {
    throw new Error(`Missing audio file: ${relativePath}`);
  }

  inputs.push("-i", publicPath(relativePath));
  const label = `a${inputIndex}`;
  filters.push(`[${inputIndex}:a]${filter}[${label}]`);
  labels.push(`[${label}]`);
  inputIndex += 1;
};

if (audio.narration && fileExistsInPublic(audio.narration)) {
  addInput(
    audio.narration,
    "aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo",
  );
}

if (audio.music && fileExistsInPublic(audio.music)) {
  const volume = audio.musicVolume ?? 0.15;
  addInput(
    audio.music,
    `aresample=48000,volume=${volume},aformat=sample_fmts=fltp:channel_layouts=stereo`,
  );
}

if (Array.isArray(audio.sfx)) {
  for (const cue of audio.sfx) {
    if (!fileExistsInPublic(cue.file)) {
      continue;
    }

    const delayMs = Math.max(0, Math.round(cue.atSeconds * 1000));
    const volume = cue.volume ?? 0.4;
    addInput(
      cue.file,
      `aresample=48000,volume=${volume},adelay=${delayMs}|${delayMs},aformat=sample_fmts=fltp:channel_layouts=stereo`,
    );
  }
}

if (inputs.length === 0) {
  console.error(
    `No audio files found for ${specId}. Put narration/music/sfx under public/ and try again.`,
  );
  process.exit(1);
}

const mixedRelative = audio.mixed || `audio/mix/${spec.id}.mp3`;
const mixedAbsolute = publicPath(mixedRelative);
ensureDir(join(mixedAbsolute, ".."));

const args = ["-y", ...inputs];

if (inputIndex === 1) {
  args.push("-codec:a", "libmp3lame", "-q:a", "2", mixedAbsolute);
} else {
  args.push(
    "-filter_complex",
    `${filters.join(";")};${labels.join("")}amix=inputs=${inputIndex}:duration=longest:dropout_transition=2[mix]`,
    "-map",
    "[mix]",
    "-codec:a",
    "libmp3lame",
    "-q:a",
    "2",
    mixedAbsolute,
  );
}

const result = spawnSync("ffmpeg", args, {
  cwd: ROOT,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Mixed audio written to public/${mixedRelative}`);
