import type { ChatGoogleGenerativeAI as GoogleChatModel } from '@langchain/google-genai';
import type { ChatOllama as OllamaChatModel } from '@langchain/ollama';
import type { ChatOpenAI as OpenAIChatModel } from '@langchain/openai';
import type { JsonOutputParser } from '@langchain/core/output_parsers';
import type { BaseMessage } from '@langchain/core/messages';

export const invokeAndParse = async <T extends Record<string, unknown>>(
  model: GoogleChatModel | OllamaChatModel | OpenAIChatModel,
  messages: BaseMessage[],
  parser: JsonOutputParser<T>,
): Promise<T> => {
  const response = await model.invoke(messages);

  return parser.invoke(response);
}
