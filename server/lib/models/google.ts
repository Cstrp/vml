import { ChatGoogleGenerativeAI as ChatModel } from '@langchain/google-genai';
import type { JsonOutputParser } from '@langchain/core/output_parsers';
import type { BaseMessage } from '@langchain/core/messages';
import { invokeAndParse } from './utils';

export type GoogleGenAIConfig = {
  /**
   * The model to use.
   * @default gemini-2.0-flash
   */
  model?: 'gemini-2.0-flash' | 'gemini-2.0-flash-lite' | 'gemini-1.5-flash';
  /**
   * The API key to use.
   */
  apiKey: string;
  /**
   * @default 0
   */
  temperature?: number;
  /**
   * The maximum number of retries.
   * This is usefull when you have a low quota such as Tier 1 or 2.
   * @default 6
   */
  maxRetries?: number;
  /**
   * The maximum number of concurrent requests.
   * Set it to a low value if you have a low quota such as Tier 1 or 2.
   * @default 2
   */
  maxConcurrency?: number;
};

export const initGoogle = async <T extends Record<string, unknown>>(
  config: GoogleGenAIConfig,
  messages: BaseMessage[],
  parser: JsonOutputParser<T>
) => {
  const { model = 'gemini-2.0-flash', apiKey, temperature = 0, maxRetries = 6, maxConcurrency = 2 } = config;

  if (!apiKey) {
    throw new Error("API key is required");
  }

  const chatModel = new ChatModel({
    model,
    apiKey,
    temperature,
    maxRetries,
    maxConcurrency,
  });

  return invokeAndParse<T>(chatModel, messages, parser);
}
