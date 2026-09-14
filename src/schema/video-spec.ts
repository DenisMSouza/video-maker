export const ANIMATION_NAMES = ["fade", "slide-up", "scale", "none"] as const;

export type AnimationName = (typeof ANIMATION_NAMES)[number];

export type SfxCue = {
  file: string;
  atSeconds: number;
  volume?: number;
};

export const VIDEO_FIT_NAMES = ["cover", "contain"] as const;

export type VideoFit = (typeof VIDEO_FIT_NAMES)[number];

export type SceneVideo = {
  file: string;
  startFromSeconds?: number;
  volume?: number;
  muted?: boolean;
  fit?: VideoFit;
};

export type SceneSpec = {
  id: string;
  name: string;
  durationInSeconds: number;
  narration?: string;
  visual?: string;
  image?: string;
  video?: SceneVideo;
  title?: string;
  subtitle?: string;
  background?: string;
  animation?: {
    enter?: AnimationName;
    exit?: AnimationName;
    kenBurns?: boolean;
  };
};

export type VideoSpec = {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  durationInSeconds?: number;
  palette: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
    muted?: string;
  };
  audio?: {
    narration?: string;
    music?: string;
    musicVolume?: number;
    mixed?: string;
    sfx?: SfxCue[];
  };
  scenes: SceneSpec[];
};

const ID_PATTERN = /^[a-zA-Z0-9-]+$/;
const HEX_PATTERN = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const assertString = (value: unknown, path: string): string => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${path} must be a non-empty string`);
  }

  return value;
};

const assertNumber = (value: unknown, path: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${path} must be a finite number`);
  }

  return value;
};

const assertHex = (value: unknown, path: string): string => {
  const color = assertString(value, path);
  if (!HEX_PATTERN.test(color)) {
    throw new Error(`${path} must be a hex color like #0F172A`);
  }

  return color;
};

const parseAnimationName = (
  value: unknown,
  path: string,
): AnimationName | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value !== "string" ||
    !ANIMATION_NAMES.includes(value as AnimationName)
  ) {
    throw new Error(`${path} must be one of: ${ANIMATION_NAMES.join(", ")}`);
  }

  return value as AnimationName;
};

const parseVideoFit = (value: unknown, path: string): VideoFit | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !VIDEO_FIT_NAMES.includes(value as VideoFit)) {
    throw new Error(`${path} must be one of: ${VIDEO_FIT_NAMES.join(", ")}`);
  }

  return value as VideoFit;
};

const parseSceneVideo = (value: unknown, path: string): SceneVideo | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    return { file: assertString(value, path) };
  }

  if (!isRecord(value)) {
    throw new Error(`${path} must be a file path or an object`);
  }

  const muted =
    value.muted === undefined ? undefined : Boolean(value.muted);

  return {
    file: assertString(value.file, `${path}.file`),
    startFromSeconds:
      value.startFromSeconds === undefined
        ? undefined
        : assertNumber(value.startFromSeconds, `${path}.startFromSeconds`),
    volume:
      value.volume === undefined
        ? undefined
        : assertNumber(value.volume, `${path}.volume`),
    muted,
    fit: parseVideoFit(value.fit, `${path}.fit`),
  };
};

