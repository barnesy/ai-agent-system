import { ResearchAgent } from './research-agent';
import { AgentMessage } from './base-agent';

describe('ResearchAgent', () => {
  let agent: ResearchAgent;

  beforeEach(() => {
    agent = new ResearchAgent();
  });

  test('should handle research-related tasks', () => {
    expect(agent.canHandle('explore the codebase')).toBe(true);
    expect(agent.canHandle('analyze dependencies')).toBe(true);
    expect(agent.canHandle('find patterns in code')).toBe(true);
    expect(agent.canHandle('build a feature')).toBe(false);
  });

  test('should execute research task', async () => {
    const message: AgentMessage = {
      from: 'orchestrator',
      to: 'ResearchAgent',
      type: 'request',
      payload: {
        task: 'analyze authentication module',
        priority: 'high'
      },
      timestamp: new Date()
    };

    const response = await agent.execute(message);
    
    expect(response.type).toBe('response');
    expect(response.from).toBe('ResearchAgent');
    expect(response.payload.context).toHaveProperty('findings');
    expect(response.payload.context).toHaveProperty('recommendations');
  });
});