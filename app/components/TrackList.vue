<script setup lang="ts">
import { PlayIcon } from "lucide-vue-next";

defineProps<{ tracks: TPlayerTrack[] }>();

const { onPlayAsPlaylist: _onPlayAsPlaylist } = useAudioPlayer({});
</script>

<template>
  <ScrollArea v-if="tracks.length > 0" class="mt-8 h-60 space-y-4">
    <h3 class="text-lg font-semibold">Generated Audio</h3>
    <div class="grid gap-4">
      <div
        v-for="track in tracks"
        :key="track.id"
        class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div
          class="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"
            />
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium truncate">{{ track.title }}</h4>
          <p class="text-sm text-gray-500 truncate">{{ track.artist }}</p>
        </div>

        <Button
          size="sm"
          variant="outline"
          @click="() => _onPlayAsPlaylist([track], track)"
        >
          <PlayIcon class="w-4 h-4 mr-1" />
          Play
        </Button>
      </div>
    </div>
  </ScrollArea>

  <AudioPlayer
    hide-playlist-popup
    :options="{ autoplay: false, autoCenter: true, normalize: true }"
  />
</template>
