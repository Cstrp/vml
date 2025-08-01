import type { Result } from "./result"
import type { Warning } from "./warning"

export interface OpenverseResponse {
  result_count: number
  page_count: number
  page_size: number
  page: number
  results: Result[]
  warnings: Warning[]
}
