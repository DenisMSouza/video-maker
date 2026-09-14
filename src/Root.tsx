import "./index.css";
import { Composition, Folder, getStaticFiles } from "remotion";
import {
  VideoFromSpec,
  calculateSpecMetadata,
} from "./compositions/VideoFromSpec";

const specFiles = () =>
  getStaticFiles().filter((file) => {
    const name = file.name.replace(/\\/g, "/");
    const fileName = name.split("/").pop() ?? "";

    return (
      name.startsWith("specs/") &&
      name.endsWith(".json") &&
      !fileName.startsWith("_") &&
      fileName !== "schema.json"
    );
  });

export const RemotionRoot = () => {
  const specs = specFiles();

  return (
    <Folder name="GrokBot">
      {specs.map((file) => {
        const specId = file.name
          .replace(/\\/g, "/")
          .replace("specs/", "")
          .replace(/\.json$/, "");

        return (
          <Composition
            key={specId}
            id={specId}
            component={VideoFromSpec}
            durationInFrames={300}
            fps={30}
            width={1920}
            height={1080}
            defaultProps={{
              specPath: file.name.replace(/\\/g, "/"),
              spec: null,
            }}
            calculateMetadata={calculateSpecMetadata}
          />
        );
      })}
    </Folder>
  );
};
