"use server";
import { createStreamableUI } from "ai/rsc";
import { OpenAIAgent } from "llamaindex";
import type { ChatMessage } from "llamaindex/llm/types";

export async function chatWithAgent(
  question: string,
  prevMessages: ChatMessage[] = [],
) {
  const agent = new OpenAIAgent({
    tools: [
      // ... adding your tools here
    ],
  });
  const responseStream = await agent.chat({
    stream: true,
    message: question,
    chatHistory: prevMessages,
  });
  const uiStream = createStreamableUI(<div>loading...</div>);
  responseStream
    .pipeTo(
      new WritableStream({
        start: () => {
          uiStream.update("response:");
        },
        write: async (message) => {
          uiStream.append(message.response.delta);
        },
      }),
    )
    .catch(console.error);
  return uiStream.value;
}