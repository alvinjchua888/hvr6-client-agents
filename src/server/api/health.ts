import express, { Request, Response, Router } from 'express';
import { AgentOrchestrator } from '../agents/AgentOrchestrator';
import { SystemHealth, AgentStatus, JobStatus } from '../../shared/types';
import { logger } from '../utils/logger';
import os from 'os';

export function createHealthRouter(orchestrator: AgentOrchestrator): Router {
  const router = express.Router();

  /**
   * GET /api/health - Get system health status
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const agents = orchestrator.getAllAgents();
      const jobs = orchestrator.getActiveJobs();

      const health: SystemHealth = {
        timestamp: new Date(),
        agents: {
          total: agents.length,
          active: agents.filter(a => a.status === AgentStatus.RUNNING).length,
          idle: agents.filter(a => a.status === AgentStatus.IDLE).length,
          error: agents.filter(a => a.status === AgentStatus.ERROR).length
        },
        jobs: {
          total: jobs.length,
          running: jobs.filter(j => j.status === JobStatus.RUNNING).length,
          completed: jobs.filter(j => j.status === JobStatus.COMPLETED).length,
          failed: jobs.filter(j => j.status === JobStatus.FAILED).length
        },
        channels: {
          total: 0, // Would be populated from actual channel data
          active: 0
        },
        performance: {
          cpuUsage: os.loadavg()[0],
          memoryUsage: (1 - os.freemem() / os.totalmem()) * 100,
          networkThroughput: 0 // Would need actual network monitoring
        }
      };

      res.json({ success: true, data: health });
    } catch (error) {
      logger.error('Error fetching health:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch health' });
    }
  });

  return router;
}
