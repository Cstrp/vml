export type PexelsVideoFile = {
  id: number;
  quality: "uhd" | "hd" | "sd" | "hlsStream";
  file_type: string;
  width: number;
  height: number;
  fps?: number;
  link: string;
};

export type PexelsVideo = {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string;
  video_files: PexelsVideoFile[];
};

export type PexelsSearchOptions = {
  minDuration?: number;
  perPage?: number;
  page?: number;
  orientation?: "landscape" | "portrait" | "square";
  size?: "large" | "medium" | "small";
};
