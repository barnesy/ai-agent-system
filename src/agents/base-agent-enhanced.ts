import { BaseAgent, AgentMessage, AgentCapabilities } from './base-agent';
import { mockAIProvider } from '../ai/mock-provider';

export abstract class BaseAgentEnhanced extends BaseAgent {
  protected aiProvider = mockAIProvider;

  constructor(name: string, capabilities: AgentCapabilities) {
    super(name, capabilities);
  }

  async execute(message: AgentMessage): Promise<AgentMessage> {
    // Generate prompt for AI
    const prompt = this.generatePrompt(message);
    
    // Get AI response with realistic delay
    const aiResponse = await this.aiProvider.generateResponse(prompt);
    
    // Calculate token usage
    const tokenUsage = this.aiProvider.calculateTokenUsage(prompt, aiResponse);
    
    // Process the response
    const processedResponse = this.processAIResponse(aiResponse, message);
    
    return {
      from: this.name,
      to: message.from,
      type: 'response',
      payload: processedResponse,
      timestamp: new Date()
    };
  }

  protected generatePrompt(message: AgentMessage): string {
    const systemPrompt = this.getSystemPrompt();
    return `${systemPrompt}\n\nTask: ${message.payload.task}\nContext: ${JSON.stringify(message.payload.context || {})}`;
  }

  protected getSystemPrompt(): string {
    return `You are the ${this.name}, a specialized AI agent in a modular system.
Your role is to handle tasks related to your specialization with expertise and precision.`;
  }

  protected processAIResponse(aiResponse: string, originalMessage: AgentMessage): any {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(aiResponse);
      return {
        task: `${this.name} completed: ${originalMessage.payload.task}`,
        context: parsed,
        priority: originalMessage.payload.priority
      };
    } catch {
      // Fallback to string response
      return {
        task: `${this.name} completed: ${originalMessage.payload.task}`,
        context: { response: aiResponse },
        priority: originalMessage.payload.priority
      };
    }
  }

  getTokenUsage(): { input: number; output: number; cost: number } | null {
    // This would be tracked per execution in a real implementation
    return null;
  }
}