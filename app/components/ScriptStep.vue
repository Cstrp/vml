<script setup lang="ts">
const store = useVideoPipelineStore();
const { text } = storeToRefs(store);

const wordCount = computed(() => {
  const trimmed = text.value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
});
</script>

<template>
  <div class="script-step">
    <textarea
      v-model="text"
      rows="6"
      class="script-textarea"
      placeholder="Write the narration text for your video…"
    />
    <div class="script-footer">
      <div class="script-stats">
        <span>{{ wordCount }} words</span>
        <span class="sep">·</span>
        <span>{{ text.length }} characters</span>
      </div>
      <button
        class="btn-primary"
        :disabled="!text.trim()"
        @click="store.step = 2"
      >
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
.script-step {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.script-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-family: inherit;
  line-height: 1.65;
  resize: vertical;
  color: var(--c-text);
  background: #fafafa;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background 0.15s;
  box-sizing: border-box;
}

.script-textarea:focus {
  outline: none;
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px var(--c-accent-ring);
  background: #fff;
}

.script-textarea::placeholder {
  color: var(--c-text-muted);
}

.script-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.script-stats {
  display: flex;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--c-text-muted);
  align-items: center;
}

.sep {
  opacity: 0.4;
}
</style>
