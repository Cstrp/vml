<template>
  <div
    v-if="playlist.length"
    class="absolute right-8 bottom-full z-40 inline-block w-96 backdrop-blur-xl bg-black/30 border border-white/10 rounded-t-2xl shadow-2xl shadow-black/50 !transition-all duration-500 ease-out sm:right-40 tablet:right-48 before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/15 before:via-blue-500/15 before:to-cyan-500/15 before:rounded-t-2xl before:opacity-50"
    :class="{
      '!-bottom-4 sm:!-bottom-24 tablet:!-bottom-44': !showPlaylistPopup,
    }"
  >
    <div
      ref="el"
      class="relative z-10 flex h-16 items-center justify-between gap-4 backdrop-blur-md bg-black/40 px-6 rounded-t-2xl border-b border-white/10"
    >
      <div class="space-x-2 truncate text-sm">
        <div class="text-cyan-400 font-semibold drop-shadow-lg">Next up:</div>
        <div class="animate-marquee whitespace-nowrap">
          <span class="px-2 font-medium text-white drop-shadow-md">{{
            returnNextTrack?.title || "No tracks available"
          }}</span>
        </div>
      </div>
      <div>
        <button
          type="button"
          class="group flex cursor-pointer items-center justify-center rounded-full backdrop-blur-md bg-white/10 border border-white/20 p-3 transition-all duration-300 ease-out hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          aria-label="Minimize playlist popup"
          @click="showPlaylistPopup = !showPlaylistPopup"
        >
          <svg
            v-if="showPlaylistPopup"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="size-5 text-white transition-transform duration-300 group-hover:scale-110"
          >
            <path
              fill="currentColor"
              d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="size-5 text-white transition-transform duration-300 group-hover:scale-110"
          >
            <path
              fill="currentColor"
              d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
            />
          </svg>
        </button>
      </div>
    </div>
    <ul
      class="scrollbar relative z-10 max-h-80 overflow-x-hidden overflow-y-auto backdrop-blur-sm"
    >
      <li
        v-for="track in playlist"
        :key="track.id"
        :class="{
          'sticky bottom-0 bg-gradient-to-r from-purple-500/25 to-cyan-500/25 border-l-4 border-cyan-400':
            returnTrack?.id === track.id,
        }"
      >
        <button
          class="group flex w-full cursor-pointer items-center gap-4 px-6 py-4 transition-all duration-300 ease-out hover:bg-white/10 hover:backdrop-blur-md"
          :class="{
            'bg-gradient-to-r from-purple-500/20 to-cyan-500/20':
              returnTrack?.id === track.id,
          }"
          type="button"
          :aria-label="isTrackPlaying(track.id) ? 'Pause' : 'Play'"
          :aria-pressed="isTrackPlaying(track.id) ? 'true' : 'false'"
          @click.stop.prevent="onPlayAsPlaylist(playlist, track)"
        >
          <span class="relative block">
            <img
              class="size-14 rounded-xl border border-white/20 bg-black/20 object-cover shadow-lg shadow-black/20"
              :src="track.artwork"
              :alt="track.title"
              loading="lazy"
            />
            <span
              class="absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-sm bg-black/40 opacity-0 transition-all duration-300 ease-out group-hover:opacity-100"
            >
              <span
                class="flex size-8 cursor-pointer items-center justify-center rounded-full backdrop-blur-md bg-white/20 border border-white/30 transition-all duration-300 hover:scale-110"
              >
                <svg
                  v-if="!isTrackPlaying(track.id)"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  class="size-4"
                >
                  <path fill="currentColor" d="M8 5v14l11-7z" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  class="size-4"
                >
                  <path
                    fill="currentColor"
                    d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                  />
                </svg>
              </span>
            </span>
          </span>
          <span class="block min-w-0 flex-1 text-left">
            <span
              class="block truncate text-sm font-semibold text-white drop-shadow-md"
            >
              {{ track.title }}
            </span>
            <span class="block truncate text-xs text-white/70 drop-shadow-sm">{{
              track.artist
            }}</span>
          </span>
          <span v-if="isTrackPlaying(track.id)" class="block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="size-5 text-cyan-400"
            >
              <path
                fill="currentColor"
                d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const showPlaylistPopup = ref(true);

const {
  onPlayAsPlaylist,
  isTrackPlaying,
  playlist,
  returnTrack,
  returnNextTrack,
} = useAudioPlayer({});
</script>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.animate-marquee {
  animation: marquee 6s ease-in-out infinite;
}

.scrollbar::-webkit-scrollbar-track {
  -webkit-box-shadow: var(--scroll-bar-shadow);
  background-color: var(--scroll-bar-background);
}

.scrollbar::-webkit-scrollbar {
  width: var(--scroll-bar-width);
  background-color: var(--scroll-bar-background-light);
}

.scrollbar::-webkit-scrollbar-thumb {
  -webkit-box-shadow: var(--scroll-bar-shadow);
  background-color: var(--scroll-bar-slider);
}
</style>
