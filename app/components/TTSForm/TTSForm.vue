<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { cn } from "~/lib";
import z from "zod";
import {
  InfoIcon,
  SearchIcon,
  TrashIcon,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-vue-next";

const voicesStore = useVoicesStore();

const value = ref<{ label: string; value: VoiceEnum } | null>(null);

const options = computed(() =>
  voicesStore.voices
    .filter((voice: string): voice is VoiceEnum =>
      Object.values(VoiceEnum).includes(voice as VoiceEnum)
    )
    .map((voice: VoiceEnum) => ({
      label: voice,
      value: voice,
    }))
);

const tracks = ref<TPlayerTrack[]>([]);

const { onPlayAsPlaylist: _onPlayAsPlaylist } = useAudioPlayer({});
const toast = useToast();

const fields = [
  {
    name: "text",
    label: "Text",
    required: true,
    description: "Enter the text to convert to speech. Max 1000 characters.",
    type: "textarea" as const,
  },
  {
    name: "voice",
    label: "Voice",
    required: false,
    description: "Select the voice used for synthesis (optional).",
    type: "text" as const,
  },
] as const;

const schema = z.object({
  text: z.string().min(1, "Text is required").max(1000),
  voice: z.nativeEnum(VoiceEnum).optional(),
});

type TSoundForm = z.infer<typeof schema>;
type FieldName = (typeof fields)[number]["name"];

const form = useForm<TSoundForm>({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    text: "",
    voice: undefined,
  },
});

const { handleSubmit, resetForm, validateField } = form;

const { fieldErrors, isFormValid, getFieldModel } = useFormBuilder<
  FieldName,
  TSoundForm
>(
  form,
  fields.map((f) => f.name)
);

const onSoundFormSubmit = handleSubmit(async (values) => {
  try {
    const selectedVoice = value.value?.value || undefined;

    const response = await $fetch<{ success: boolean; url: string }>(
      "/api/tts",
      {
        method: "POST",
        body: {
          text: values.text,
          voice: selectedVoice,
        },
      }
    );

    if (!response.success) {
      toast.error("Failed to make TTS request.");
      return;
    }

    const track: TPlayerTrack = {
      id: Date.now(),
      title: `TTS: ${values.text.slice(0, 20)}...`,
      artist: selectedVoice || "Default Voice",
      artwork: "@",
      audio: response.url,
      album: "TTS Generated",
    };

    tracks.value = [...new Set([...tracks.value, track])];
    toast.success("Audio track generated!");
  } catch (error) {
    toast.error("TTS generation failed.");
    console.error(error);
  }
});

const handleReset = () => {
  resetForm();
  tracks.value = [];
  toast.info("Form and results cleared.");
};

onMounted(async () => {
  try {
    if (!voicesStore.isLoading || voicesStore.voices.length === 0) {
      await voicesStore.fetchVoices();
    }

    const firstVoice = voicesStore.voices.find((v): v is VoiceEnum =>
      Object.values(VoiceEnum).includes(v as VoiceEnum)
    );

    if (firstVoice && !value.value) {
      value.value = { label: firstVoice, value: firstVoice };
      form.setFieldValue("voice", firstVoice);
    }
  } catch (error) {
    console.error("Failed to fetch voices:", error);
  }
});
</script>

<template>
  <LazyClientOnly>
    <form class="space-y-4" @submit.prevent="onSoundFormSubmit">
      <div class="mb-6">
        <h2 class="font-semibold">Text-to-Speech Generator</h2>
        <p class="text-sm text-muted-foreground">
          Enter text and generate an audio preview using our TTS API.
        </p>
      </div>

      <FormField
        v-for="field in fields"
        :key="field.name"
        v-slot="{ componentField }"
        :name="field.name"
      >
        <FormItem v-auto-animate>
          <FormLabel class="text-sm font-medium flex items-center gap-1">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger as-child>
                <InfoIcon class="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ field.description }}</p>
              </TooltipContent>
            </Tooltip>
          </FormLabel>

          <FormControl>
            <Textarea
              v-if="field.type === 'textarea'"
              v-bind="componentField"
              v-model="getFieldModel(field.name).value"
              placeholder="Enter text to synthesize"
              class="transition-all"
              :class="{
                'border-red-500 focus:border-red-500': fieldErrors[field.name],
              }"
              @input="() => validateField(field.name)"
            />

            <div v-else class="w-full justify-center">
              <Combobox
                v-model="value"
                by="label"
                class="w-full"
                @update:model-value="
                  (v) =>
                    form.setFieldValue(
                      'voice',
                      typeof v === 'object' && v ? v.value : undefined
                    )
                "
              >
                <ComboboxAnchor as-child>
                  <ComboboxTrigger as-child>
                    <Button variant="outline" class="justify-between">
                      Select voice: {{ value ? value.label : "None" }}
                      <ChevronsUpDown
                        class="ml-2 h-4 w-4 shrink-0 opacity-50"
                      />
                    </Button>
                  </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxList>
                  <div class="relative w-full max-w-sm items-center">
                    <ComboboxInput
                      class="pl-9 w-full focus-visible:ring-0 border-0 border-b rounded-none h-10"
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
          </FormControl>

          <FormDescription class="text-xs text-gray-500">
            {{ field.description }}
          </FormDescription>

          <FormMessage
            v-if="fieldErrors[field.name]"
            class="text-xs text-red-500 mt-1"
          >
            {{ fieldErrors[field.name] }}
          </FormMessage>
        </FormItem>
      </FormField>

      <div class="flex gap-2">
        <Button
          type="submit"
          variant="ghost"
          class="flex-1"
          :disabled="!isFormValid"
          :class="{ 'opacity-50': !isFormValid }"
        >
          <span class="font-semibold">Generate</span>
          <SearchIcon class="ml-2 h-4 w-4" />
        </Button>

        <Button variant="destructive" class="flex-1" @click="handleReset">
          <span class="font-semibold">Clear</span>
          <TrashIcon class="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>

    <TrackList v-if="tracks.length > 0" :tracks="tracks" />
  </LazyClientOnly>
</template>
