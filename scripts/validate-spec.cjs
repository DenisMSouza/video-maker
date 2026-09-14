#!/usr/bin/env node
const {
  fileExistsInPublic,
  listSpecIds,
  loadSpecById,
} = require("./spec-utils.cjs");

const requested = process.argv[2];
const specIds = requested ? [requested] : listSpecIds();

if (specIds.length === 0) {
  console.error("No specs found in public/specs");
  process.exit(1);
}

let failed = false;

for (const specId of specIds) {
  try {
    const spec = loadSpecById(specId);
    const missing = [];

    for (const scene of spec.scenes) {
      if (scene.image && !fileExistsInPublic(scene.image)) {
        missing.push(scene.image);
      }

      const videoFile =
        typeof scene.video === "string" ? scene.video : scene.video?.file;
      if (videoFile && !fileExistsInPublic(videoFile)) {
        missing.push(videoFile);
      }
    }

    if (spec.audio) {
      for (const path of [
        spec.audio.narration,
        spec.audio.music,
      ]) {
        if (path && !fileExistsInPublic(path)) {
          missing.push(path);
        }
      }

      for (const cue of spec.audio.sfx || []) {
        if (!fileExistsInPublic(cue.file)) {
          missing.push(cue.file);
        }
      }
    }

    const duration = spec.scenes.reduce(
      (total, scene) => total + scene.durationInSeconds,
      0,
    );

    console.log(`${spec.id}: ${spec.scenes.length} cenas, ${duration}s`);
    if (missing.length > 0) {
      console.log("  avisos: arquivos ainda não encontrados:");
      for (const file of missing) {
        console.log(`    - ${file}`);
      }
    }
  } catch (error) {
    failed = true;
    console.error(`${specId}: ${error instanceof Error ? error.message : error}`);
  }
}

if (failed) {
  process.exit(1);
}
