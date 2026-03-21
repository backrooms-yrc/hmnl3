export interface ErrorReport {
  timestamp: string;
  errorType: 'fatal' | '404' | 'network' | 'script' | 'resource';
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  networkInfo?: NetworkInfo;
  additionalInfo?: Record<string, unknown>;
}

export interface NetworkInfo {
  online: boolean;
  connectionType?: string;
  downlink?: number;
  effectiveType?: string;
}

export interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: '404' | 'fatal';
  errorInfo?: ErrorReport;
}

export interface GlobalErrorEvent {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
