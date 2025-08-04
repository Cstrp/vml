import { useLocalStorage } from "@vueuse/core"

type TPlaylistOptions = {
  repeat: 'none' | 'single' | 'all'
}

const playlist = ref<TPlayerTrack[] | []>([])
const shuffle = ref(false)
const playlistOriginal = ref<TPlayerTrack[] | []>([])
const playlistShuffled = ref<TPlayerTrack[] | []>([])

const playlistOptions = useLocalStorage<TPlaylistOptions>('player:playlist:options', {
  repeat: 'all',
})

export const useAudioPlayerList = () => {
  const onToggleRepeat = () => {
    const { repeat } = playlistOptions.value

    switch (repeat) {
      case 'none':
        playlistOptions.value.repeat = 'single'
        break
      case 'single':
        playlistOptions.value.repeat = playlist.value.length ? 'all' : 'none'
        break
      case 'all':
        playlistOptions.value.repeat = 'none'
        break
    }
  }

  const shuffleArray = (array: TPlayerTrack[] | []) => {
    const shuffled: TPlayerTrack[] = [...array]

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }

    return shuffled
  }

  const onToggleShuffle = () => {
    shuffle.value = !shuffle.value

    if (shuffle.value) {
      playlistOriginal.value = toRaw(playlist.value)
      playlistShuffled.value = shuffleArray(toRaw(playlist.value))
      playlist.value = toRaw(playlistShuffled.value)
    } else {
      playlist.value = toRaw(playlistOriginal.value)
    }
  }

  const onSetPlaylist = (tracks: TPlayerTrack[]) => {
    shuffle.value = false;
    playlist.value = tracks;
  };

  const onResetPlaylist = () => {
    playlist.value = []
  }

  return {
    playlist,
    playlistOptions,
    shuffle,

    onSetPlaylist,
    onToggleRepeat,
    onToggleShuffle,
    onResetPlaylist,
    shuffleArray,
  }
};
