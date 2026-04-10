import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceTestResult {
  testName: string;
  duration: number;
  fps: number;
  droppedFrames: number;
  status: 'pass' | 'warning' | 'fail';
  timestamp: number;
}

interface PerformanceTestSuite {
  name: string;
  tests: PerformanceTestResult[];
  averageFps: number;
  passRate: number;
}

const FPS_THRESHOLDS = {
  pass: 55,
  warning: 30,
  fail: 0,
};

const DURATION_THRESHOLDS = {
  pass: 100,
  warning: 200,
  fail: 500,
};

export function usePerformanceTest() {
  const [results, setResults] = useState<PerformanceTestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const frameTimesRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>(0);

  const measureFPS = useCallback((duration: number): Promise<{ fps: number; droppedFrames: number }> => {
    return new Promise((resolve) => {
      const frameTimes: number[] = [];
      let lastTime = performance.now();
      let droppedFrames = 0;
      const startTime = lastTime;

      const measure = () => {
        const now = performance.now();
        const frameTime = now - lastTime;
        lastTime = now;

        frameTimes.push(frameTime);

        if (frameTime > 33.33) {
          droppedFrames += Math.floor(frameTime / 16.67) - 1;
        }

        if (now - startTime < duration) {
          animationFrameRef.current = requestAnimationFrame(measure);
        } else {
          const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          const fps = Math.round(1000 / avgFrameTime);
          resolve({ fps, droppedFrames });
        }
      };

      animationFrameRef.current = requestAnimationFrame(measure);
    });
  }, []);

  const runTest = useCallback(async (
    testName: string,
    testFn: () => Promise<void> | void,
    duration: number = 1000
  ): Promise<PerformanceTestResult> => {
    const startTime = performance.now();
    
    const fpsPromise = measureFPS(duration);
    
    await testFn();
    
    const { fps, droppedFrames } = await fpsPromise;
    const testDuration = performance.now() - startTime;

    let status: 'pass' | 'warning' | 'fail';
    if (fps >= FPS_THRESHOLDS.pass && testDuration <= DURATION_THRESHOLDS.pass) {
      status = 'pass';
    } else if (fps >= FPS_THRESHOLDS.warning && testDuration <= DURATION_THRESHOLDS.warning) {
      status = 'warning';
    } else {
      status = 'fail';
    }

    return {
      testName,
      duration: Math.round(testDuration),
      fps,
      droppedFrames,
      status,
      timestamp: Date.now(),
    };
  }, [measureFPS]);

  const runAnimationTests = useCallback(async () => {
    setIsRunning(true);
    const tests: PerformanceTestResult[] = [];

    const testCases = [
      {
        name: 'Page Transition - Fade',
        fn: () => new Promise<void>((resolve) => {
          document.body.classList.add('test-fade-transition');
          setTimeout(() => {
            document.body.classList.remove('test-fade-transition');
            resolve();
          }, 300);
        }),
      },
      {
        name: 'Page Transition - Slide',
        fn: () => new Promise<void>((resolve) => {
          document.body.classList.add('test-slide-transition');
          setTimeout(() => {
            document.body.classList.remove('test-slide-transition');
            resolve();
          }, 350);
        }),
      },
      {
        name: 'Sidebar Open/Close',
        fn: () => new Promise<void>((resolve) => {
          const sidebar = document.querySelector('[data-testid="sidebar"]');
          if (sidebar) {
            sidebar.classList.add('opening');
            setTimeout(() => {
              sidebar.classList.remove('opening');
              sidebar.classList.add('closing');
              setTimeout(() => {
                sidebar.classList.remove('closing');
                resolve();
              }, 300);
            }, 400);
          } else {
            resolve();
          }
        }),
      },
      {
        name: 'Dialog Open/Close',
        fn: () => new Promise<void>((resolve) => {
          const dialog = document.querySelector('[role="dialog"]');
          if (dialog) {
            dialog.classList.add('opening');
            setTimeout(() => {
              dialog.classList.remove('opening');
              dialog.classList.add('closing');
              setTimeout(() => {
                dialog.classList.remove('closing');
                resolve();
              }, 300);
            }, 300);
          } else {
            resolve();
          }
        }),
      },
      {
        name: 'List Scroll Performance',
        fn: () => new Promise<void>((resolve) => {
          const scrollable = document.querySelector('.overflow-y-auto');
          if (scrollable) {
            let scrollPos = 0;
            const scrollInterval = setInterval(() => {
              scrollPos += 10;
              scrollable.scrollTop = scrollPos;
              if (scrollPos > 500) {
                clearInterval(scrollInterval);
                resolve();
              }
            }, 16);
          } else {
            resolve();
          }
        }),
      },
    ];

    for (const testCase of testCases) {
      const result = await runTest(testCase.name, testCase.fn, 1000);
      tests.push(result);
      await new Promise((r) => setTimeout(r, 500));
    }

    const avgFps = Math.round(tests.reduce((sum, t) => sum + t.fps, 0) / tests.length);
    const passCount = tests.filter((t) => t.status === 'pass').length;
    const passRate = Math.round((passCount / tests.length) * 100);

    const suite: PerformanceTestSuite = {
      name: `Test Run ${results.length + 1}`,
      tests,
      averageFps: avgFps,
      passRate,
    };

    setResults((prev) => [...prev, suite]);
    setIsRunning(false);

    return suite;
  }, [runTest, results.length]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    results,
    isRunning,
    runTest,
    runAnimationTests,
    clearResults,
  };
}

export function PerformanceTestPanel({ show = false }: { show?: boolean }) {
  const { results, isRunning, runAnimationTests, clearResults } = usePerformanceTest();

  if (!show) return null;

  return (
    <div className="fixed bottom-16 right-2 z-[9998] w-80 bg-surface/95 backdrop-blur-md rounded-mdui-xl shadow-lg p-4 text-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base">性能测试面板</h3>
        <div className="flex gap-2">
          <button
            onClick={runAnimationTests}
            disabled={isRunning}
            className="px-3 py-1 bg-primary text-on-primary rounded-mdui-lg text-xs disabled:opacity-50"
          >
            {isRunning ? '测试中...' : '运行测试'}
          </button>
          <button
            onClick={clearResults}
            className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-mdui-lg text-xs"
          >
            清除
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-on-surface-variant text-center py-4">点击"运行测试"开始性能测试</p>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {results.map((suite, index) => (
            <div key={index} className="border border-outline-variant rounded-mdui-lg p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{suite.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  suite.passRate >= 80 ? 'bg-green-500/20 text-green-600' :
                  suite.passRate >= 50 ? 'bg-yellow-500/20 text-yellow-600' :
                  'bg-red-500/20 text-red-600'
                }`}>
                  {suite.passRate}% 通过
                </span>
              </div>
              <div className="text-xs text-on-surface-variant mb-2">
                平均 FPS: {suite.averageFps}
              </div>
              <div className="space-y-1">
                {suite.tests.map((test, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">{test.testName}</span>
                    <span className={`ml-2 ${
                      test.status === 'pass' ? 'text-green-600' :
                      test.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {test.fps} FPS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
