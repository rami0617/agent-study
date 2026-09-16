import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const result = query({
    prompt: "지금 몇 번째 메시지를 보내고 있는지 말해줘",
    options: {
      cwd: process.cwd(),
      systemPrompt: "당신은 친절한 어시스턴트입니다.",
      tools: [],
    }
  });

  for await (const message of result) {
    console.log(JSON.stringify(message, null, 2));
  }
}

main();