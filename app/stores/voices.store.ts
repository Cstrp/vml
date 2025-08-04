
interface VoicesStoreState {
  voices: Voices[];
  isLoading: boolean;
  error: string;
}

export const useVoicesStore = defineStore('voices', {
  state: (): VoicesStoreState => ({
    voices: [],
    isLoading: false,
    error: ''
  }),

  actions: {
    async fetchVoices(): Promise<void> {
      this.isLoading = true;
      this.error = '';

      try {
        const { success, voices } = await $fetch('/api/tts', {
          method: 'GET',
        })

        if (!success) {
          this.error = 'Failed to fetch voices';
          return;
        }

        this.voices = voices;

        this.isLoading = false;


      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';

        this.isLoading = false;

        throw new Error(this.error);
      }
    },

    setVoices(voices: Voices[]) {
      this.voices = voices;
    },

    clearVoices() {
      this.voices = [];
    }
  },

  getters: {
    voicesList: (state) => {
      return state.voices;
    },

    voicesCount: (state) => {
      return state.voices.length;
    },

    isLoadingVoices: (state) => {
      return state.isLoading;
    },
  }
})
