<script setup lang="ts">
import "vue-sonner/style.css";
</script>

<template>
  <div class="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <TooltipProvider>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </TooltipProvider>

    <Toaster :duration="3000" mobile-offset="4" rich-colors />
  </div>
</template>

