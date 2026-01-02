import express, { Request, Response, Router } from 'express';
import { AgentOrchestrator } from '../agents/AgentOrchestrator';
import { logger } from '../utils/logger';

export function createJobsRouter(orchestrator: AgentOrchestrator): Router {
  const router = express.Router();

  /**
   * GET /api/jobs - Get all active jobs
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const jobs = orchestrator.getActiveJobs();
      res.json({ success: true, data: jobs });
    } catch (error) {
      logger.error('Error fetching jobs:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
    }
  });

  /**
   * GET /api/jobs/:id - Get job by ID
   */
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const job = orchestrator.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }
      res.json({ success: true, data: job });
    } catch (error) {
      logger.error('Error fetching job:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch job' });
    }
  });

  return router;
}
