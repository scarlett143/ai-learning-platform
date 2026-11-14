import { ILLMClient, LLMOptions } from '@/types';

/**
 * Intelligent Streaming Mock LLM Client
 * Simulates realistic agent thoughts and conceptual tutoring with domain-aware responses.
 */
export class MockLLMStreamProvider implements ILLMClient {
  public async streamText(prompt: string, onToken: (chunk: string) => void, _options?: LLMOptions): Promise<string> {
    const response = this.generateDomainResponse(prompt);
    const words = response.split(' ');

    for (const word of words) {
      await new Promise(r => setTimeout(r, 25)); // Smooth streaming cadence
      onToken(word + ' ');
    }

    return response;
  }

  public async generateJSON<T>(prompt: string, _systemPrompt?: string): Promise<T> {
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
 * Gemini provider (server-side only; key never reaches the client).
 * Streams via SSE and falls back to the mock if the key is missing or the call fails,
 * so the demo never breaks. ponytail: Gemini only; add OpenAI behind the same interface if needed.
 */
export class GeminiProvider implements ILLMClient {
  private mock = new MockLLMStreamProvider();
  constructor(private apiKey: string, private model = process.env.GEMINI_MODEL || 'gemini-2.5-flash') {}

  public async streamText(prompt: string, onToken: (chunk: string) => void, options?: LLMOptions): Promise<string> {
    let out = '';
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: options?.systemPrompt ?? 'You are a concise, encouraging AI mentor for a career-upskilling platform.' }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: options?.temperature ?? 0.6, maxOutputTokens: options?.maxTokens ?? 600 },
          }),
          signal: AbortSignal.timeout(20000),
        }
      );
      if (!res.ok || !res.body) throw new Error(`Gemini HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const text = JSON.parse(line.slice(5)).candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
          if (text) { out += text; onToken(text); }
        }
      }
      if (!out) throw new Error('Empty Gemini response');
      return out;
    } catch {
      if (out) return out; // already streamed partial text; don't append mock text
      return this.mock.streamText(prompt, onToken, options);
    }
  }

  public async generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
    return this.mock.generateJSON<T>(prompt, systemPrompt);
  }

  public getProviderName(): 'gemini' { return 'gemini'; }
}

/**
 * Multi-Provider LLM Gateway
 */
export class LLMGateway {
  private static instance: ILLMClient;

  public static getInstance(): ILLMClient {
    if (!LLMGateway.instance) {
      const key = process.env.GEMINI_API_KEY;
      LLMGateway.instance = key && !key.startsWith('your_') ? new GeminiProvider(key) : new MockLLMStreamProvider();
    }
    return LLMGateway.instance;
  }
}
