<template>
  <div class="relative inline-block">
    <button
      v-wave
      type="button"
      class="group flex size-8 cursor-pointer items-center justify-center backdrop-blur-sm p-1 text-white transition-all duration-200 ease-out hover:bg-white/10 hover:scale-105"
      :aria-expanded="showVolume"
      aria-controls="volume-slider"
      aria-label="Toggle Volume Control"
      @click="handleClick"
    >
      <span
        class="size-full transition-transform duration-200 group-hover:scale-110"
        v-html="returnVolumeIcon"
      />
    </button>
    <div
      ref="el-volume-dropdown"
      class="absolute bottom-[2.5rem] left-0 w-8 h-36 backdrop-blur-sm border border-white/5 rounded shadow-md shadow-black/20 transition-all duration-200 ease-out before:absolute before:inset-0 before:bg-gradient-to-t before:from-purple-400/5 before:to-cyan-400/5 before:rounded-t-lg before:opacity-30"
      :class="{
        'opacity-100 scale-100': showVolume,
        'opacity-0 scale-95 pointer-events-none': !showVolume,
      }"
    >
      <div
        class="group relative -bottom-17 -left-[3rem] h-1.5 w-32 -rotate-90 bg-gray-700 rounded"
      >
        <input
          id="volume-slider"
          v-model.number="volume"
          type="range"
          :min="0"
          :max="100"
          class="absolute -top-1 left-0 h-4 w-full cursor-pointer opacity-0"
          :aria-valuenow="volume"
          :aria-valuemin="0"
          :aria-valuemax="100"
          aria-label="Volume Slider"
        />
        <div
          class="pointer-events-none absolute inset-0 z-10 flex items-center"
        >
          <div
            class="absolute h-1.5 rounded-full bg-gray-400/30"
            :style="{ width: `${volume}%` }"
            aria-hidden="true"
          />
          <div
            class="relative size-5 rounded-full bg-black/70 p-0.5 group-focus-within:ring-1 ring-white/30"
            :style="{ left: `calc(${volume}% - 0.625rem)` }"
            :aria-label="`Volume: ${volume}%`"
            :aria-valuemin="1"
            :aria-valuemax="100"
            :aria-valuenow="volume"
            aria-controls="volume-slider"
            role="slider"
          >
            <span class="rotate-90 text-white" v-html="returnVolumeIcon" />
            <div
              class="text-white absolute top-0 right-[calc(100%+0.25rem)] rounded border border-gray-600 bg-gray-800 px-1 py-0.5 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            >
              {{ volume }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, useLocalStorage } from "@vueuse/core";

const volume = useLocalStorage("player:volume", 60);

const showVolume = ref<boolean>(false);

const elVolumeDropdown = useTemplateRef<HTMLElement>("el-volume-dropdown");

onClickOutside(elVolumeDropdown, () => {
  showVolume.value = false;
});

const handleClick = () => {
  showVolume.value = !showVolume.value;
};

const returnVolumeIcon = computed(() => {
  if (volume.value <= 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m19.1 21.9l-2.325-2.325q-.35.2-.7.387q-.35.188-.725.338q-.5.2-.925-.125q-.425-.325-.425-.9q0-.275.163-.487q.162-.213.412-.313q.2-.075.388-.163q.187-.087.362-.187L12 14.8v2.775q0 .675-.613.937q-.612.263-1.087-.212L7 15H4q-.425 0-.712-.288Q3 14.425 3 14v-4q0-.425.288-.713Q3.575 9 4 9h2.2L2.1 4.9q-.275-.275-.275-.7q0-.425.275-.7q.275-.275.7-.275q.425 0 .7.275l17 17q.275.275.275.7q0 .425-.275.7q-.275.275-.7.275q-.425 0-.7-.275ZM15.35 3.65q2.55 1.025 4.1 3.275Q21 9.175 21 11.975q0 1.325-.362 2.55q-.363 1.225-1.038 2.275l-1.45-1.45q.425-.775.638-1.625q.212-.85.212-1.75q0-2.2-1.212-3.95q-1.213-1.75-3.213-2.55q-.275-.1-.425-.325q-.15-.225-.15-.5q0-.55.425-.875q.425-.325.925-.125Zm.9 9.8L14 11.2V7.95q1.175.55 1.838 1.65q.662 1.1.662 2.4q0 .375-.062.738q-.063.362-.188.712ZM12 9.2L9.4 6.6l.9-.9q.475-.475 1.087-.213q.613.263.613.938Z"/></svg>';
  } else if (volume.value <= 25) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M8 15q-.425 0-.713-.288Q7 14.425 7 14v-4q0-.425.287-.713Q7.575 9 8 9h3l3.3-3.3q.475-.475 1.087-.213q.613.263.613.938v11.15q0 .675-.613.937q-.612.263-1.087-.212L11 15Z"/></svg>';
  } else if (volume.value <= 75) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6 15q-.425 0-.713-.288Q5 14.425 5 14v-4q0-.425.287-.713Q5.575 9 6 9h3l3.3-3.3q.475-.475 1.087-.213q.613.263.613.938v11.15q0 .675-.613.937q-.612.263-1.087-.212L9 15Zm10 1V7.95q1.125.525 1.812 1.625q.688 1.1.688 2.425q0 1.325-.688 2.4Q17.125 15.475 16 16Z"/></svg>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.35 20.3q-.5.2-.925-.125q-.425-.325-.425-.9q0-.275.163-.487q.162-.213.412-.313q2-.8 3.213-2.55Q19 14.175 19 11.975t-1.212-3.95q-1.213-1.75-3.213-2.55q-.275-.1-.425-.325q-.15-.225-.15-.5q0-.55.425-.875q.425-.325.925-.125q2.55 1.025 4.1 3.275Q21 9.175 21 11.975t-1.55 5.05q-1.55 2.25-4.1 3.275ZM4 15q-.425 0-.712-.288Q3 14.425 3 14v-4q0-.425.288-.713Q3.575 9 4 9h3l3.3-3.3q.475-.475 1.087-.213q.613.263.613.938v11.15q0 .675-.613.937q-.612.263-1.087-.212L7 15Zm10 1V7.95q1.125.525 1.812 1.625q.688 1.1.688 2.425q0 1.325-.688 2.4Q15.125 15.475 14 16Z"/></svg>';
});
</script>

