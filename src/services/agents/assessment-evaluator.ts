import { QuizQuestion, AssessmentResult } from '@/types';
import { AgentEventBus } from '@/lib/event-bus';

export class AssessmentEvaluatorAgent {
  /**
   * Generates tailored quiz questions for a given learning module.
   */
  public static generateQuiz(moduleId: string, moduleTitle: string): QuizQuestion[] {
    const bus = AgentEventBus.getInstance();

    bus.recordFeedEvent({
      userId: 'active-session',
      agentName: 'Assessment Evaluator',
      type: 'agent:assessment:generating',
      message: `Generating conceptual questions and mini-scenarios for "${moduleTitle}"...`,
    });

    const lower = moduleTitle.toLowerCase();

    if (lower.includes('javascript') || lower.includes('es6')) {
      return [
        {
          id: 'q1',
          prompt: 'Which JavaScript mechanism handles microtasks like resolved Promise callbacks?',
          options: ['Event Loop Macrotask Queue', 'Microtask Queue', 'Render Tree Dispatcher', 'Call Stack Allocator'],
          correctIndex: 1,
          explanation: 'Promises and queueMicrotask enqueue callbacks in the Microtask Queue, which executes before the next macrotask.',
          skillName: 'JavaScript Asynchronous Engine',
        },
        {
          id: 'q2',
          prompt: 'What happens when you declare a variable with `const` in ES6?',
          options: [
            'Its value becomes deeply immutable',
            'Its variable identifier cannot be reassigned in the scope',
            'It is hoisted to the global object',
            'It can only hold primitive strings and numbers',
          ],
          correctIndex: 1,
          explanation: '`const` prevents reassigning the identifier binding, though properties of objects/arrays may still be mutated.',
          skillName: 'JavaScript ES6 Syntax',
        },
        {
          id: 'q3',
          prompt: 'In JavaScript closures, what does an inner function retain access to?',
          options: [
            'Only parameters of the outer function',
            'The lexical environment where it was declared',
            'The global window object exclusively',
            'Variables allocated in the Garbage Collector pool only',
          ],
          correctIndex: 1,
          explanation: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment.',
          skillName: 'JavaScript Scoping & Closures',
        },
      ];
    }

    if (lower.includes('react')) {
      return [
        {
          id: 'q1',
          prompt: 'Why should state setters in React be called with updater functions when relying on previous state (e.g. `setCount(c => c + 1)`)?',
          options: [
            'To force synchronous DOM repainting',
            'To avoid race conditions and stale closure values in batched updates',
            'To bypass React Fiber reconciler',
            'To convert the state into a mutable variable',
          ],
          correctIndex: 1,
          explanation: 'Functional state updates guarantee reading the most up-to-date pending state during batched re-renders.',
          skillName: 'React Declarative State',
        },
        {
          id: 'q2',
          prompt: 'What does an empty dependency array `[]` in `useEffect` signify?',
          options: [
            'The effect executes on every single component render',
            'The effect runs only once after the initial mount',
            'The effect is disabled and will never run',
            'The effect executes synchronously before browser paint',
          ],
          correctIndex: 1,
          explanation: 'An empty dependency array instructs React to run the effect callback only once after initial mount and run cleanup on unmount.',
          skillName: 'React Lifecycle & Effects',
        },
        {
          id: 'q3',
          prompt: 'Which hook provides a persistent mutable reference that does NOT trigger re-renders when changed?',
          options: ['useState', 'useMemo', 'useRef', 'useCallback'],
          correctIndex: 2,
          explanation: '`useRef` returns a plain JavaScript object whose `.current` property can hold any value without causing component re-render.',
          skillName: 'React Hooks Architecture',
        },
      ];
    }

    // Default Node / Backend Questions
    return [
      {
        id: 'q1',
        prompt: 'In Express.js, what is the role of the `next()` callback within middleware functions?',
        options: [
          'It terminates the HTTP request and sends the response',
          'It passes control to the next matching middleware in the stack',
          'It restarts the Node.js event loop',
          'It serializes the response body into JSON',
        ],
        correctIndex: 1,
        explanation: 'Calling `next()` passes execution to the next middleware or route handler in the Express request pipeline.',
        skillName: 'Node.js Express Middleware',
      },
      {
        id: 'q2',
        prompt: 'Which HTTP status code indicates a client error due to unauthorized missing or invalid credentials?',
        options: ['200 OK', '401 Unauthorized', '404 Not Found', '500 Server Error'],
        correctIndex: 1,
        explanation: '401 Unauthorized indicates that the request requires HTTP authentication or the supplied token is invalid.',
        skillName: 'RESTful API Standards',
      },
      {
        id: 'q3',
        prompt: 'Why is SQL parameterized query binding preferred over string concatenation for database operations?',
        options: [
          'To increase query execution latency',
          'To completely prevent SQL injection vulnerabilities',
          'To compress the SQL payload over network sockets',
          'To bypass database indexing',
        ],
        correctIndex: 1,
        explanation: 'Parameterized queries treat user input strictly as literal values rather than executable SQL syntax, blocking SQL injection.',
        skillName: 'Database Security & SQL',
      },
    ];
  }

  /**
   * Evaluates submitted answers and enforces the 70% mastery threshold.
   */
  public static evaluateQuiz(
    userId: string,
    moduleId: string,
    moduleTitle: string,
    questions: QuizQuestion[],
    selectedAnswers: number[]
  ): AssessmentResult {
    const bus = AgentEventBus.getInstance();
    let correctCount = 0;

    const answersDetail = questions.map((q, idx) => {
      const selected = selectedAnswers[idx] ?? -1;
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selectedIndex: selected,
        correct: isCorrect,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70; // 70% benchmark threshold

    const feedback = passed
      ? `Outstanding! You scored ${score}%, demonstrating solid conceptual mastery of ${moduleTitle}. Proceed to the next milestone.`
      : `Score: ${score}% (Threshold: 70%). Key concepts in ${moduleTitle} require reinforcement. An adaptive remedial module has been inserted into your roadmap.`;

    const result: AssessmentResult = {
      id: `eval-${Date.now()}`,
      userId,
      moduleId,
      moduleTitle,
      score,
      passed,
      evaluatedAt: new Date().toISOString(),
      feedback,
      answers: answersDetail,
    };

    bus.recordFeedEvent({
      userId,
      agentName: 'Assessment Evaluator',
      type: passed ? 'agent:assessment:passed' : 'agent:assessment:failed',
      message: `Evaluated ${moduleTitle}: Score is ${score}%. Verdict: ${passed ? 'PASSED (>=70%)' : 'REMEDIATION TRIGGERED (<70%)'}.`,
      payload: result,
    });

    return result;
  }
}
