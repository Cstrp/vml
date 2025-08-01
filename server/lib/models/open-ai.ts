import type { JsonOutputParser } from '@langchain/core/output_parsers';
import { ChatOpenAI as ChatModel } from '@langchain/openai';
import type { BaseMessage } from '@langchain/core/messages';
import { invokeAndParse } from './utils';

export type ChatOpenAIConfig = {
  /**
   * The model to use.
   * @default gpt-4o
   */
  model?: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo';
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
  /**
   * The OpenAI API key to use
   */
  apiKey: string;
};

export const initOpenAI = async <T extends Record<string, unknown>>(
  config: ChatOpenAIConfig,
  messages: BaseMessage[],
  parser: JsonOutputParser<T>
) => {
  const { model = 'gpt-4o', temperature = 0, maxRetries = 6, maxConcurrency = 2, apiKey } = config;

  if (!apiKey) {
    throw new Error("API key is required");
  }

  const chatModel = new ChatModel({
    maxConcurrency,
    temperature,
    maxRetries,
    apiKey,
    model,
  });

  return invokeAndParse<T>(chatModel, messages, parser);
}
