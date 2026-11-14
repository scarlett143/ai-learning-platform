'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { RoadmapModule, QuizQuestion, AssessmentResult } from '@/types';
import { AssessmentEvaluatorAgent } from '@/services/agents/assessment-evaluator';

interface AssessmentModalProps {
  module: RoadmapModule | null;
  onClose: () => void;
  onComplete: (result: AssessmentResult) => void;
  userId: string;
}

export function AssessmentModal({ module, onClose, onComplete, userId }: AssessmentModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (module) {
      const generated = AssessmentEvaluatorAgent.generateQuiz(module.id, module.title);
      setQuestions(generated);
      setSelectedAnswers(new Array(generated.length).fill(-1));
      setResult(null);
    }
  }, [module]);

  if (!module) return null;

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (result) return; // Prevent changing after submission
    const updated = [...selectedAnswers];
    updated[qIdx] = optIdx;
    setSelectedAnswers(updated);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const evalResult = AssessmentEvaluatorAgent.evaluateQuiz(
      userId,
      module.id,
      module.title,
      questions,
      selectedAnswers
    );
    setResult(evalResult);
    setIsSubmitting(false);
    onComplete(evalResult);
  };

  const allAnswered = selectedAnswers.every(ans => ans !== -1);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="assessment-title" className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-accent-500/10 text-accent-400 border border-accent-500/20">
                Assessment Evaluator Agent
              </span>
              <span className="text-xs text-muted-foreground">Mastery Benchmark: 70%</span>
            </div>
            <h2 id="assessment-title" className="text-base font-bold text-foreground mt-0.5">{module.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close assessment" className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quiz Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Result Banner if already evaluated */}
          {result && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                result.passed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {result.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  )}
                  <span>
                    {result.passed
                      ? `Passed with ${result.score}% Score!`
                      : `Score: ${result.score}% — Below 70% Benchmark`}
                  </span>
                </div>
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-stone-950/40">
                  {result.passed ? 'Advance' : 'Remediation Active'}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{result.feedback}</p>
            </div>
          )}

          {/* Question Cards */}
          {questions.map((q, qIdx) => {
            const selected = selectedAnswers[qIdx];
            const answerDetail = result?.answers[qIdx];

            return (
              <div key={q.id} className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {qIdx + 1}. {q.prompt}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono shrink-0">
                    {q.skillName}
                  </span>
                </div>

                {/* Radio Options */}
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selected === optIdx;
                    let optionStyle = 'border-border bg-card/60 hover:border-accent-500/40 text-foreground';

                    if (result) {
                      if (optIdx === q.correctIndex) {
                        optionStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-medium';
                      } else if (isSelected && !answerDetail?.correct) {
                        optionStyle = 'border-rose-500 bg-rose-500/15 text-rose-300';
                      } else {
                        optionStyle = 'border-border opacity-50';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-accent-500 bg-accent-500/15 text-accent-300 font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={!!result}
                        aria-pressed={isSelected}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`w-full text-left p-2.5 rounded-lg border transition flex items-center gap-3 text-xs ${optionStyle}`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                            isSelected ? 'border-accent-400 bg-accent-400 text-stone-950' : 'border-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on Post-Submit */}
                {result && (
                  <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/40">
                    <strong className="text-foreground">Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/40">
          <div className="text-xs text-muted-foreground">
            {!result ? (
              <span>{selectedAnswers.filter(a => a !== -1).length} of {questions.length} answered</span>
            ) : (
              <span>Evaluation recorded on Agent Event Bus</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!result ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className="px-5 py-2 rounded-xl bg-accent-400 hover:bg-accent-300 disabled:opacity-50 text-stone-950 font-semibold text-xs transition shadow-sm"
              >
                Submit for Evaluation
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-accent-400 hover:bg-accent-300 text-stone-950 font-semibold text-xs transition shadow-sm"
              >
                Return to Roadmap
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
