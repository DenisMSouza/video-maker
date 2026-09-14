import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  getStaticFiles,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getKenBurnsScale, getSceneMotion } from "../lib/animations";
import type { SceneSpec, VideoSpec } from "../schema/video-spec";

const FONT_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

const hasPublicFile = (path: string | undefined): path is string => {
  if (!path) {
    return false;
  }

  return getStaticFiles().some((file) => file.name === path.replace(/^\//, ""));
};

type SceneProps = {
  scene: SceneSpec;
  spec: VideoSpec;
  index: number;
  durationInFrames: number;
};

export const Scene = ({ scene, spec, index, durationInFrames }: SceneProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = scene.animation?.enter ?? "fade";
  const exit = scene.animation?.exit ?? "fade";
  const motion = getSceneMotion({
    frame,
    fps,
    durationInFrames,
    enter,
    exit,
  });
  const background = scene.background ?? spec.palette.background;
  const video = scene.video;
  const videoPath = hasPublicFile(video?.file) ? video.file : undefined;
  const imagePath =
    !videoPath && hasPublicFile(scene.image) ? scene.image : undefined;
  const hasMedia = Boolean(videoPath || imagePath);
  const kenBurns = getKenBurnsScale(
    frame,
    durationInFrames,
    Boolean(scene.animation?.kenBurns && imagePath),
  );
  const numberLabel = String(index + 1).padStart(2, "0");
  const overlayOpacity = interpolate(frame, [0, fps * 0.4], [0.2, 0.42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const trimBefore = Math.round((video?.startFromSeconds ?? 0) * fps);
  const objectFit = video?.fit ?? "cover";

  return (
    <AbsoluteFill style={{ backgroundColor: background, overflow: "hidden" }}>
      {hasMedia ? null : (
        <>
          <div
            style={{
              position: "absolute",
              width: 720,
              height: 720,
              right: -180,
              top: -220,
              borderRadius: "50%",
              background: spec.palette.primary,
              opacity: 0.12,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 520,
              height: 520,
              left: -160,
              bottom: -180,
              borderRadius: "50%",
              background: spec.palette.secondary,
              opacity: 0.14,
            }}
          />
        </>
      )}
      {videoPath ? (
        <OffthreadVideo
          src={staticFile(videoPath)}
          muted={video?.muted ?? false}
          trimBefore={trimBefore > 0 ? trimBefore : undefined}
          volume={() => video?.volume ?? 1}
          style={{
            width: "100%",
            height: "100%",
            objectFit,
          }}
        />
      ) : null}
      {imagePath ? (
        <Img
          src={staticFile(imagePath)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${kenBurns})`,
          }}
        />
      ) : null}
      {hasMedia ? (
        <AbsoluteFill
          style={{
            background: `linear-gradient(to top, rgba(2, 6, 23, ${0.55 + overlayOpacity * 0.35}) 0%, rgba(2, 6, 23, ${overlayOpacity}) 42%, rgba(2, 6, 23, 0.08) 100%)`,
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          padding: "96px 120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: motion.opacity,
          transform: `translateY(${motion.translateY}px) scale(${motion.scale})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              fontFamily: FONT_STACK,
              fontSize: 28,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: spec.palette.primary,
              fontWeight: 700,
            }}
          >
            {numberLabel}
          </div>
          <div
            style={{
              width: 72,
              height: 4,
              backgroundColor: spec.palette.primary,
              borderRadius: 999,
            }}
          />
          <div
            style={{
              fontFamily: FONT_STACK,
              fontSize: 28,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: spec.palette.muted ?? spec.palette.text,
              opacity: 0.72,
            }}
          >
            {scene.name}
          </div>
        </div>
        <div>
          {scene.title ? (
            <h1
              style={{
                fontFamily: FONT_STACK,
                fontSize: 88,
                lineHeight: 1.05,
                margin: 0,
                maxWidth: 1400,
                color: spec.palette.text,
                fontWeight: 700,
              }}
            >
              {scene.title}
            </h1>
          ) : null}
          {scene.subtitle ? (
            <p
              style={{
                fontFamily: FONT_STACK,
                fontSize: 36,
                lineHeight: 1.35,
                margin: "28px 0 0",
                maxWidth: 1100,
                color: spec.palette.muted ?? spec.palette.text,
                opacity: 0.88,
              }}
            >
              {scene.subtitle}
            </p>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
