import { interpolate, spring } from "remotion";
import type { AnimationName } from "../schema/video-spec";

type MotionInput = {
  frame: number;
  fps: number;
  durationInFrames: number;
  enter: AnimationName;
  exit: AnimationName;
};

export type SceneMotion = {
  opacity: number;
  translateY: number;
  scale: number;
};

export const getSceneMotion = ({
  frame,
  fps,
  durationInFrames,
  enter,
  exit,
}: MotionInput): SceneMotion => {
  const enterFrames = Math.max(1, Math.round(fps * 0.45));
  const exitFrames = Math.max(1, Math.round(fps * 0.3));

  const enterProgress = spring({
    frame,
    fps,
    durationInFrames: enterFrames,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const exitProgress = interpolate(
    frame,
    [durationInFrames - exitFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const enterOpacity = enter === "none" ? 1 : enterProgress;
  const exitOpacity = exit === "none" ? 1 : exitProgress;
  const slide = enter === "slide-up" ? interpolate(enterProgress, [0, 1], [48, 0]) : 0;
  const scale = enter === "scale" ? interpolate(enterProgress, [0, 1], [0.92, 1]) : 1;

  return {
    opacity: enterOpacity * exitOpacity,
    translateY: slide,
    scale,
  };
};

export const getKenBurnsScale = (
  frame: number,
  durationInFrames: number,
  enabled: boolean,
): number => {
  if (!enabled) {
    return 1;
  }

  return interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};
