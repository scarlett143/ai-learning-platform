import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext, collectStream, Quiz } from '../harness';

describe('Tier 1: Feature 8 - Multi-Provider LLM Engine', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T1-LLM-01: Token Streaming via streamText()', async () => {
    const streamResult = await collectStream(async onChunk => {
      return await context.llm.streamText('Explain closures in JavaScript', onChunk);
    });

    expect(streamResult.tokenCount).toBeGreaterThan(1);
    expect(streamResult.fullText).toContain('closure');
    expect(streamResult.chunks.join('')).toBe(streamResult.fullText);
  });

  it('E2E-T1-LLM-02: Structured JSON Generation via generateJSON<T>()', async () => {
    const quiz = await context.llm.generateJSON<Quiz>('Generate a quiz for JavaScript Async I/O');

    expect(quiz).toBeDefined();
    expect(quiz.questions.length).toBeGreaterThanOrEqual(1);
    expect(quiz.questions[0]).toHaveProperty('question');
    expect(quiz.questions[0]).toHaveProperty('options');
    expect(quiz.questions[0]).toHaveProperty('correctIndex');
    expect(quiz.questions[0]).toHaveProperty('concept');
  });

  it('E2E-T1-LLM-03: Active Provider Identification', async () => {
    // In zero-config/mock mode, provider name is 'mock'
    const provider = context.llm.getProviderName();
    expect(['mock', 'gemini', 'openai']).toContain(provider);
    expect(provider).toBe('mock');
  });

  it('E2E-T1-LLM-04: Domain-Aware Mock Generator Responses', async () => {
    // Socratic response on bug query
    const bugHelp = await context.journey.askMentor('Give me the code to solve the React hook bug');
    expect(bugHelp.fullText).toContain('step-by-step');
    expect(bugHelp.fullText.toLowerCase()).toContain('hook');

    // Career pivot response
    const pivotHelp = await context.journey.askMentor('Should I switch to AI/ML?');
    expect(pivotHelp.fullText).toContain('Python');
    expect(pivotHelp.fullText).toContain('AI/ML');
  });

  it('E2E-T1-LLM-05: LLM Options Pass-Through', async () => {
    let receivedTokens = 0;
    const text = await context.llm.streamText(
      'Explain JavaScript promises',
      _chunk => {
        receivedTokens++;
      },
      { temperature: 0.2, maxTokens: 250, systemPrompt: 'You are a senior tutor.' }
    );

    expect(text).toBeDefined();
    expect(receivedTokens).toBeGreaterThan(0);
  });
});
