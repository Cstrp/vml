import { getAvailableVoices } from "~~/server/lib"

export default defineLazyEventHandler(() => {
  return defineEventHandler(() => {
    const voices = getAvailableVoices();

    return {
      success: true,
      voices,
    };
  })
})
