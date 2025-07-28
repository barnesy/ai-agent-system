import { BaseAgentWithMemory } from './base-agent-with-memory';
import { AgentMessage, AgentCapabilities } from './base-agent';
import { AIProvider, AIRequestOptions } from '../ai-providers/types';
import { getProviderFromEnv } from '../ai-providers/provider-factory';

/**
 * Base Agent with Real AI Integration
 * Uses actual AI providers (OpenAI, Anthropic, etc.)
 */
export abstract class BaseAgentAI extends BaseAgentWithMemory {
  protected aiProvider: AIProvider;
  protected model?: string;
  protected temperature: number = 0.7;
  protected maxTokens: number = 2000;

  constructor(name: string, capabilities: AgentCapabilities, aiProvider?: AIProvider) {
    super(name, capabilities);
    this.aiProvider = aiProvider || getProviderFromEnv();
  }

  async execute(message: AgentMessage): Promise<AgentMessage> {
    try {
      // Load context (from memory system)
      const context = await this.loadContext(message);
      
      // Build the prompt
      const prompt = this.buildPrompt(message, context);
      
      // Get AI response
      const options: AIRequestOptions = {
        model: this.model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
        systemPrompt: this.getSystemPrompt(),
        responseFormat: 'json'
      };

      const aiResponse = await this.aiProvider.generateResponse(prompt, options);

      // Update metrics with actual token usage
      if (aiResponse.usage) {
        const { metricsCollector } = await import('../metrics/collector');
        metricsCollector.addTokenUsage(
          this.name,
          aiResponse.usage.inputTokens,
          aiResponse.usage.outputTokens,
          aiResponse.cost
        );
      }

      // Parse and structure the response
      const structuredResponse = this.parseAIResponse(aiResponse.content, message);

      // Create response message
      const responseMessage: AgentMessage = {
        from: this.name,
        to: message.from,
        type: 'response',
        payload: structuredResponse,
        timestamp: new Date()
      };

      // Store in memory (handled by parent class)
      await this.storeConversationMemory(message, responseMessage);
      await this.updateContext(responseMessage);

      return responseMessage;
    } catch (error) {
      console.error(`${this.name} AI execution error:`, error);
      
      // Fallback to base implementation if AI fails
      return super.execute(message);
    }
  }

  protected buildPrompt(message: AgentMessage, context: any): string {
    let prompt = `Task: ${message.payload.task}\n`;

    if (message.payload.context) {
      prompt += `\nProvided Context:\n${JSON.stringify(message.payload.context, null, 2)}\n`;
    }

    if (context.relevantMemories?.length > 0) {
      prompt += `\nRelevant Previous Work:\n`;
      context.relevantMemories.forEach((memory: any, index: number) => {
        prompt += `${index + 1}. ${JSON.stringify(memory.content).substring(0, 200)}...\n`;
      });
    }

    if (context.sharedKnowledge && Object.keys(context.sharedKnowledge).length > 0) {
      prompt += `\nShared Knowledge:\n${JSON.stringify(context.sharedKnowledge, null, 2)}\n`;
    }

    if (message.payload.constraints && message.payload.constraints.length > 0) {
      prompt += `\nConstraints:\n${message.payload.constraints.join('\n')}\n`;
    }

    prompt += `\nPlease provide a detailed response in JSON format.`;

    return prompt;
  }

  protected parseAIResponse(content: string, originalMessage: AgentMessage): any {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      
      // Ensure required fields
      return {
        task: parsed.task || `${this.name} completed: ${originalMessage.payload.task}`,
        ...parsed,
        context: {
          ...parsed.context,
          model: this.aiProvider.name,
          timestamp: new Date().toISOString()
        },
        priority: originalMessage.payload.priority
      };
    } catch {
      // If not valid JSON, structure the response
      return {
        task: `${this.name} completed: ${originalMessage.payload.task}`,
        response: content,
        context: {
          model: this.aiProvider.name,
          timestamp: new Date().toISOString()
        },
        priority: originalMessage.payload.priority
      };
    }
  }

  async streamExecute(
    message: AgentMessage,
    onChunk: (chunk: string) => void
  ): Promise<AgentMessage> {
    if (!this.aiProvider.streamResponse) {
      // Fallback to regular execution if streaming not supported
      return this.execute(message);
    }

    try {
      const context = await this.loadContext(message);
      const prompt = this.buildPrompt(message, context);
      
      const options: AIRequestOptions = {
        model: this.model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
        systemPrompt: this.getSystemPrompt(),
        stream: true
      };

      let fullContent = '';
      for await (const chunk of this.aiProvider.streamResponse(prompt, options)) {
        fullContent += chunk;
        onChunk(chunk);
      }

      // Structure the final response
      const structuredResponse = this.parseAIResponse(fullContent, message);

      const responseMessage: AgentMessage = {
        from: this.name,
        to: message.from,
        type: 'response',
        payload: structuredResponse,
        timestamp: new Date()
      };

      // Store in memory
      await this.storeConversationMemory(message, responseMessage);
      await this.updateContext(responseMessage);

      return responseMessage;
    } catch (error) {
      console.error(`${this.name} streaming error:`, error);
      return this.execute(message);
    }
  }

  setModel(model: string): void {
    this.model = model;
  }

  setTemperature(temperature: number): void {
    this.temperature = Math.max(0, Math.min(1, temperature));
  }

  setMaxTokens(maxTokens: number): void {
    const maxAllowed = this.aiProvider.getMaxTokens();
    this.maxTokens = Math.min(maxTokens, maxAllowed);
  }

  getTokenUsage(): { input: number; output: number; cost: number } | null {
    // This would be tracked from actual AI responses
    return null;
  }

  async testConnection(): Promise<boolean> {
    if (this.aiProvider.testConnection) {
      return this.aiProvider.testConnection();
    }
    // Default test if provider doesn't implement testConnection
    try {
      await this.execute({
        from: 'test',
        to: this.name,
        type: 'request',
        payload: { task: 'test', priority: 'low' },
        timestamp: new Date()
      });
      return true;
    } catch {
      return false;
    }
  }
}