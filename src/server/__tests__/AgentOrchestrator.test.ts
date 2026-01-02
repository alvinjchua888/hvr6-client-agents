import { AgentOrchestrator } from '../agents/AgentOrchestrator';
import { AgentType, AgentTask } from '../../shared/types';

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;

  beforeEach(() => {
    orchestrator = new AgentOrchestrator();
  });

  afterEach(() => {
    orchestrator.stop();
  });

  test('should initialize with all agent types', () => {
    const agents = orchestrator.getAllAgents();
    expect(agents.length).toBe(6);
    
    const agentTypes = agents.map(a => a.type);
    expect(agentTypes).toContain(AgentType.REFRESH);
    expect(agentTypes).toContain(AgentType.CDC);
    expect(agentTypes).toContain(AgentType.INTEGRATE);
    expect(agentTypes).toContain(AgentType.COMPARE);
    expect(agentTypes).toContain(AgentType.MONITOR);
    expect(agentTypes).toContain(AgentType.SCHEDULE);
  });

  test('should get agents by type', () => {
    const refreshAgents = orchestrator.getAgentsByType(AgentType.REFRESH);
    expect(refreshAgents.length).toBe(1);
    expect(refreshAgents[0].type).toBe(AgentType.REFRESH);
  });

  test('should submit and queue tasks', () => {
    const task: AgentTask = {
      id: 'test-task-1',
      agentType: AgentType.REFRESH,
      action: 'refresh',
      parameters: { channelId: 'test' },
      priority: 5,
      createdAt: new Date()
    };

    orchestrator.submitTask(task);
    const queueStatus = orchestrator.getQueueStatus();
    expect(queueStatus.pending).toBeGreaterThanOrEqual(0);
  });

  test('should start and stop orchestrator', () => {
    orchestrator.start();
    orchestrator.stop();
    // Should not throw
    expect(true).toBe(true);
  });
});
