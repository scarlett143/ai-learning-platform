import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as evaluate } from '@/app/api/agents/evaluate/route';
import { POST as chat } from '@/app/api/chat/route';
import { POST as analyze } from '@/app/api/agents/analyze/route';
import { POST as plan } from '@/app/api/agents/plan/route';

const req = (url: string, body: unknown) =>
  new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

describe('API input validation', () => {
  it('evaluate: rejects malformed JSON with 400', async () => {
    expect((await evaluate(req('/api/agents/evaluate', '{not json'))).status).toBe(400);
  });
  it('evaluate: rejects missing moduleId', async () => {
    expect((await evaluate(req('/api/agents/evaluate', { action: 'generate' }))).status).toBe(400);
  });
  it('evaluate: rejects mismatched answer arrays', async () => {
    const res = await evaluate(req('/api/agents/evaluate', {
      action: 'evaluate', moduleId: 'm1', questions: [{}, {}], selectedAnswers: [0],
    }));
    expect(res.status).toBe(400);
  });
  it('evaluate: generate returns questions for a valid module', async () => {
    const res = await evaluate(req('/api/agents/evaluate', { action: 'generate', moduleId: 'm1', moduleTitle: 'React' }));
    expect(res.status).toBe(200);
    expect(Array.isArray((await res.json()).questions)).toBe(true);
  });
  it('chat: rejects empty and oversized messages', async () => {
    expect((await chat(req('/api/chat', { message: '' }))).status).toBe(400);
    expect((await chat(req('/api/chat', { message: 'x'.repeat(2001) }))).status).toBe(400);
  });
  it('chat: streams a reply and reports the provider (mock without a key)', async () => {
    const res = await chat(req('/api/chat', { message: 'help with react', userId: 'u1', context: 'Goal: Full Stack' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('x-llm-provider')).toBe('mock');
    expect((await res.text()).length).toBeGreaterThan(20);
  });
  it('analyze: rejects non-array and oversized skill lists, accepts a valid profile', async () => {
    expect((await analyze(req('/api/agents/analyze', { skills: 'x' }))).status).toBe(400);
    expect((await analyze(req('/api/agents/analyze', { skills: new Array(201).fill({}) }))).status).toBe(400);
    expect((await analyze(req('/api/agents/analyze', '{bad json'))).status).toBe(400);
  });
  it('plan: rejects malformed reports', async () => {
    expect((await plan(req('/api/agents/plan', { missingSkills: 'nope' }))).status).toBe(400);
    expect((await plan(req('/api/agents/plan', { missingSkills: new Array(201).fill({}) }))).status).toBe(400);
  });
  it('rejects oversized request bodies with 413 before parsing', async () => {
    const big = new NextRequest('http://localhost/api/agents/analyze', {
      method: 'POST', headers: { 'content-type': 'application/json', 'content-length': '500000' }, body: '{}',
    });
    expect((await analyze(big)).status).toBe(413);
  });
});
