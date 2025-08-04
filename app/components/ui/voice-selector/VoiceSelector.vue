<script lang="ts" setup>
import { Search, Check, ChevronsUpDown } from "lucide-vue-next";
import { cn } from "~/lib";

const voicesStore = useVoicesStore();

const value = ref<{ label: string; value: string } | null>(
  voicesStore.voices[0]
    ? { label: voicesStore.voices[0], value: voicesStore.voices[0] }
    : null
);

const options = computed(() =>
  voicesStore.voices.map((voice: string) => ({
    label: voice,
    value: voice,
  }))
);

onMounted(async () => {
  try {
    if (!voicesStore.isLoading || voicesStore.voices.length === 0) {
      await voicesStore.fetchVoices();
    }
  } catch (error) {
    console.error("Failed to fetch voices:", error);
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <Combobox v-model="value" by="label">
      <ComboboxAnchor as-child>
        <ComboboxTrigger as-child>
          <Button variant="outline" class="justify-between">
            Select voice: {{ value ? value.label : "None" }}
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </ComboboxTrigger>
      </ComboboxAnchor>

      <ComboboxList>
        <div class="relative w-full max-w-sm items-center">
          <ComboboxInput
            class="pl-9 focus-visible:ring-0 border-0 border-b rounded-none h-10"
            placeholder="Select voice..."
          />
          <span
            class="absolute start-0 inset-y-0 flex items-center justify-center px-3"
          >
            <Search class="size-4 text-muted-foreground" />
          </span>
        </div>

        <ComboboxEmpty> No voices found. </ComboboxEmpty>

        <ComboboxGroup>
          <ComboboxItem
            v-for="voice in options"
            :key="voice.value"
            :value="voice"
          >
            {{ voice.label }}

            <ComboboxItemIndicator>
              <Check :class="cn('ml-auto h-4 w-4')" />
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxGroup>
      </ComboboxList>
    </Combobox>
  </div>
</template>
