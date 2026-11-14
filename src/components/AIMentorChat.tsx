'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { AgentMessage } from '@/types';
import { LLMGateway } from '@/services/llm';
import { AgentEventBus } from '@/lib/event-bus';

interface AIMentorChatProps {
  userId: string;
  onPivotGoal?: (newRole: string) => void;
}

export function AIMentorChat({ userId, onPivotGoal }: AIMentorChatProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'm-init',
      userId,
      role: 'assistant',
      agentName: 'AI Mentor',
      content:
        "Hello! I am your AI Mentor. I collaborate with the Skill Analyzer, Curriculum Planner, and Assessment Evaluator " +
        "to guide your journey. Ask me any conceptual question, request study advice, or ask me to pivot your career goal!",
      timestamp: 0,
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isStreaming) return;

    const userMsg: AgentMessage = {
      id: `usr-${Date.now()}`,
      userId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const bus = AgentEventBus.getInstance();
    bus.recordFeedEvent({
      userId,
      agentName: 'AI Mentor',
      type: 'agent:mentor:thinking',
      message: `Analyzing learner query: "${text.slice(0, 40)}..."`,
    });

    // Check for quick goal switch triggers
    const lower = text.toLowerCase();
    if (lower.includes('pivot to devops') || lower.includes('switch to devops')) {
      onPivotGoal?.('devops-engineer');
    } else if (lower.includes('pivot to ai') || lower.includes('switch to ai')) {
      onPivotGoal?.('aiml-engineer');
    }

    const assistantMsgId = `asst-${Date.now()}`;
    const initialAssistantMsg: AgentMessage = {
      id: assistantMsgId,
      userId,
      role: 'assistant',
      agentName: 'AI Mentor',
      content: '',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, initialAssistantMsg]);

    const llm = LLMGateway.getInstance();
    let accumulated = '';

    try {
      await llm.streamText(text, chunk => {
        accumulated += chunk;
        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? { ...m, content: accumulated } : m))
        );
      });
    } catch {
      accumulated = 'I encountered a temporary connection issue. Please ask again!';
      setMessages(prev =>
        prev.map(m => (m.id === assistantMsgId ? { ...m, content: accumulated } : m))
      );
    } finally {
      setIsStreaming(false);
      bus.recordFeedEvent({
        userId,
        agentName: 'AI Mentor',
        type: 'agent:mentor:replied',
        message: 'Delivered contextual tutoring guidance to learner.',
      });
    }
  };

  const PROMPT_CHIPS = [
    'Why learn JavaScript before React?',
    'Explain the JS Microtask Queue',
    'Pivot to Cloud DevOps Goal',
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col h-[400px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">AI Mentor Copilot</h3>
            <span className="text-[10px] text-indigo-400">Collaborative Socratic Tutor</span>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">Stream Provider: Active</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1 text-xs">
        {messages.map(m => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  isUser ? 'bg-cyan-500/20 text-cyan-400' : 'bg-indigo-500/20 text-indigo-400'
                }`}
              >
                {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>
              <div
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-muted/50 border border-border text-foreground rounded-tl-none'
                }`}
              >
                {m.content || (
                  <span className="inline-block animate-pulse text-indigo-400 font-mono">
                    Generating guidance...
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="pt-2 pb-2 flex flex-wrap gap-1.5 border-t border-border/50">
        {PROMPT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            disabled={isStreaming}
            onClick={() => handleSend(chip)}
            className="text-[10px] px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          aria-label="Ask the AI mentor a question"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question or request study advice..."
          disabled={isStreaming}
          className="flex-1 bg-muted/50 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 transition"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!input.trim() || isStreaming}
          className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition shadow-sm"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