const parseScene = (value: unknown, index: number): SceneSpec => {
  if (!isRecord(value)) {
    throw new Error(`scenes[${index}] must be an object`);
  }

  const durationInSeconds = assertNumber(
    value.durationInSeconds,
    `scenes[${index}].durationInSeconds`,
  );
  if (durationInSeconds <= 0) {
    throw new Error(`scenes[${index}].durationInSeconds must be greater than 0`);
  }

  const animation = isRecord(value.animation)
    ? {
        enter: parseAnimationName(
          value.animation.enter,
          `scenes[${index}].animation.enter`,
        ),
        exit: parseAnimationName(
          value.animation.exit,
          `scenes[${index}].animation.exit`,
        ),
        kenBurns:
          value.animation.kenBurns === undefined
            ? undefined
            : Boolean(value.animation.kenBurns),
      }
    : undefined;

  return {
    id: assertString(value.id, `scenes[${index}].id`),
    name: assertString(value.name, `scenes[${index}].name`),
    durationInSeconds,
    narration:
      value.narration === undefined
        ? undefined
        : assertString(value.narration, `scenes[${index}].narration`),
    visual:
      value.visual === undefined
        ? undefined
        : assertString(value.visual, `scenes[${index}].visual`),
    image:
      value.image === undefined
        ? undefined
        : assertString(value.image, `scenes[${index}].image`),
    video: parseSceneVideo(value.video, `scenes[${index}].video`),
    title:
      value.title === undefined
        ? undefined
        : assertString(value.title, `scenes[${index}].title`),
    subtitle:
      value.subtitle === undefined
        ? undefined
        : assertString(value.subtitle, `scenes[${index}].subtitle`),
    background:
      value.background === undefined
        ? undefined
        : assertHex(value.background, `scenes[${index}].background`),
    animation,
  };
};

export const parseVideoSpec = (value: unknown): VideoSpec => {
  if (!isRecord(value)) {
    throw new Error("Video spec must be a JSON object");
  }

  const id = assertString(value.id, "id");
  if (!ID_PATTERN.test(id)) {
    throw new Error("id must contain only letters, numbers and hyphens");
  }

  const fps = assertNumber(value.fps, "fps");
  if (fps <= 0) {
    throw new Error("fps must be greater than 0");
  }

  const width = assertNumber(value.width, "width");
  const height = assertNumber(value.height, "height");
  if (width < 16 || height < 16) {
    throw new Error("width and height must be at least 16px");
  }

  if (!isRecord(value.palette)) {
    throw new Error("palette must be an object");
  }

  if (!Array.isArray(value.scenes) || value.scenes.length === 0) {
    throw new Error("scenes must be a non-empty array");
  }

  const scenes = value.scenes.map(parseScene);
  const audio = isRecord(value.audio)
    ? {
        narration:
          value.audio.narration === undefined
            ? undefined
            : assertString(value.audio.narration, "audio.narration"),
        music:
          value.audio.music === undefined
            ? undefined
            : assertString(value.audio.music, "audio.music"),
        musicVolume:
          value.audio.musicVolume === undefined
            ? undefined
            : assertNumber(value.audio.musicVolume, "audio.musicVolume"),
        mixed:
          value.audio.mixed === undefined
            ? undefined
            : assertString(value.audio.mixed, "audio.mixed"),
        sfx: Array.isArray(value.audio.sfx)
          ? value.audio.sfx.map((cue, index) => {
              if (!isRecord(cue)) {
                throw new Error(`audio.sfx[${index}] must be an object`);
              }

              return {
                file: assertString(cue.file, `audio.sfx[${index}].file`),
                atSeconds: assertNumber(
                  cue.atSeconds,
                  `audio.sfx[${index}].atSeconds`,
                ),
                volume:
                  cue.volume === undefined
                    ? undefined
                    : assertNumber(cue.volume, `audio.sfx[${index}].volume`),
              };
            })
          : undefined,
      }
    : undefined;

  return {
    id,
    title: assertString(value.title, "title"),
    fps,
    width,
    height,
    durationInSeconds:
      value.durationInSeconds === undefined
        ? undefined
        : assertNumber(value.durationInSeconds, "durationInSeconds"),
    palette: {
      background: assertHex(value.palette.background, "palette.background"),
      primary: assertHex(value.palette.primary, "palette.primary"),
      secondary: assertHex(value.palette.secondary, "palette.secondary"),
      text: assertHex(value.palette.text, "palette.text"),
      muted:
        value.palette.muted === undefined
          ? undefined
          : assertHex(value.palette.muted, "palette.muted"),
    },
    audio,
    scenes,
  };
};

export const getSpecDurationInSeconds = (spec: VideoSpec): number =>
  spec.scenes.reduce((total, scene) => total + scene.durationInSeconds, 0);

export const getSpecDurationInFrames = (spec: VideoSpec): number =>
  spec.scenes.reduce(
    (total, scene) => total + Math.round(scene.durationInSeconds * spec.fps),
    0,
  );
