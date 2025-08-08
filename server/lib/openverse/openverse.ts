import type { OpenverseRequestParams, OpenverseResponse } from '@@/shared'
import { $fetch } from 'ofetch';

export const initializeOpenverse = async (config: { apiKey: string }) => {
  if (!config.apiKey) {
    throw new Error("Openverse API key is required");
  }

  const OPENVERSE_URL = "https://api.openverse.org/v1";

  const fetchOpenverseAudio = async (params: Partial<Record<OpenverseRequestParams, string | number | boolean>>) => {
    const response = await $fetch<OpenverseResponse>(`${OPENVERSE_URL}/audio/`, {
      query: params,
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
      },
    });

    if (!response || !response.results || response.results.length === 0) {
      throw new Error(`Openverse API request failed: ${response}`);
    }

    return response;
  };

  const getRateLimit = async () => {
    const response = await $fetch<{
      requests_this_minute: number | null
      requests_today: number | null
      rate_limit_model: string
      verified: boolean
    }>(`${OPENVERSE_URL}/rate_limit`, {
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
      },
    });

    if (!response) {
      throw new Error(
        `Openverse rate limit request failed: ${JSON.stringify(response)}`
      );
    }

    return response;
  };


  return {
    getRateLimit,
    fetchOpenverseAudio,
  };
}
