import type { AudioSet } from "./audio-set"
import type { Tag } from "./tag"

export interface Result {
  id: string
  title: string
  indexed_on: string
  foreign_landing_url: string
  url: string
  creator: string
  creator_url: string
  license: string
  license_version: string
  license_url: string
  provider: string
  source: string
  category: string
  genres: string[]
  filesize: number
  filetype: string
  tags: Tag[]
  alt_files: unknown
  attribution: string
  fields_matched: string[]
  mature: boolean
  audio_set: AudioSet
  duration: number
  bit_rate: number
  sample_rate: number
  thumbnail: string
  detail_url: string
  related_url: string
  waveform: string
  unstable__sensitivity: unknown[]
}
