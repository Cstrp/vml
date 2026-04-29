import { Video } from "./compositions/Video";
import { Composition } from "remotion";

export const Root = () => (
  <>
    <Composition
      id="video"
      component={Video}
      defaultProps={{
        title:
          "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tenetur nulla, aspernatur fugit dolor eaque laborum sint, magni distinctio impedit maxime amet dicta rerum optio facilis. Obcaecati ad a cupiditate porro?",
      }}
      durationInFrames={150}
      fps={60}
      width={1920}
      height={1080}
    />
  </>
);
