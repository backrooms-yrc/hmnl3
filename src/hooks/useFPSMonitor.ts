import { useEffect, useRef, useState, useCallback } from 'react';

interface FPSMonitorData {
  fps: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  frameTime: number;
  droppedFrames: number;
}

interface FPSMonitorOptions {
  sampleSize?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  enabled?: boolean;
}

export function useFPSMonitor(options: FPSMonitorOptions = {}) {
  const {
    sampleSize = 60,
    warningThreshold = 30,
    criticalThreshold = 15,
    enabled = true,
  } = options;

  const [data, setData] = useState<FPSMonitorData>({
    fps: 60,
    averageFps: 60,
    minFps: 60,
    maxFps: 60,
    frameTime: 16.67,
    droppedFrames: 0,
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const frameIdRef = useRef<number>(0);
  const droppedFramesRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const calculateFPS = () => {
      const now = performance.now();
      const frameTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      frameTimesRef.current.push(frameTime);

      if (frameTimesRef.current.length > sampleSize) {
        frameTimesRef.current.shift();
      }

      const currentFps = Math.round(1000 / frameTime);
      
      if (frameTime > 33.33) {
        droppedFramesRef.current += Math.floor(frameTime / 16.67) - 1;
      }

      const frameTimes = frameTimesRef.current;
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const avgFps = Math.round(1000 / avgFrameTime);
      const minFps = Math.round(1000 / Math.max(...frameTimes));
      const maxFps = Math.round(1000 / Math.min(...frameTimes));

      setData({
        fps: currentFps,
        averageFps: avgFps,
        minFps,
        maxFps,
        frameTime: Math.round(frameTime * 100) / 100,
        droppedFrames: droppedFramesRef.current,
      });

      frameIdRef.current = requestAnimationFrame(calculateFPS);
    };

    frameIdRef.current = requestAnimationFrame(calculateFPS);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [enabled, sampleSize]);

  const getStatus = useCallback(() => {
    if (data.averageFps >= warningThreshold) return 'good';
    if (data.averageFps >= criticalThreshold) return 'warning';
    return 'critical';
  }, [data.averageFps, warningThreshold, criticalThreshold]);

  const reset = useCallback(() => {
    frameTimesRef.current = [];
    droppedFramesRef.current = 0;
    lastTimeRef.current = performance.now();
  }, []);

  return {
    ...data,
    status: getStatus(),
    reset,
  };
}

export function FPSMonitorDisplay({ 
  show = false,
  position = 'bottom-right',
}: { 
  show?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const fpsData = useFPSMonitor({ enabled: show });

  if (!show) return null;

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  const statusColors = {
    good: 'bg-green-500/80',
    warning: 'bg-yellow-500/80',
    critical: 'bg-red-500/80',
  };

  return (
    <div 
      className={`
        fixed ${positionClasses[position]} z-[9999]
        px-3 py-2 rounded-mdui-lg
        ${statusColors[fpsData.status]}
        text-white text-xs font-mono
        backdrop-blur-sm
        shadow-lg
        transition-colors duration-200
      `}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold">{fpsData.fps} FPS</span>
        <span className="opacity-70">|</span>
        <span>Avg: {fpsData.averageFps}</span>
        <span className="opacity-70">|</span>
        <span>Min: {fpsData.minFps}</span>
      </div>
      <div className="flex items-center gap-2 mt-1 opacity-80">
        <span>{fpsData.frameTime}ms</span>
        <span className="opacity-70">|</span>
        <span>Dropped: {fpsData.droppedFrames}</span>
      </div>
    </div>
  );
}

export function AnimationPerformanceTracker() {
  const [metrics, setMetrics] = useState<{
    animationCount: number;
    averageDuration: number;
    longAnimations: number;
  }>({
    animationCount: 0,
    averageDuration: 0,
    longAnimations: 0,
  });

  const durationsRef = useRef<number[]>([]);

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name.startsWith('animation-')) {
          durationsRef.current.push(entry.duration);
          
          if (durationsRef.current.length > 100) {
            durationsRef.current.shift();
          }

          const avg = durationsRef.current.reduce((a, b) => a + b, 0) / durationsRef.current.length;
          const longCount = durationsRef.current.filter(d => d > 100).length;

          setMetrics({
            animationCount: durationsRef.current.length,
            averageDuration: Math.round(avg * 100) / 100,
            longAnimations: longCount,
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['measure'] });
    } catch {
      console.warn('Performance Observer not supported');
    }

    return () => observer.disconnect();
  }, []);

  return null;
}

export function measureAnimation(name: string, callback: () => void | Promise<void>) {
  const startMark = `animation-${name}-start`;
  const endMark = `animation-${name}-end`;
  const measureName = `animation-${name}`;

  performance.mark(startMark);
  
  const result = callback();
  
  if (result instanceof Promise) {
    return result.then(() => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
    });
  }
  
  performance.mark(endMark);
  performance.measure(measureName, startMark, endMark);
}

export { useFPSMonitor as default };
