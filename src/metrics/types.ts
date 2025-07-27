/**
 * Metrics Types
 * Defines the structure for performance tracking
 */

export interface TaskMetrics {
  id: string;
  taskType: 'bug-fix' | 'feature' | 'review' | 'custom';
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  
  // Agent breakdown
  agentMetrics: AgentMetric[];
  
  // Quality metrics
  quality: QualityMetrics;
  
  // Comparison data
  comparison?: ComparisonMetrics;
  
  // User feedback
  userRating?: number; // 1-5
  userFeedback?: string;
}

export interface AgentMetric {
  agentName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tokenUsage?: {
    input: number;
    output: number;
    cost: number;
  };
  success: boolean;
  error?: string;
}

export interface QualityMetrics {
  codeQualityScore?: number; // 0-100
  testCoverage?: number; // percentage
  bugsIntroduced?: number;
  linesOfCode?: number;
  complexity?: number;
  documentationScore?: number;
}

export interface ComparisonMetrics {
  // Time comparisons
  manualTime?: number; // estimated manual time in minutes
  aiTime: number; // actual AI time in minutes
  timeImprovement: number; // percentage
  
  // Quality comparisons
  manualQuality?: QualityMetrics;
  aiQuality: QualityMetrics;
  
  // Cost comparisons
  manualCost?: number; // developer hourly rate * time
  aiCost: number; // API costs
  costSavings: number; // percentage
}

export interface DashboardData {
  summary: {
    totalTasks: number;
    averageTimeImprovement: number;
    averageQualityScore: number;
    totalCostSavings: number;
    userSatisfaction: number;
  };
  
  taskBreakdown: {
    bugFixes: number;
    features: number;
    reviews: number;
    custom: number;
  };
  
  timeAnalysis: {
    averageTaskTime: number;
    fastestTask: TaskMetrics;
    slowestTask: TaskMetrics;
    timeByTaskType: Record<string, number>;
  };
  
  qualityAnalysis: {
    averageQualityScore: number;
    qualityTrend: Array<{ date: Date; score: number }>;
    bestQualityTask: TaskMetrics;
  };
  
  agentAnalysis: {
    mostUsedAgent: string;
    agentPerformance: Record<string, {
      tasksCompleted: number;
      averageTime: number;
      successRate: number;
    }>;
  };
}