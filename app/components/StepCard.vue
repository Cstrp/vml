<script setup lang="ts">
const props = defineProps<{
  num: number;
  title: string;
  currentStep: number;
}>();

const emit = defineEmits<{ edit: [] }>();

const isActive = computed(() => props.currentStep === props.num);
const isDone = computed(() => props.currentStep > props.num);
const isUpcoming = computed(() => props.currentStep < props.num);
</script>

<template>
  <div
    class="step-card"
    :class="{
      'is-active': isActive,
      'is-done': isDone,
      'is-upcoming': isUpcoming,
    }"
  >
    <div class="step-card__header">
      <div class="step-card__badge" aria-hidden="true">
        <svg v-if="isDone" viewBox="0 0 16 16" fill="none" class="check-icon">
          <path
            d="M3 8l3.5 3.5L13 5"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span v-else>{{ num }}</span>
      </div>
      <span class="step-card__title">{{ title }}</span>
      <button v-if="isDone" class="edit-btn" @click="emit('edit')">Edit</button>
    </div>

    <Transition name="step-body">
      <div v-if="isActive" class="step-card__body">
        <slot name="body" />
      </div>
    </Transition>

    <div v-if="isDone && $slots.summary" class="step-card__summary">
      <slot name="summary" />
    </div>
  </div>
</template>

<style scoped>
.step-card {
  background: #fff;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-md);
  margin-bottom: 0.75rem;
  overflow: hidden;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-shadow: var(--shadow-sm);
}

.step-card.is-active {
  border-color: var(--c-accent);
  box-shadow:
    0 0 0 3px var(--c-accent-ring),
    var(--shadow-sm);
}

.step-card.is-upcoming {
  opacity: 0.48;
  pointer-events: none;
}

.step-card__header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  background: #fafafa;
  cursor: default;
}

.step-card.is-active .step-card__header {
  background: #f5f3ff;
}

.step-card.is-done .step-card__header {
  background: #f0fdf4;
}

.step-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  font-size: 0.82rem;
  font-weight: 700;
  flex-shrink: 0;
  background: #e2e8f0;
  color: var(--c-text-muted);
  transition:
    background 0.2s,
    color 0.2s;
}

.step-card.is-active .step-card__badge {
  background: var(--c-accent);
  color: #fff;
}

.step-card.is-done .step-card__badge {
  background: var(--c-success);
  color: #fff;
}

.check-icon {
  width: 0.9rem;
  height: 0.9rem;
}

.step-card__title {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--c-text);
}

.step-card.is-upcoming .step-card__title {
  color: var(--c-text-muted);
}

.edit-btn {
  background: transparent;
  border: none;
  font-size: 0.8rem;
  color: var(--c-accent);
  cursor: pointer;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-family: inherit;
  font-weight: 600;
  transition: background 0.15s;
}

.edit-btn:hover {
  background: #ede9fe;
}

.step-card__body {
  padding: 1.25rem;
  border-top: 1px solid var(--c-border);
}

.step-card__summary {
  padding: 0.65rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.84rem;
  color: var(--c-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-body-enter-active,
.step-body-leave-active {
  transition: opacity 0.18s ease;
}

.step-body-enter-from,
.step-body-leave-to {
  opacity: 0;
}
</style>
