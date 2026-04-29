<script lang="ts" setup>
defineRouteRules({
  prerender: true,
});
</script>

<template>
  <NuxtPage />
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  --c-bg: #f8fafc;
  --c-surface: #ffffff;
  --c-border: #e2e8f0;
  --c-border-hover: #cbd5e1;
  --c-text: #0f172a;
  --c-text-secondary: #475569;
  --c-text-muted: #94a3b8;
  --c-accent: #6366f1;
  --c-accent-hover: #4f46e5;
  --c-accent-ring: rgba(99, 102, 241, 0.2);
  --c-success: #10b981;
  --c-error: #ef4444;
  --radius-sm: 8px;
  --radius-md: 12px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05);
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--c-bg);
  color: var(--c-text);
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  background: var(--c-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--c-accent-hover);
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  background: #f1f5f9;
  color: var(--c-text-secondary);
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  border-color: var(--c-border-hover);
}

.btn-secondary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}
</style>
