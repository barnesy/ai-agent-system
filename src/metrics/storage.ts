import * as fs from 'fs';
import * as path from 'path';
import { TaskMetrics } from './types';

/**
 * Metrics Storage
 * Persists metrics data to disk for historical analysis
 */
export class MetricsStorage {
  private storageDir: string;
  private dataFile: string;

  constructor(storageDir: string = path.join(process.cwd(), '.metrics')) {
    this.storageDir = storageDir;
    this.dataFile = path.join(storageDir, 'metrics.json');
    this.ensureStorageExists();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageExists(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Save metrics to disk
   */
  save(metrics: TaskMetrics[]): void {
    try {
      const data = JSON.stringify(metrics, null, 2);
      fs.writeFileSync(this.dataFile, data, 'utf-8');
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Load metrics from disk
   */
  load(): TaskMetrics[] {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf-8');
        const metrics = JSON.parse(data);
        
        // Convert date strings back to Date objects
        return metrics.map((m: any) => ({
          ...m,
          startTime: new Date(m.startTime),
          endTime: m.endTime ? new Date(m.endTime) : undefined,
          agentMetrics: m.agentMetrics.map((am: any) => ({
            ...am,
            startTime: new Date(am.startTime),
            endTime: am.endTime ? new Date(am.endTime) : undefined
          }))
        }));
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
    return [];
  }

  /**
   * Append a single metric
   */
  append(metric: TaskMetrics): void {
    const metrics = this.load();
    metrics.push(metric);
    this.save(metrics);
  }

  /**
   * Get metrics within a date range
   */
  getByDateRange(start: Date, end: Date): TaskMetrics[] {
    const metrics = this.load();
    return metrics.filter(m => {
      const taskDate = new Date(m.startTime);
      return taskDate >= start && taskDate <= end;
    });
  }

  /**
   * Get metrics by task type
   */
  getByTaskType(taskType: TaskMetrics['taskType']): TaskMetrics[] {
    const metrics = this.load();
    return metrics.filter(m => m.taskType === taskType);
  }

  /**
   * Clear all stored metrics
   */
  clear(): void {
    if (fs.existsSync(this.dataFile)) {
      fs.unlinkSync(this.dataFile);
    }
  }

  /**
   * Export metrics to CSV
   */
  exportToCsv(): string {
    const metrics = this.load();
    if (metrics.length === 0) return '';

    const headers = [
      'ID',
      'Task Type',
      'Description',
      'Start Time',
      'Duration (min)',
      'Agents Used',
      'Quality Score',
      'Time Improvement (%)',
      'Cost Savings (%)',
      'User Rating'
    ];

    const rows = metrics.map(m => [
      m.id,
      m.taskType,
      m.description,
      m.startTime.toISOString(),
      m.duration ? (m.duration / 1000 / 60).toFixed(2) : '',
      m.agentMetrics.length,
      m.quality.codeQualityScore || '',
      m.comparison?.timeImprovement?.toFixed(1) || '',
      m.comparison?.costSavings?.toFixed(1) || '',
      m.userRating || ''
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }
}

// Singleton instance
export const metricsStorage = new MetricsStorage();