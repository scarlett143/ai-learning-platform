import { describe, it, expect, vi, afterEach } from 'vitest';
import { GeminiProvider } from '@/services/llm';

const sse = (...texts: string[]) =>
  new Response(
    texts.map(t => `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: t }] } }] })}\n\n`).join(''),
    { status: 200 }
  );

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('GeminiProvider', () => {
  it('streams tokens from an SSE response and reports gemini', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sse('Hello ', 'world')));
    const llm = new GeminiProvider('test-key');
    const tokens: string[] = [];
    const full = await llm.streamText('hi', t => tokens.push(t));
    expect(tokens).toEqual(['Hello ', 'world']);
    expect(full).toBe('Hello world');
    expect(llm.getProviderName()).toBe('gemini');
  });

  it('falls back to demo mode on a quota error and says so', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'credits depleted' } }), { status: 402 })));
    const llm = new GeminiProvider('test-key');
    const out = await llm.streamText('explain react', () => {});
    expect(out.length).toBeGreaterThan(20);
    expect(llm.getProviderName()).toBe('mock');
  });

  it('sends the key as a header, never in the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sse('ok'));
    vi.stubGlobal('fetch', fetchMock);
    await new GeminiProvider('secret-key').streamText('hi', () => {});
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain('secret-key');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('secret-key');
  });

  it('generateJSON parses structured output and throws on failure', async () => {
    const ok = new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"a":1}' }] } }] }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(ok).mockResolvedValueOnce(new Response('{}', { status: 500 })));
    const llm = new GeminiProvider('k');
    expect(await llm.generateJSON<{ a: number }>('x')).toEqual({ a: 1 });
    await expect(llm.generateJSON('x')).rejects.toThrow('Gemini HTTP 500');
  });
});
