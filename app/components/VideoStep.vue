<script setup lang="ts">
const store = useVideoPipelineStore();
const {
  searchQuery,
  searchResults,
  searchPending,
  searchError,
  selectedVideo,
  selectedVideoInfo,
} = storeToRefs(store);
</script>

<template>
  <div class="video-step">
    <div class="search-row">
      <div class="search-input-wrap">
        <svg class="search-icon" viewBox="0 0 16 16" fill="none">
          <circle
            cx="7"
            cy="7"
            r="4.5"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M10.5 10.5l3 3"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Pexels for background videos…"
          @keyup.enter="store.search"
        />
      </div>
      <button
        class="btn-secondary"
        :disabled="searchPending || !searchQuery.trim()"
        @click="store.search"
      >
        {{ searchPending ? "Searching…" : "Search" }}
      </button>
    </div>

    <p v-if="searchError" class="error-msg">{{ searchError }}</p>

    <div v-if="searchResults.length" class="video-grid">
      <button
        v-for="video in searchResults"
        :key="video.id"
        class="video-card"
        :class="{
          'video-card--selected':
            selectedVideo && selectedVideo.id === video.id,
        }"
        @click="store.selectedVideo = video"
      >
        <div class="video-card__img-wrap">
          <img :src="video.image" :alt="`Pexels video ${video.id}`" />
          <div
            v-if="selectedVideo && selectedVideo.id === video.id"
            class="video-card__check"
          >
            <svg viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" fill="var(--c-accent)" />
              <path
                d="M6 10l2.8 2.8L14 7"
                stroke="#fff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <div class="video-card__meta">
          <span>{{ video.duration }}s</span>
          <span>{{ video.width }}×{{ video.height }}</span>
        </div>
      </button>
    </div>

    <div class="step-nav">
      <span class="hint">{{ selectedVideoInfo }}</span>
      <button
        class="btn-primary"
        :disabled="!selectedVideo"
        @click="store.step = 3"
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
.video-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-row {
  display: flex;
  gap: 0.5rem;
}

.search-input-wrap {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--c-text-muted);
  pointer-events: none;
}

.search-input-wrap input {
  width: 100%;
  padding: 0.6rem 0.75rem 0.6rem 2.4rem;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--c-text);
  background: #fafafa;
  box-sizing: border-box;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background 0.15s;
}

.search-input-wrap input:focus {
  outline: none;
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px var(--c-accent-ring);
  background: #fff;
}

.search-input-wrap input::placeholder {
  color: var(--c-text-muted);
}

.error-msg {
  color: var(--c-error);
  font-size: 0.85rem;
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.video-card {
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  transition:
    border-color 0.15s,
    transform 0.15s,
    box-shadow 0.15s;
  text-align: left;
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--c-border-hover);
}

.video-card--selected {
  border-color: var(--c-accent);
}

.video-card__img-wrap {
  position: relative;
  overflow: hidden;
}

.video-card__img-wrap img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  transition: transform 0.2s;
}

.video-card:hover .video-card__img-wrap img {
  transform: scale(1.03);
}

.video-card__check {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  width: 1.4rem;
  height: 1.4rem;
}

.video-card__check svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
}

.video-card__meta {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0.5rem;
  font-size: 0.75rem;
  color: var(--c-text-muted);
}

.video-card--selected .video-card__meta {
  color: var(--c-accent);
}

.step-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.25rem;
  border-top: 1px solid var(--c-border);
}

.hint {
  font-size: 0.82rem;
  color: var(--c-text-muted);
}
</style>
