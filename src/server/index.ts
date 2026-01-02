import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { AgentOrchestrator } from './agents/AgentOrchestrator';
import { createAgentsRouter } from './api/agents';
import { createTasksRouter } from './api/tasks';
import { createJobsRouter } from './api/jobs';
import { createHealthRouter } from './api/health';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

/**
 * Main server application
 */
class Server {
  private app: Express;
  private orchestrator: AgentOrchestrator;
  private wss: WebSocketServer | null = null;

  constructor() {
    this.app = express();
    this.orchestrator = new AgentOrchestrator();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupOrchestrator();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // API routes
    this.app.use('/api/agents', createAgentsRouter(this.orchestrator));
    this.app.use('/api/tasks', createTasksRouter(this.orchestrator));
    this.app.use('/api/jobs', createJobsRouter(this.orchestrator));
    this.app.use('/api/health', createHealthRouter(this.orchestrator));

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'HVR 6.0 Client Agents API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          agents: '/api/agents',
          tasks: '/api/tasks',
          jobs: '/api/jobs',
          health: '/api/health'
        }
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  /**
   * Setup WebSocket server for real-time updates
   */
  private setupWebSocket(): void {
    this.wss = new WebSocketServer({ port: Number(WS_PORT) });

    this.wss.on('connection', (ws) => {
      logger.info('WebSocket client connected');

      ws.on('message', (message) => {
        logger.debug(`WebSocket received: ${message}`);
      });

      ws.on('close', () => {
        logger.info('WebSocket client disconnected');
      });

      // Send initial status
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to HVR 6.0 Agent System'
      }));
    });

    logger.info(`WebSocket server listening on port ${WS_PORT}`);
  }

  /**
   * Setup orchestrator event listeners
   */
  private setupOrchestrator(): void {
    this.orchestrator.on('taskStarted', (data) => {
      this.broadcastWebSocket({
        type: 'taskStarted',
        data
      });
    });

    this.orchestrator.on('taskCompleted', (data) => {
      this.broadcastWebSocket({
        type: 'taskCompleted',
        data
      });
    });

    this.orchestrator.on('taskFailed', (data) => {
      this.broadcastWebSocket({
        type: 'taskFailed',
        data
      });
    });

    // Start the orchestrator
    this.orchestrator.start();
  }

  /**
   * Broadcast message to all WebSocket clients
   */
  private broadcastWebSocket(message: any): void {
    if (!this.wss) return;

    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Start the server
   */
  start(): void {
    this.app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('HVR 6.0 Multi-Agent System initialized');
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down server...');
    this.orchestrator.stop();
    
    if (this.wss) {
      this.wss.close();
    }

    logger.info('Server shutdown complete');
    process.exit(0);
  }
}

// Initialize and start server
const server = new Server();
server.start();

// Handle graceful shutdown
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());
