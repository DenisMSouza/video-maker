import type { CalculateMetadataFunction } from "remotion";
import { AbsoluteFill, Series } from "remotion";
import { AudioBed } from "../components/AudioBed";
import { Scene } from "../components/Scene";
import { loadSpec, specDurationInFrames } from "../lib/load-spec";
import type { VideoSpec } from "../schema/video-spec";

export type VideoFromSpecProps = {
  specPath: string;
  spec: VideoSpec | null;
};

export const calculateSpecMetadata: CalculateMetadataFunction<
  VideoFromSpecProps
> = async ({ props }) => {
  const spec = await loadSpec(props.specPath);

  return {
    fps: spec.fps,
    width: spec.width,
    height: spec.height,
    durationInFrames: specDurationInFrames(spec),
    props: {
      ...props,
      spec,
    },
  };
};

export const VideoFromSpec = ({ spec }: VideoFromSpecProps) => {
  if (!spec) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#020617",
          color: "#F8FAFC",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: 42,
        }}
      >
        Spec não carregada
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: spec.palette.background }}>
      <AudioBed spec={spec} />
      <Series>
        {spec.scenes.map((scene, index) => {
          const durationInFrames = Math.round(
            scene.durationInSeconds * spec.fps,
          );

          return (
            <Series.Sequence
              key={scene.id}
              durationInFrames={durationInFrames}
              name={scene.name}
            >
              <Scene
                scene={scene}
                spec={spec}
                index={index}
                durationInFrames={durationInFrames}
              />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
