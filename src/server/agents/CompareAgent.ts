import { BaseAgent } from './BaseAgent';
import { AgentType, AgentTask, Job, LogEntry, ComparisonResult } from '../../shared/types';
import { logger } from '../utils/logger';

/**
 * Compare Agent - Handles data verification and validation
 * Compares source and target data to ensure synchronization
 */
export class CompareAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.COMPARE,
      'Compare Agent',
      ['data_comparison', 'checksum_validation', 'row_count_verification', 'discrepancy_detection']
    );
  }

  protected async performTask(task: AgentTask, job: Job): Promise<void> {
    logger.info(`CompareAgent: Starting comparison for channel ${task.parameters.channelId}`);

    const tables = task.parameters.tables || [];
    const totalTables = tables.length;
    let processedTables = 0;
    let totalDiscrepancies = 0;

    for (const table of tables) {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level: 'INFO',
        message: `Comparing table ${table.sourceSchema}.${table.sourceTable}`,
        metadata: { table }
      };
      job.logs = job.logs || [];
      job.logs.push(logEntry);

      const result = await this.compareTable(table, job);
      totalDiscrepancies += result.discrepancies;
      
      processedTables++;
      job.progress = Math.round((processedTables / totalTables) * 100);
      
      logger.info(`CompareAgent: Compared table ${table.sourceTable} - found ${result.discrepancies} discrepancies`);
    }

    job.recordsProcessed = task.parameters.estimatedRows || 0;
    
    if (totalDiscrepancies > 0) {
      const warnEntry: LogEntry = {
        timestamp: new Date(),
        level: 'WARN',
        message: `Found ${totalDiscrepancies} total discrepancies across ${totalTables} tables`,
        metadata: { totalDiscrepancies, tables: totalTables }
      };
      job.logs = job.logs || [];
      job.logs.push(warnEntry);
    }

    logger.info(`CompareAgent: Comparison complete - ${totalDiscrepancies} discrepancies found`);
  }

  private async compareTable(table: any, job: Job): Promise<{ discrepancies: number }> {
    // Simulate comparison operation
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulate random discrepancies (usually 0, occasionally some)
    const discrepancies = Math.random() > 0.9 ? Math.floor(Math.random() * 10) : 0;

    if (discrepancies > 0) {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level: 'WARN',
        message: `Found ${discrepancies} discrepancies in table ${table.sourceTable}`,
        metadata: { table: table.sourceTable, count: discrepancies }
      };
      job.logs = job.logs || [];
      job.logs.push(logEntry);
    }

    return { discrepancies };
  }
}
