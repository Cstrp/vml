<script setup lang="ts">
definePageMeta({ layout: false });
const store = useVideoPipelineStore();
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header__inner">
        <div class="page-header__badge">Video Studio</div>
        <h1 class="page-header__title">Create your video</h1>
        <p class="page-header__sub">
          Paste a script, pick a background, choose a voice — done.
        </p>
      </div>
    </header>

    <div class="stepper-wrap">
      <StepCard
        :num="1"
        title="Write your script"
        :current-step="store.step"
        @edit="store.step = 1"
      >
        <template #body>
          <ScriptStep />
        </template>
        <template #summary>
          {{ store.text.slice(0, 120) }}{{ store.text.length > 120 ? "…" : "" }}
        </template>
      </StepCard>

      <StepCard
        :num="2"
        title="Select background video"
        :current-step="store.step"
        @edit="store.step = 2"
      >
        <template #body>
          <VideoStep />
        </template>
        <template #summary>
          <div v-if="store.selectedVideo" class="video-summary">
            <img
              :src="store.selectedVideo.image"
              class="video-thumb"
              alt="Selected video"
            />
            <span>{{ store.selectedVideoInfo }}</span>
          </div>
        </template>
      </StepCard>

      <StepCard
        :num="3"
        title="Choose a voice"
        :current-step="store.step"
        @edit="store.step = 3"
      >
        <template #body>
          <VoiceStep />
        </template>
        <template #summary>{{ store.selectedVoice }}</template>
      </StepCard>

      <StepCard :num="4" title="Generate your video" :current-step="store.step">
        <template #body>
          <GenerateStep />
        </template>
      </StepCard>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
}

.page-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 3rem 1.5rem 2.5rem;
  text-align: center;
  color: #fff;
}

.page-header__inner {
  max-width: 600px;
  margin: 0 auto;
}

.page-header__badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.18);
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.page-header__title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  letter-spacing: -0.025em;
  line-height: 1.15;
}

.page-header__sub {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.82;
  line-height: 1.5;
}

.stepper-wrap {
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  flex: 1;
}

.video-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.video-thumb {
  width: 72px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}
</style>
