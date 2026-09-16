import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";

const getTimeTool = tool(
  'getTime',
 '시간을 반환하는 mcp이다.',
  {}, 
  async () => {
    const hour = new Date().getHours();
    const minutes =  new Date().getMinutes()
    return {
      content: [{ type: "text", text: `${hour}:${minutes}` }],
    };
  },
);

const myServer = createSdkMcpServer({
  name: 'server',
  tools: [getTimeTool],
});

async function main() {
  for await (const message of query({
    prompt: "지금 몇 시야?",
    options: {
      cwd: process.cwd(),
      systemPrompt: "당신은 친절한 어시스턴트입니다.",
      mcpServers: { 'server': myServer },
      tools: [ 'mcp__server__getTime'],
      allowedTools: [ 'mcp__server__getTime' ]
    },
  })) {
    console.log(JSON.stringify(message, null, 2));
  }
}

main();