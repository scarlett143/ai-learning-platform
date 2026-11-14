import { ILLMClient } from '@/types';

/**
 * Intelligent Streaming Mock LLM Client
 * Simulates realistic agent thoughts and conceptual tutoring with domain-aware responses.
 */
export class MockLLMStreamProvider implements ILLMClient {
  public async streamText(prompt: string, onToken: (chunk: string) => void): Promise<string> {
    const response = this.generateDomainResponse(prompt);
    const words = response.split(' ');

    for (const word of words) {
      await new Promise(r => setTimeout(r, 25)); // Smooth streaming cadence
      onToken(word + ' ');
    }

    return response;
  }

  public async generateJSON<T>(prompt: string): Promise<T> {
    // Generate valid structured JSON based on prompt intent
    return {} as T;
  }

  public getProviderName(): 'gemini' | 'openai' | 'mock' {
    return 'mock';
  }

  private generateDomainResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('full stack') || lower.includes('javascript') || lower.includes('react')) {
      return (
        "As your AI Mentor, let's break down your transition to Full Stack Development. " +
        "Since you already have strong foundations in Python, SQL, and HTML, your core priorities are mastering modern JavaScript (ES6+, asynchronous event loops), " +
        "declarative state management in React, and constructing RESTful microservices in Node.js/Express. " +
        "I've tailored your roadmap to skip basic database and markup theory so you can focus 100% on frontend reactivity and full-stack integration!"
      );
    }

    if (lower.includes('remediat') || lower.includes('failed') || lower.includes('quiz') || lower.includes('score')) {
      return (
        "No worries! Scoring under the 70% threshold is a natural part of mastering complex engineering concepts. " +
        "I have alerted the Curriculum Planner to insert a focused refresher module right before your next milestone. " +
        "Take your time reviewing the code snippets and exercise solutions, and you can re-attempt the assessment whenever you feel ready!"
      );
    }

    if (lower.includes('devops') || lower.includes('docker') || lower.includes('kubernetes')) {
      return (
        "Switching focus to Cloud DevOps & Platform Engineering! " +
        "Your existing Linux and scripting skills provide a solid base. We will immediately prioritize containerization with Docker, " +
        "cluster orchestration with Kubernetes, and end-to-end automation with GitHub Actions CI/CD pipelines."
      );
    }

    if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('pytorch')) {
      return (
        "Targeting AI & Machine Learning Engineering! " +
        "Your existing Python competencies give you a huge advantage. Our primary focus will be tensor operations in PyTorch, " +
        "data pipelines with pandas/NumPy, and building evaluation harnesses for large language models."
      );
    }

    return (
      "I am your dedicated AI Mentor. I continuously collaborate with the Skill Analyzer, Curriculum Planner, and Assessment Evaluator " +
      "to track your milestones, explain complex code, and adjust your personalized learning path based on your real-time performance!"
    );
  }
}

/**
 * Multi-Provider LLM Gateway
 */
export class LLMGateway {
  private static instance: ILLMClient;

  public static getInstance(): ILLMClient {
    if (!LLMGateway.instance) {
      LLMGateway.instance = new MockLLMStreamProvider();
    }
    return LLMGateway.instance;
  }
}
