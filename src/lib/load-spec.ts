import { staticFile } from "remotion";
import {
  getSpecDurationInFrames,
  parseVideoSpec,
  type VideoSpec,
} from "../schema/video-spec";

export const loadSpec = async (specPath: string): Promise<VideoSpec> => {
  const response = await fetch(staticFile(specPath));
  if (!response.ok) {
    throw new Error(`Could not load spec at ${specPath}`);
  }

  return parseVideoSpec(await response.json());
};

export const specDurationInFrames = (spec: VideoSpec): number =>
  getSpecDurationInFrames(spec);
