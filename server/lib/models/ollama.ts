import type { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatOllama as ChatModel } from '@langchain/ollama';
import type { BaseMessage } from '@langchain/core/messages';
import { invokeAndParse } from './utils';

export type ChatOllamaConfig = {
  /**
   * The model to use.
   */
  model: 'qwen2.5' | 'llama3.2';
  /**
   * The base URL of the Ollama server.
   * @default http://localhost:11434
   */
  baseUrl?: string;
  /**
   * The temperature to use. We recommend setting this to 0 for consistency.
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

export const initOllama = async <T extends Record<string, unknown>>(
  config: ChatOllamaConfig,
  messages: BaseMessage[],
  parser: JsonOutputParser<T>
) => {
  const { model, baseUrl = 'http://localhost:11434', temperature = 0, maxRetries = 6, maxConcurrency = 2 } = config;

  if (!model) {
    throw new Error("Model is required");
  }

  const chatModel = new ChatModel({
    maxConcurrency,
    temperature,
    maxRetries,
    baseUrl,
    model,
  });

  return invokeAndParse<T>(chatModel, messages, parser);
}
