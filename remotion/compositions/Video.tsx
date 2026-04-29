import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { FC } from "react";

type VideoProps = {
  title: string;
};

export const Video: FC<VideoProps> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = Math.min(1, frame / fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "#fff",
          fontSize: 80,
          fontFamily: "sans-serif",
          opacity,
        }}
      >
        {title}
      </h1>
    </AbsoluteFill>
  );
};
