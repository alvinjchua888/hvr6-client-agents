import express, { Request, Response, Router } from 'express';
import { AgentOrchestrator } from '../agents/AgentOrchestrator';
import { AgentType, AgentTask } from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export function createAgentsRouter(orchestrator: AgentOrchestrator): Router {
  const router = express.Router();

  /**
   * GET /api/agents - Get all agents
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const agents = orchestrator.getAllAgents();
      res.json({ success: true, data: agents });
    } catch (error) {
      logger.error('Error fetching agents:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch agents' });
    }
  });

  /**
   * GET /api/agents/:id - Get agent by ID
   */
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const agent = orchestrator.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }
      res.json({ success: true, data: agent });
    } catch (error) {
      logger.error('Error fetching agent:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch agent' });
    }
  });

  /**
   * GET /api/agents/type/:type - Get agents by type
   */
  router.get('/type/:type', (req: Request, res: Response) => {
    try {
      const type = req.params.type.toUpperCase() as AgentType;
      if (!Object.values(AgentType).includes(type)) {
        return res.status(400).json({ success: false, error: 'Invalid agent type' });
      }
      const agents = orchestrator.getAgentsByType(type);
      res.json({ success: true, data: agents });
    } catch (error) {
      logger.error('Error fetching agents by type:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch agents' });
    }
  });

  return router;
}
