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

const executor: AgentDefinition = {
  description: '파일을 읽고 쓰는 실행 담당 에이전트. 시간 조회와 파일 생성/수정이 필요한 작업에 사용.',
  prompt: '시간 조회와 파일 쓰기를 모두 수행하는 실행 에이전트다. mcp__server__getTime으로 시간을 확인하고, Write로 파일을 작성해라.',
  tools: ['mcp__server__getTime', 'Write'],
  disallowedTools: ['Task'], 
};

async function main() {
  try {
    for await (const message of query({
      prompt: "workspace/note.txt를 만들고 지금 시각을 적은 다음, 오늘 서울 날씨도 검색해서 같이 적어줘",
      options: {
        cwd: process.cwd(),
        systemPrompt: '',
        mcpServers: { server: myServer },
        tools: ['Task', 'Write'],
        allowedTools: ['mcp__server__getTime', 'Task', 'Write'],
        agents: { executor }, 
        maxTurns: 8,
        maxBudgetUsd: 0.05
      },
    })) {
      console.log(JSON.stringify(message, null, 2));
    }
  } catch(err) {
    console.error("쿼리 중단:", err instanceof Error ? err.message : err);
}
}


main();