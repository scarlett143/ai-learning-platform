import { ILLMClient, LLMOptions, StreamCaptureResult, Quiz } from './types';

export class MockLLMStreamProvider implements ILLMClient {
  private speed: 'instant' | 'realistic';
  private queuedResponses: Array<{ pattern: RegExp | string; response: string }> = [];
  private queuedJSON: Array<{ pattern: RegExp | string; response: any }> = [];

  constructor(options?: { speed?: 'instant' | 'realistic' }) {
    this.speed = options?.speed || 'instant';
  }

  public getProviderName(): 'openai' | 'anthropic' | 'gemini' | 'mock' {
    return 'mock';
  }

  public setSpeed(speed: 'instant' | 'realistic'): void {
    this.speed = speed;
  }

  public queueResponse(pattern: RegExp | string, response: string): void {
    this.queuedResponses.push({ pattern, response });
  }

  public queueJSON(pattern: RegExp | string, response: any): void {
    this.queuedJSON.push({ pattern, response });
  }

  public async streamText(
    prompt: string,
    onToken: (chunk: string) => void,
    options?: LLMOptions & { signal?: AbortSignal }
  ): Promise<string> {
    if (!prompt || prompt.trim() === '') {
      throw new Error('ValidationError: Prompt cannot be empty');
    }

    // Check queued responses
    let textToStream = '';
    const queuedIdx = this.queuedResponses.findIndex(q =>
      typeof q.pattern === 'string' ? prompt.includes(q.pattern) : q.pattern.test(prompt)
    );

    if (queuedIdx !== -1) {
      textToStream = this.queuedResponses[queuedIdx].response;
      this.queuedResponses.splice(queuedIdx, 1);
    } else {
      textToStream = this.generateRealisticDomainResponse(prompt);
    }

    // Split text into tokens / chunks
    const chunks = this.tokenize(textToStream);
    const speed = options?.speed || this.speed;

    for (let i = 0; i < chunks.length; i++) {
      if (options?.signal?.aborted) {
        throw new Error('AbortError: Stream was aborted by client');
      }

      const chunk = chunks[i];
      if (chunk !== null && chunk !== undefined && chunk !== '') {
        onToken(chunk);
      }

      if (speed === 'realistic') {
        await new Promise(r => setTimeout(r, 10));
      } else {
        // Microtask yield in instant mode to simulate async stream semantics
        await Promise.resolve();
      }
    }

    return textToStream;
  }

  public async generateJSON<T>(prompt: string): Promise<T> {
    if (!prompt || prompt.trim() === '') {
      throw new Error('ValidationError: Prompt cannot be empty for JSON generation');
    }

    const queuedIdx = this.queuedJSON.findIndex(q =>
      typeof q.pattern === 'string' ? prompt.includes(q.pattern) : q.pattern.test(prompt)
    );

    if (queuedIdx !== -1) {
      const res = this.queuedJSON[queuedIdx].response;
      this.queuedJSON.splice(queuedIdx, 1);
      return res as T;
    }

    // Generate domain JSON based on prompt keywords
    const lower = prompt.toLowerCase();
    if (lower.includes('quiz') || lower.includes('assessment')) {
      const quiz: Quiz = {
        id: `quiz-gen-${Date.now()}`,
        moduleId: 'target-module',
        title: 'Generated Assessment',
        questions: [
          {
            id: 'q1',
            question: 'What is the main advantage of asynchronous non-blocking I/O?',
            options: [
              'Increased throughput without blocking execution threads',
              'Faster disk spin speed',
              'Automatic database indexing',
              'Elimination of all bugs',
            ],
            correctIndex: 0,
            concept: 'Async I/O',
          },
          {
            id: 'q2',
            question: 'In React, what triggers a component re-render?',
            options: [
              'Mutating a local variable',
              'Calling setState or updating context',
              'Changing file permissions',
              'Refreshing the terminal',
            ],
            correctIndex: 1,
            concept: 'State Management',
          },
          {
            id: 'q3',
            question: 'How do you prevent SQL injection vulnerabilities?',
            options: [
              'Using parameterized queries and prepared statements',
              'Concatenating raw user strings',
              'Capitalizing SELECT keywords',
              'Storing passwords in plain text',
            ],
            correctIndex: 0,
            concept: 'SQL Security',
          },
        ],
      };
      return quiz as unknown as T;
    }

    if (lower.includes('curriculum') || lower.includes('roadmap') || lower.includes('module')) {
      return {
        modules: [
          {
            id: 'mod-dyn-1',
            title: 'Foundational Competencies',
            description: 'Core concepts, syntax, and architectural patterns.',
            category: 'Core',
            estimatedHours: 12,
            lessons: [{ id: 'l1', title: 'Introductory Concepts' }],
            codeSnippets: [{ language: 'typescript', code: '// sample code' }],
            exercises: [{ id: 'e1', prompt: 'Implement basic pattern' }],
          },
        ],
      } as unknown as T;
    }

    // Generic JSON fallback
    return {
      status: 'success',
      data: 'Structured domain response generated',
      timestamp: new Date().toISOString(),
    } as unknown as T;
  }

  private generateRealisticDomainResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('closure') || lower.includes('closures')) {
      return (
        "In JavaScript, a closure is the combination of a function bundled together with references to its surrounding lexical state (the lexical environment). " +
        "In other words, a closure gives you access to an outer function's scope from an inner function. " +
        "Closures are created every time a function is created, at function creation time. " +
        "Practical uses include data encapsulation (private variables), currying, and event handlers."
      );
    }

    if (lower.includes('give me the code') || lower.includes('solve') || lower.includes('bug')) {
      return (
        "Let's look at this step-by-step rather than jumping straight to the solution. " +
        "First, what is the exact error message or unexpected behavior you are seeing? " +
        "Second, consider what dependencies your React hook is watching in its dependency array. " +
        "If state updates during render, could that cause an infinite loop? Try logging the state before the effect runs."
      );
    }

    if (lower.includes('switch') || lower.includes('pivot') || lower.includes('ai/ml')) {
      return (
        "Transitioning from Full Stack Development to AI/ML is a strategic career move. " +
        "Your strong background in Python and SQL will transfer directly to data ingestion and feature pipelines. " +
        "The primary gaps you should focus on are Linear Algebra, Statistical Modeling, and PyTorch fundamentals. " +
        "We can calibrate your roadmap to preserve your completed modules while accelerating these new machine learning competencies."
      );
    }

    return (
      "I am your AI Learning Copilot. I analyze your skill trajectory, guide your hands-on coding practice, " +
      "and help you overcome conceptual hurdles through interactive problem solving and targeted exercises."
    );
  }

  private tokenize(text: string): string[] {
    // Break into realistic word-level chunks (1-3 words per chunk)
    const words = text.split(/(\s+)/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 2) {
      const part1 = words[i] || '';
      const part2 = words[i + 1] || '';
      chunks.push(part1 + part2);
    }
    return chunks.length > 0 ? chunks : [text];
  }
}

export async function collectStream(
  streamFn: (onChunk: (chunk: string) => void) => Promise<string>
): Promise<StreamCaptureResult> {
  const chunks: string[] = [];
  const start = Date.now();
  const fullText = await streamFn(chunk => {
    chunks.push(chunk);
  });
  const durationMs = Date.now() - start;

  return {
    fullText,
    chunks,
    tokenCount: chunks.length,
    durationMs,
  };
}
