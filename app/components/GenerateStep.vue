<script setup lang="ts">
const store = useVideoPipelineStore();
const { text, selectedVoice, selectedVideoInfo, pending, genError, result } =
  storeToRefs(store);
</script>

<template>
  <div class="generate-step">
    <template v-if="!result">
      <div class="summary-card">
        <div class="summary-row">
          <span class="summary-label">Script</span>
          <span class="summary-value">
            {{ text.slice(0, 80) }}{{ text.length > 80 ? "…" : "" }}
          </span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Voice</span>
          <span class="summary-value">{{ selectedVoice }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Video</span>
          <span class="summary-value">{{ selectedVideoInfo }}</span>
        </div>
      </div>

      <button class="btn-generate" :disabled="pending" @click="store.generate">
        <span v-if="pending" class="spinner" aria-hidden="true" />
        <svg v-else viewBox="0 0 20 20" fill="none" class="generate-icon">
          <polygon points="5,3 18,10 5,17" fill="currentColor" />
        </svg>
        {{ pending ? "Generating your video…" : "Generate Video" }}
      </button>

      <p v-if="genError" class="error-msg">{{ genError }}</p>
    </template>

    <div v-else class="result">
      <video :src="result.videoUrl" controls playsinline class="result-video">
        <track
          kind="subtitles"
          :src="result.vttUrl"
          label="Subtitles"
          default
        />
      </video>
      <button class="btn-new" @click="store.reset">
        <svg viewBox="0 0 16 16" fill="none" class="btn-icon">
          <path
            d="M2 8a6 6 0 1 1 1.2 3.6"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
          <path
            d="M2 11.5V8h3.5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Create another video
      </button>
    </div>
  </div>
</template>

<style scoped>
.generate-step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.summary-card {
  background: #f8fafc;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.summary-row {
  display: flex;
  gap: 0.75rem;
  font-size: 0.88rem;
  align-items: baseline;
}

.summary-label {
  font-weight: 600;
  color: var(--c-text-muted);
  min-width: 3.5rem;
  flex-shrink: 0;
}

.summary-value {
  color: var(--c-text-secondary);
  line-height: 1.4;
}

.btn-generate {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  align-self: flex-start;
  padding: 0.7rem 2rem;
  background: var(--c-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s,
    transform 0.1s;
  letter-spacing: 0.01em;
}

.btn-generate:hover:not(:disabled) {
  background: var(--c-accent-hover);
  transform: translateY(-1px);
}

.btn-generate:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.generate-icon {
  width: 1rem;
  height: 1rem;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-msg {
  color: var(--c-error);
  font-size: 0.85rem;
  margin: 0;
  padding: 0.625rem 0.875rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
}

.result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-video {
  width: 100%;
  border-radius: var(--radius-sm);
  background: #000;
  box-shadow: var(--shadow-md);
}

.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  background: transparent;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-sm);
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  color: var(--c-text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition:
    border-color 0.15s,
    color 0.15s,
    background 0.15s;
}

.btn-new:hover {
  border-color: var(--c-accent);
  color: var(--c-accent);
  background: #f5f3ff;
}
</style>
