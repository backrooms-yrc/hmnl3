import { useEffect, useCallback, useState } from 'react';
import { generateErrorReport, logError } from '@/utils/error-utils';
import type { ErrorReport, GlobalErrorEvent } from '@/types/error-handling';

export function useGlobalErrorHandler() {
  const [errorReport, setErrorReport] = useState<ErrorReport | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleError = useCallback((event: ErrorEvent) => {
    const error = event.error || new Error(event.message);
    
    const report = generateErrorReport(
      'script',
      event.message || 'JavaScript错误',
      error,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
    
    logError(report);
    setErrorReport(report);
    setShowDialog(true);
    
    event.preventDefault();
  }, []);

  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    const report = generateErrorReport(
      'script',
      error.message || '未处理的Promise拒绝',
      error,
      {
        type: 'unhandledrejection',
      }
    );
    
    logError(report);
    setErrorReport(report);
    setShowDialog(true);
    
    event.preventDefault();
  }, []);

  const handleResourceError = useCallback((event: Event) => {
    const target = event.target as HTMLElement | null;
    
    if (!target || !target.tagName) {
      return;
    }
    
    const tagName = target.tagName.toLowerCase();
    
    if (tagName === 'script' || tagName === 'link' || tagName === 'img') {
      const src = (target as HTMLScriptElement | HTMLImageElement).src || 
                  (target as HTMLLinkElement).href || 
                  'unknown';
      
      const report = generateErrorReport(
        'resource',
        `资源加载失败: ${tagName}`,
        null,
        {
          tagName,
          src,
          type: 'resource-loading-error',
        }
      );
      
      logError(report);
      setErrorReport(report);
      setShowDialog(true);
    }
  }, []);

  const closeDialog = useCallback(() => {
    setShowDialog(false);
    setErrorReport(null);
  }, []);

  useEffect(() => {
    window.addEventListener('error', handleError as EventListener, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection as EventListener);
    window.addEventListener('error', handleResourceError as EventListener, true);

    return () => {
      window.removeEventListener('error', handleError as EventListener, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection as EventListener);
      window.removeEventListener('error', handleResourceError as EventListener, true);
    };
  }, [handleError, handleUnhandledRejection, handleResourceError]);

  return {
    errorReport,
    showDialog,
    closeDialog,
  };
}
