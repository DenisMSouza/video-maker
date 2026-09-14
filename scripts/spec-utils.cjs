const { existsSync, mkdirSync, readFileSync, readdirSync } = require("node:fs");
const { basename, join, resolve } = require("node:path");

const ROOT = resolve(__dirname, "..");
const PUBLIC_DIR = join(ROOT, "public");
const SPECS_DIR = join(PUBLIC_DIR, "specs");
const ID_PATTERN = /^[a-zA-Z0-9-]+$/;
const HEX_PATTERN = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const ANIMATION_NAMES = new Set(["fade", "slide-up", "scale", "none"]);

const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const fail = (message) => {
  throw new Error(message);
};

const assertString = (value, path) => {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${path} must be a non-empty string`);
  }

  return value;
};

const assertNumber = (value, path) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${path} must be a finite number`);
  }

  return value;
};

const assertHex = (value, path) => {
  const color = assertString(value, path);
  if (!HEX_PATTERN.test(color)) {
    fail(`${path} must be a hex color like #0F172A`);
  }

  return color;
};

const parseSpec = (value) => {
  if (!isRecord(value)) {
    fail("Video spec must be a JSON object");
  }

  const id = assertString(value.id, "id");
  if (!ID_PATTERN.test(id)) {
    fail("id must contain only letters, numbers and hyphens");
  }

  if (!Array.isArray(value.scenes) || value.scenes.length === 0) {
    fail("scenes must be a non-empty array");
  }

  if (!isRecord(value.palette)) {
    fail("palette must be an object");
  }

  const scenes = value.scenes.map((scene, index) => {
    if (!isRecord(scene)) {
      fail(`scenes[${index}] must be an object`);
    }

    const durationInSeconds = assertNumber(
      scene.durationInSeconds,
      `scenes[${index}].durationInSeconds`,
    );
    if (durationInSeconds <= 0) {
      fail(`scenes[${index}].durationInSeconds must be greater than 0`);
    }

    if (scene.animation !== undefined) {
      if (!isRecord(scene.animation)) {
        fail(`scenes[${index}].animation must be an object`);
      }

      for (const key of ["enter", "exit"]) {
        if (
          scene.animation[key] !== undefined &&
          !ANIMATION_NAMES.has(scene.animation[key])
        ) {
          fail(
            `scenes[${index}].animation.${key} must be one of: fade, slide-up, scale, none`,
          );
        }
      }
    }

    if (scene.background !== undefined) {
      assertHex(scene.background, `scenes[${index}].background`);
    }

    let video;
    if (scene.video !== undefined) {
      if (typeof scene.video === "string") {
        video = { file: assertString(scene.video, `scenes[${index}].video`) };
      } else if (isRecord(scene.video)) {
        video = {
          file: assertString(scene.video.file, `scenes[${index}].video.file`),
          startFromSeconds:
            scene.video.startFromSeconds === undefined
              ? undefined
              : assertNumber(
                  scene.video.startFromSeconds,
                  `scenes[${index}].video.startFromSeconds`,
                ),
          volume:
            scene.video.volume === undefined
              ? undefined
              : assertNumber(scene.video.volume, `scenes[${index}].video.volume`),
          muted: scene.video.muted,
          fit: scene.video.fit,
        };
      } else {
        fail(`scenes[${index}].video must be a file path or an object`);
      }
    }

    return {
      id: assertString(scene.id, `scenes[${index}].id`),
      name: assertString(scene.name, `scenes[${index}].name`),
      durationInSeconds,
      image: scene.image,
      video,
      narration: scene.narration,
    };
  });

  const audio = isRecord(value.audio)
    ? {
        narration: value.audio.narration,
        music: value.audio.music,
        musicVolume:
          value.audio.musicVolume === undefined
            ? 0.15
            : assertNumber(value.audio.musicVolume, "audio.musicVolume"),
        mixed: value.audio.mixed,
        sfx: Array.isArray(value.audio.sfx)
          ? value.audio.sfx.map((cue, index) => {
              if (!isRecord(cue)) {
                fail(`audio.sfx[${index}] must be an object`);
              }

              return {
                file: assertString(cue.file, `audio.sfx[${index}].file`),
                atSeconds: assertNumber(
                  cue.atSeconds,
                  `audio.sfx[${index}].atSeconds`,
                ),
                volume:
                  cue.volume === undefined
                    ? 0.4
                    : assertNumber(cue.volume, `audio.sfx[${index}].volume`),
              };
            })
          : [],
      }
    : undefined;

  return {
    id,
    title: assertString(value.title, "title"),
    fps: assertNumber(value.fps, "fps"),
    width: assertNumber(value.width, "width"),
    height: assertNumber(value.height, "height"),
    palette: {
      background: assertHex(value.palette.background, "palette.background"),
      primary: assertHex(value.palette.primary, "palette.primary"),
      secondary: assertHex(value.palette.secondary, "palette.secondary"),
      text: assertHex(value.palette.text, "palette.text"),
    },
    audio,
    scenes,
  };
};

const publicPath = (relativePath) => join(PUBLIC_DIR, relativePath);

const specPath = (specId) => join(SPECS_DIR, `${specId}.json`);

const readSpecFile = (filePath) => {
  const spec = parseSpec(JSON.parse(readFileSync(filePath, "utf8")));
  const fileId = basename(filePath, ".json");
  if (fileId !== spec.id) {
    fail(`Spec id "${spec.id}" must match the filename "${fileId}.json"`);
  }

  return spec;
};

const loadSpecById = (specId) => readSpecFile(specPath(specId));

const listSpecIds = () =>
  readdirSync(SPECS_DIR)
    .filter(
      (name) =>
        name.endsWith(".json") &&
        name !== "schema.json" &&
        !name.startsWith("_"),
    )
    .map((name) => basename(name, ".json"));

const ensureDir = (dirPath) => {
  mkdirSync(dirPath, { recursive: true });
};

const fileExistsInPublic = (relativePath) =>
  Boolean(relativePath) && existsSync(publicPath(relativePath));

module.exports = {
  ROOT,
  PUBLIC_DIR,
  SPECS_DIR,
  ensureDir,
  fileExistsInPublic,
  listSpecIds,
  loadSpecById,
  publicPath,
  specPath,
};
