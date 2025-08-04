
interface TTSStoreState {
  error: string
}

export const ttsStore = defineStore<'tts', TTSStoreState>('tts', {
  state: () => ({
    error: ''
  }),
  actions: {
    setError(error: string) {
      this.error = error;
    }
  }
})
