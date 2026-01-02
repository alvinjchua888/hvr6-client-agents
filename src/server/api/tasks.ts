import express, { Request, Response, Router } from 'express';
import { AgentOrchestrator } from '../agents/AgentOrchestrator';
import { AgentType, AgentTask } from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export function createTasksRouter(orchestrator: AgentOrchestrator): Router {
  const router = express.Router();

  /**
   * POST /api/tasks - Submit a new task
   */
  router.post('/', (req: Request, res: Response) => {
    try {
      const { agentType, action, parameters, priority = 5 } = req.body;

      if (!agentType || !action || !parameters) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: agentType, action, parameters' 
        });
      }

      if (!Object.values(AgentType).includes(agentType)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid agent type' 
        });
      }

      const task: AgentTask = {
        id: uuidv4(),
        agentType,
        action,
        parameters,
        priority,
        createdAt: new Date()
      };

      orchestrator.submitTask(task);
      logger.info(`Task ${task.id} submitted via API`);

      res.status(201).json({ success: true, data: task });
    } catch (error) {
      logger.error('Error submitting task:', error);
      res.status(500).json({ success: false, error: 'Failed to submit task' });
    }
  });

  /**
   * GET /api/tasks/queue - Get task queue status
   */
  router.get('/queue', (req: Request, res: Response) => {
    try {
      const queueStatus = orchestrator.getQueueStatus();
      res.json({ success: true, data: queueStatus });
    } catch (error) {
      logger.error('Error fetching queue status:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch queue status' });
    }
  });

  return router;
}
