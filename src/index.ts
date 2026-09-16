import { query, tool, createSdkMcpServer, type AgentDefinition} from "@anthropic-ai/claude-agent-sdk";

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

// 서브에이전트 정의
const timeTeller: AgentDefinition = {
  description: 'timeTellerAgent',
  prompt: '너는 시간 조회 전담 에이전트다. get_time 도구를 써서 답해라',
  tools:  ['mcp__server__getTime'],
};

async function main() {
  for await (const message of query({
    prompt: "getTime 도구를 네가 직접 쓰지 말고, 반드시 timeTeller 서브에이전트한테 위임해서 시간을 확인해줘",
    options: {
      cwd: process.cwd(),
      systemPrompt:'' , 
      mcpServers: { server: myServer },
      tools: ['Task'],
      agents: {timeTeller},
      allowedTools: ['mcp__server__getTime', 'Task'],
      // disallowedTools: ['mcp__server__getTime'],
    },
  })) {
    console.log(JSON.stringify(message, null, 2));
  }
}

main();