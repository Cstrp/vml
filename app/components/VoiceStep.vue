<script setup lang="ts">
const VOICE_GROUPS = [
  {
    label: "American Female",
    voices: [
      "af_heart",
      "af_alloy",
      "af_bella",
      "af_jessica",
      "af_nicole",
      "af_nova",
      "af_river",
      "af_sarah",
      "af_sky",
    ],
  },
  {
    label: "American Male",
    voices: ["am_adam", "am_echo", "am_eric", "am_liam", "am_michael"],
  },
  { label: "British Female", voices: ["bf_emma", "bf_isabella"] },
  { label: "British Male", voices: ["bm_george", "bm_lewis"] },
];

const store = useVideoPipelineStore();
const { selectedVoice } = storeToRefs(store);
</script>

<template>
  <div class="voice-step">
    <div v-for="group in VOICE_GROUPS" :key="group.label" class="voice-group">
      <p class="voice-group__label">{{ group.label }}</p>
      <div class="voice-grid">
        <button
          v-for="voice in group.voices"
          :key="voice"
          class="voice-chip"
          :class="{ 'voice-chip--selected': selectedVoice === voice }"
          @click="selectedVoice = voice"
        >
          {{ voice }}
        </button>
      </div>
    </div>

    <div class="step-nav">
      <span class="hint">
        Selected: <strong>{{ selectedVoice }}</strong>
      </span>
      <button class="btn-primary" @click="store.step = 4">
        Continue
        <svg viewBox="0 0 16 16" fill="none" class="btn-icon">
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.voice-step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.voice-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.voice-group__label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-text-muted);
  margin: 0;
}

.voice-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.voice-chip {
  padding: 0.3rem 0.85rem;
  border: 1.5px solid var(--c-border);
  border-radius: 999px;
  background: #f8fafc;
  font-size: 0.82rem;
  color: var(--c-text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition:
    border-color 0.12s,
    background 0.12s,
    color 0.12s;
}

.voice-chip:hover {
  border-color: var(--c-accent);
  color: var(--c-accent);
  background: #f5f3ff;
}

.voice-chip--selected {
  border-color: var(--c-accent);
  background: #ede9fe;
  color: var(--c-accent);
  font-weight: 600;
}

.step-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--c-border);
}

.hint {
  font-size: 0.82rem;
  color: var(--c-text-secondary);
}

strong {
  color: var(--c-text);
}
</style>
