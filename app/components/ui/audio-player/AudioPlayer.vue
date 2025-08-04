<script setup lang="ts">
import {
  MessageCircleXIcon,
  PauseIcon,
  PlayIcon,
  Repeat1Icon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-vue-next";
import { onUnmounted, computed } from "vue";

const emit = defineEmits(["close"]);

const props = defineProps<{
  options?: TOptions;
  grid?: string;
  hidePlaylistPopup?: boolean;
}>();

const returnGrid = computed(() => {
  return (
    props.grid ||
    `[grid-template-areas:'image_metadata_metadata_metadata'_'currentDuration_waveform_waveform_endDuration'_'controls_controls_volume_actions'] grid-cols-[auto_minmax(0,1fr)_auto_auto] phone:[grid-template-areas:'image_metadata_controls_volume_actions'_'currentDuration_waveform_waveform_waveform_endDuration'] phone:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] tablet:[grid-template-areas:'image_metadata_controls_currentDuration_waveform_endDuration_volume_actions'] tablet:grid-cols-[auto_auto_auto_minmax(0,3rem)_minmax(0,1fr)_minmax(0,3rem)_auto_auto]`
  );
});

const {
  wavesurferElement,
  initializing,
  isPlaying,
  audioSource,
  togglePlayback,
  onClose,
  destroy,
  formattedCurrentDuration,
  formattedDuration,
  returnTrack,
  onPlayNextTrack,
  onPlayPreviousTrack,
  playlist,
} = useAudioPlayer(props.options!);

const { onToggleRepeat, onToggleShuffle, playlistOptions, shuffle } =
  useAudioPlayerList();

onUnmounted(() => {
  destroy();
});

const onClosePlayer = () => {
  emit("close");
  onClose();
  logger.debug("onClosePlayer");
};
</script>

<template>
  <div
    class="fixed right-0 bottom-0 left-0 z-40 text-white"
    :class="{
      'pointer-events-none opacity-0': !audioSource,
      'opacity-100 transition-all duration-700 ease-out': audioSource,
    }"
  >
    <div
      class="relative z-50 grid min-h-auto p-4 min-w-72 items-center gap-x-4 backdrop-blur-xl bg-black/20 border-t border-white/10 px-6 whitespace-nowrap text-white shadow-2xl shadow-black/50 phone:h-40 tablet:h-20 tablet:gap-x-6 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:via-blue-500/10 before:to-cyan-500/10 before:opacity-50"
      :class="[returnGrid]"
    >
      <PlayerPlaylist
        v-if="!props.hidePlaylistPopup"
        :class="{
          'pointer-events-none opacity-0': !audioSource,
          'opacity-100 duration-700 ease-out': audioSource,
        }"
      />

      <div
        :style="{
          gridArea: 'image',
        }"
      >
        <slot name="image" v-bind="{ track: returnTrack }">
          <div v-if="returnTrack?.artwork" class="relative p-2">
            <div
              class="absolute inset-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-sm"
            />
            <NuxtImg
              :key="returnTrack?.artwork"
              class="relative size-16 rounded-xl border border-white/20 bg-black/20 object-cover shadow-lg shadow-black/30 backdrop-blur-sm"
              :src="returnTrack?.artwork"
              loading="lazy"
            />
          </div>
        </slot>
      </div>

      <div
        class="tablet:w-80 tablet:max-w-[initial]"
        :style="{
          gridArea: 'metadata',
        }"
      >
        <slot name="metadata" v-bind="{ track: returnTrack }">
          <div class="relative z-10">
            <h3
              class="truncate font-semibold text-lg text-white drop-shadow-lg"
            >
              {{ returnTrack?.title }}
            </h3>
            <h4 class="truncate text-sm text-white/70 drop-shadow-md">
              {{ returnTrack?.artist }}
            </h4>
          </div>
        </slot>
      </div>

      <div
        :style="{
          gridArea: 'volume',
        }"
        class="relative z-100"
      >
        <slot name="volume">
          <PlayerVolume class="absolute" />
        </slot>
      </div>

      <div
        :style="{
          gridArea: 'actions',
        }"
        class="flex items-center gap-x-2 tablet:gap-x-4"
      >
        <slot name="actions" v-bind="{ track: returnTrack }" />
        <slot name="close" v-bind="{ onClosePlayer }">
          <Button
            size="icon"
            variant="ghost"
            type="button"
            class="group flex size-10 cursor-pointer items-center justify-center rounded-full backdrop-blur-md bg-white/10 border border-white/20 p-2 transition-all duration-300 ease-out hover:bg-red-500/20 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 active:scale-95"
            aria-label="Close player"
            @click.stop.prevent="onClosePlayer"
          >
            <MessageCircleXIcon />
          </Button>
        </slot>
      </div>

      <div
        class="relative z-10 text-center text-sm font-medium text-white/80 drop-shadow-md"
        :style="{
          gridArea: 'currentDuration',
        }"
      >
        <slot
          name="currentDuration"
          v-bind="{ currentDuration: formattedCurrentDuration }"
        >
          {{ formattedCurrentDuration }}
        </slot>
      </div>

      <div
        :style="{ gridArea: 'waveform' }"
        class="relative z-10 min-w-0 flex-1 my-2"
      >
        <slot name="waveform" v-bind="{ initializing }">
          <div
            class="relative rounded px-2 backdrop-blur-sm bg-white/10 border border-white/20 p-1 shadow-inner"
          >
            <div
              ref="wavesurferElement"
              class="w-full rounded-full overflow-hidden"
            />
          </div>
          <div
            v-if="initializing"
            class="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 rounded-full text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="size-6 text-white"
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
          </div>
        </slot>
      </div>

      <div
        class="relative z-10 text-center text-sm font-medium text-white/80 drop-shadow-md"
        :style="{
          gridArea: 'endDuration',
        }"
      >
        <slot name="endDuration" v-bind="{ endDuration: formattedDuration }">
          {{ formattedDuration }}
        </slot>
      </div>

      <div
        class="relative z-10 flex items-center gap-2"
        :style="{ gridArea: 'controls' }"
      >
        <slot
          name="controls"
          v-bind="{
            togglePlayback,
            isPlaying,
            playlist,
            onPlayPreviousTrack,
            onPlayNextTrack,
            onToggleRepeat,
            playlistOptions,
          }"
        >
          <Button
            v-if="playlist.length"
            size="icon"
            variant="ghost"
            class="group flex size-10 cursor-pointer items-center justify-center rounded-full backdrop-blur-md bg-white/10 border border-white/20 p-2 transition-all duration-300 ease-out hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
            :class="{
              'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 shadow-lg shadow-purple-500/25':
                shuffle,
            }"
            type="button"
            aria-label="Toggle shuffle"
            @click="onToggleShuffle"
          >
            <ShuffleIcon />
          </Button>

          <Button
            v-if="playlist.length"
            size="icon"
            variant="ghost"
            class="group flex size-10 cursor-pointer items-center justify-center rounded-full backdrop-blur-md bg-white/10 border border-white/20 p-2 transition-all duration-300 ease-out hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
            type="button"
            aria-label="Play previous track"
            @click="onPlayPreviousTrack"
          >
            <SkipBackIcon />
          </Button>

          <Button
            v-if="playlist.length"
            size="icon"
            variant="ghost"
            class="group flex size-14 cursor-pointer items-center justify-center rounded-full backdrop-blur-md bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-white/30 p-3 transition-all duration-300 ease-out hover:from-orange-500/30 hover:to-red-500/30 hover:scale-110 hover:shadow-xl hover:shadow-orange-500/30 active:scale-95"
            type="button"
            :aria-label="isPlaying ? 'Pause' : 'Play'"
            :aria-pressed="isPlaying ? 'true' : 'false'"
            @click.stop.prevent="togglePlayback"
          >
            <PauseIcon v-if="isPlaying" />
            <PlayIcon v-else />
          </Button>

          <Button
            v-if="playlist.length"
            size="icon"
            variant="ghost"
            class="group flex size-10 cursor-pointer items-center justify-center rounded-full backdrop-blur-md bg-white/10 border border-white/20 p-2 transition-all duration-300 ease-out hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
            type="button"
            aria-label="Play next track"
            @click="onPlayNextTrack"
          >
            <SkipForwardIcon />
          </Button>

          <Button
            v-if="playlist.length"
            size="icon"
            variant="ghost"
            class="group flex size-10 cursor-pointer items-center justify-center rounded-full backdrop-blur-md bg-white/10 border border-white/20 p-2 transition-all duration-300 ease-out hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
            :class="{
              'bg-gradient-to-r from-green-500/30 to-emerald-500/30 shadow-lg shadow-green-500/25':
                ['all', 'single'].includes(playlistOptions.repeat),
            }"
            type="button"
            aria-label="Toggle repeat"
            @click="onToggleRepeat"
          >
            <Repeat1Icon />
          </Button>
        </slot>
      </div>
    </div>
  </div>
</template>
