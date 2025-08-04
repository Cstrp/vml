<script lang="ts" setup>
import { InfoIcon, SearchIcon, TrashIcon, PlayIcon } from "lucide-vue-next";
import { TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toTypedSchema } from "@vee-validate/zod";
import { ScrollArea } from "../ui/scroll-area";
import { useForm } from "vee-validate";
import z from "zod";

const tracks = ref<TPlayerTrack[]>([]);

const { isTrackPlaying: _isTrackPlaying, onPlayAsPlaylist: _onPlayAsPlaylist } =
  useAudioPlayer({});

const toast = useToast();

const schema = z.object({
  q: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query must be 100 characters or less"),
  page: z
    .number()
    .min(1, "Page number must be at least 1")
    .max(1000, "Page number cannot exceed 1000")
    .optional()
    .default(1),
  page_size: z
    .number()
    .min(1, "Page size must be at least 1")
    .max(50, "Page size cannot exceed 50")
    .optional()
    .default(10),
  mature: z.boolean().default(false).optional(),
  length: z
    .string()
    .refine(
      (val) => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 30 && num <= 3600;
      },
      {
        message: "Length must be a number between 30 and 3600 seconds",
      }
    )
    .optional()
    .default("30"),
});

type TSoundForm = z.infer<typeof schema>;

const fields = ["q", "page", "page_size", "mature", "length"] as const;

const form = useForm<TSoundForm>({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    q: "",
    page: 1,
    page_size: 10,
    mature: false,
    length: "30",
  },
});

const { handleSubmit, resetForm, validateField } = form;

const { fieldData, fieldErrors, fieldValid, isFormValid, getFieldModel } =
  useFormBuilder<(typeof fields)[number], z.infer<typeof schema>>(form, [
    ...fields,
  ]);

const getFormFieldDescription = (name: keyof TSoundForm) => {
  const descriptions: Record<keyof TSoundForm, string> = {
    q: "Enter a search query for audio tracks (e.g., 'rock' or 'classical'). Required, max 100 characters.",
    page: "Specify the page number for paginated results (1-1000). Leave blank for the first page.",
    page_size:
      "Set the number of results per page (1-50). Defaults to 10 if omitted.",
    mature:
      "Check to include mature content in search results. Unchecked by default.",
    length:
      "Enter the minimum audio length in seconds (30-3600). Defaults to 30 seconds if omitted.",
  };
  return descriptions[name] || "";
};

const onSoundFormSubmit = handleSubmit(async (values) => {
  try {
    // Convert length to number for API
    const apiValues = {
      ...values,
      length: values.length ? parseInt(values.length) : 30,
    };

    const response = await $fetch<{ status: string; track: TPlayerTrack }>(
      "/api/music",
      {
        method: "POST",
        body: {
          q: values.q,
          page: values.page,
          page_size: values.page_size,
          mature: values.mature,
          length: apiValues.length <= 30 ? "short" : "long",
        },
      }
    );

    if (response.status !== "ok") {
      toast.error("Failed to fetch audio tracks. Please try again later.");
      return;
    }

    tracks.value = [...new Set([...tracks.value, response.track])];

    toast.success("Audio tracks fetched successfully!");
  } catch (error) {
    console.error("Error submitting sound form:", error);
    toast.error("An error occurred. Please check your input and try again.");
  }
});

const handleReset = () => {
  resetForm();
  tracks.value = [];
  toast.info("Form cleared and tracks reset.");
};
</script>

