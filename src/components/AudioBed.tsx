import { Html5Audio, Sequence, getStaticFiles, staticFile } from "remotion";
import type { VideoSpec } from "../schema/video-spec";

const hasPublicFile = (path: string | undefined): path is string => {
  if (!path) {
    return false;
  }

  return getStaticFiles().some((file) => file.name === path.replace(/^\//, ""));
};

export const AudioBed = ({ spec }: { spec: VideoSpec }) => {
  const audio = spec.audio;
  if (!audio) {
    return null;
  }

  if (hasPublicFile(audio.mixed)) {
    return <Html5Audio src={staticFile(audio.mixed)} />;
  }

  return (
    <>
      {hasPublicFile(audio.narration) ? (
        <Html5Audio src={staticFile(audio.narration)} />
      ) : null}
      {hasPublicFile(audio.music) ? (
        <Html5Audio
          src={staticFile(audio.music)}
          volume={() => audio.musicVolume ?? 0.15}
          loop
        />
      ) : null}
      {audio.sfx?.map((cue, index) =>
        hasPublicFile(cue.file) ? (
          <Sequence
            key={`${cue.file}-${index}`}
            from={Math.round(cue.atSeconds * spec.fps)}
            layout="none"
          >
            <Html5Audio
              src={staticFile(cue.file)}
              volume={() => cue.volume ?? 0.4}
            />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
