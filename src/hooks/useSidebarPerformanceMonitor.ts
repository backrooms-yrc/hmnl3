import { useRef, useCallback } from 'react';

interface SidebarPerformanceMetrics {
  clickTimestamp: number;
  stateChangeTimestamp: number;
  renderTimestamp: number;
  paintTimestamp: number;
  totalResponseTime: number;
  eventToStateTime: number;
  stateToRenderTime: number;
  renderToPaintTime: number;
}

const useSidebarPerformanceMonitor = () => {
  const metricsRef = useRef<SidebarPerformanceMetrics | null>(null);
  const isMonitoringRef = useRef(false);

  const startMonitoring = useCallback(() => {
    if (isMonitoringRef.current) return;
    isMonitoringRef.current = true;

    metricsRef.current = {
      clickTimestamp: performance.now(),
      stateChangeTimestamp: 0,
      renderTimestamp: 0,
      paintTimestamp: 0,
      totalResponseTime: 0,
      eventToStateTime: 0,
      stateToRenderTime: 0,
      renderToPaintTime: 0,
    };
  }, []);

  const markStateChanged = useCallback(() => {
    if (!metricsRef.current || !isMonitoringRef.current) return;
    metricsRef.current.stateChangeTimestamp = performance.now();
    metricsRef.current.eventToStateTime =
      metricsRef.current.stateChangeTimestamp - metricsRef.current.clickTimestamp;
  }, []);

  const markRendered = useCallback(() => {
    if (!metricsRef.current || !isMonitoringRef.current) return;
    metricsRef.current.renderTimestamp = performance.now();
    metricsRef.current.stateToRenderTime =
      metricsRef.current.renderTimestamp - metricsRef.current.stateChangeTimestamp;
  }, []);

  const markPainted = useCallback(() => {
    if (!metricsRef.current || !isMonitoringRef.current) return;
    requestAnimationFrame((rafTs) => {
      metricsRef.current!.paintTimestamp = rafTs;
      metricsRef.current!.renderToPaintTime =
        metricsRef.current!.paintTimestamp - metricsRef.current!.renderTimestamp;
      metricsRef.current!.totalResponseTime =
        metricsRef.current!.paintTimestamp - metricsRef.current!.clickTimestamp;

      console.log('[Sidebar Performance]', {
        totalResponseTime: `${metricsRef.current!.totalResponseTime.toFixed(1)}ms`,
        eventToState: `${metricsRef.current!.eventToStateTime.toFixed(1)}ms`,
        stateToRender: `${metricsRef.current!.stateToRenderTime.toFixed(1)}ms`,
        renderToPaint: `${metricsRef.current!.renderToPaintTime.toFixed(1)}ms`,
        target: '<100ms',
        passed: metricsRef.current!.totalResponseTime < 100 ? '✅' : '❌',
      });

      isMonitoringRef.current = false;
    });
  }, []);

  return { startMonitoring, markStateChanged, markRendered, markPainted };
};

export default useSidebarPerformanceMonitor;
export type { SidebarPerformanceMetrics };