<template>
  <LazyClientOnly>
    <div>
      <form
        class="space-y-4"
        data-aos="fade-zoom-in"
        @submit.prevent="onSoundFormSubmit"
      >
        <div class="flex flex-col gap-2 mb-6">
          <span class="font-semibold">Sound Search</span>
          <span class="text-muted-foreground text-sm">
            Search for audio tracks from SoundHelix. Customize your query, page,
            page size, maturity, and length to refine results.
          </span>
        </div>

        <FormField
          v-for="name in fields"
          :key="name"
          v-slot="{ componentField, value, handleChange }"
          :name="name"
        >
          <FormItem v-auto-animate>
            <FormLabel class="text-sm font-medium flex items-center gap-1">
              {{
                name === "q"
                  ? "Search Query"
                  : name.charAt(0).toUpperCase() + name.slice(1)
              }}
              <span v-if="name === 'q'" class="text-red-500">*</span>
              <Tooltip v-if="name !== 'mature'" class="ml-1">
                <TooltipTrigger as-child>
                  <InfoIcon
                    class="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{{ getFormFieldDescription(name) }}</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Input
                v-if="name !== 'mature'"
                v-bind="componentField"
                v-model="getFieldModel(name).value"
                :type="
                  ['length', 'page', 'page_size'].includes(name)
                    ? 'number'
                    : 'text'
                "
                :placeholder="'Enter ' + name.replace('_', ' ')"
                autocomplete="off"
                class="transition-all duration-200"
                :class="{
                  'border-red-500 focus:border-red-500': fieldErrors[name],
                  'border-gray-300':
                    !fieldErrors[name] && !fieldValid[name].value,
                }"
                @input="() => validateField(name)"
                @blur="() => fieldData[name][0]?.value && validateField(name)"
              />
              <div v-if="name === 'mature'" class="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  :model-value="value"
                  @update:model-value="handleChange"
                />
                <label
                  for="terms"
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include Mature Content
                  <span class="text-xs text-muted-foreground block">
                    Enable to include mature content in search results.
                  </span>
                </label>
              </div>
            </FormControl>
            <FormDescription
              v-if="name !== 'mature'"
              class="text-xs text-gray-500"
            >
              {{ getFormFieldDescription(name) }}
            </FormDescription>
            <FormMessage
              v-if="fieldErrors[name]"
              class="text-xs text-red-500 mt-1"
            >
              {{ fieldErrors[name] }}
              <span v-if="name === 'q'" class="text-gray-600 ml-1">
                (Try a specific keyword like 'jazz' or 'pop')
              </span>
              <span v-if="name === 'length'" class="text-gray-600 ml-1">
                (Enter a number between 30 and 3600)
              </span>
            </FormMessage>
          </FormItem>
        </FormField>

        <div class="flex gap-2">
          <Button
            type="submit"
            class="flex-1 transition-all duration-200 mt-5 rounded"
            variant="ghost"
            :disabled="!isFormValid"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
          >
            <div class="flex items-center justify-center gap-2">
              <span class="font-semibold">Search</span>
              <SearchIcon />
            </div>
          </Button>

          <Button
            class="flex-1 transition-all duration-200 mt-5 rounded"
            variant="destructive"
            @click="handleReset"
          >
            <div class="flex items-center justify-center gap-2">
              <span class="font-semibold">Clear</span>
              <TrashIcon />
            </div>
          </Button>
        </div>
      </form>
    </div>

    <ScrollArea v-if="tracks.length > 0" class="mt-8 h-60 space-y-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Found Tracks
      </h3>
      <div class="grid gap-4">
        <div
          v-for="track in tracks"
          :key="track.id"
          class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
        >
          <NuxtImg
            v-if="track.artwork"
            :src="track.artwork"
            :alt="track.artist"
            class="w-16 h-16 flex items-center justify-center px-4 rounded-lg object-cover bg-gray-100 dark:bg-gray-700 text-sm"
            loading="lazy"
          />
          <div
            v-else
            class="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h4
              class="text-sm font-medium text-gray-900 dark:text-white truncate"
            >
              {{ track.title }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
              {{ track.artist }}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            class="shrink-0"
            @click="() => _onPlayAsPlaylist([track], track)"
          >
            <PlayIcon class="w-4 h-4 mr-1" />
            Play
          </Button>
        </div>
      </div>
    </ScrollArea>

    <AudioPlayer
      hide-playlist-popup
      :options="{
        autoplay: false,
        autoCenter: true,
        normalize: true,
      }"
    />
  </LazyClientOnly>
</template>
