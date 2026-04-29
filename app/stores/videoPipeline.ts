export const useVideoPipelineStore = defineStore("videoPipeline", () => {
  const step = ref(1);
  const text = ref("");

  const searchQuery = ref("");
  const searchResults = ref<PexelsVideo[]>([]);
  const searchPending = ref(false);
  const searchError = ref<string | undefined>(undefined);
  const selectedVideo = ref<PexelsVideo | undefined>(undefined);

  const selectedVoice = ref("af_heart");

  const pending = ref(false);
  const genError = ref<string | undefined>(undefined);
  const result = ref<PipelineResult | undefined>(undefined);

  const selectedVideoInfo = computed(() => {
    const v = selectedVideo.value;
    if (!v) return "No video selected";
    return `${v.duration}s · ${v.width}×${v.height}`;
  });

  const getBestVideoUrl = (video: PexelsVideo): string => {
    const mp4 = video.video_files.filter((f) => f.file_type === "video/mp4");
    const best =
      mp4.find((f) => f.quality === "hd") ??
      mp4.find((f) => f.quality === "sd") ??
      mp4[0];
    return best ? best.link : "";
  };

  const search = async () => {
    if (!searchQuery.value.trim()) return;
    searchPending.value = true;
    searchError.value = undefined;
    try {
      searchResults.value = await $fetch<PexelsVideo[]>("/api/videos/search", {
        query: { query: searchQuery.value, perPage: 9 },
      });
    } catch (e) {
      searchError.value = parseError(e, "Search failed");
    } finally {
      searchPending.value = false;
    }
  };

  const generate = async () => {
    if (!selectedVideo.value) return;
    pending.value = true;
    genError.value = undefined;
    result.value = undefined;
    try {
      result.value = await $fetch<PipelineResult>("/api/generate/pipeline", {
        method: "POST",
        body: {
          text: text.value,
          videoUrl: getBestVideoUrl(selectedVideo.value),
          voice: selectedVoice.value,
        } as PipelineRequest,
      });
    } catch (e) {
      genError.value = parseError(e, "Generation failed");
    } finally {
      pending.value = false;
    }
  };

  const reset = () => {
    step.value = 1;
    text.value = "";
    searchQuery.value = "";
    searchResults.value = [];
    selectedVideo.value = undefined;
    selectedVoice.value = "af_heart";
    result.value = undefined;
    genError.value = undefined;
  };

  return {
    step,
    text,
    searchQuery,
    searchResults,
    searchPending,
    searchError,
    selectedVideo,
    selectedVoice,
    pending,
    genError,
    result,
    selectedVideoInfo,
    search,
    generate,
    reset,
  };
});
