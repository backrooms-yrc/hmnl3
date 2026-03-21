import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FatalErrorDialog } from './FatalErrorDialog';
import { generateErrorReport, logError } from '@/utils/error-utils';
import type { ErrorReport } from '@/types/error-handling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorReport: ErrorReport | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorReport: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorReport = generateErrorReport(
      'fatal',
      error.message || '未知错误',
      error,
      {
        componentStack: 'Error caught by ErrorBoundary',
      }
    );
    
    return {
      hasError: true,
      errorReport,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorReport = generateErrorReport(
      'fatal',
      error.message || '未知错误',
      error,
      {
        componentStack: errorInfo.componentStack || undefined,
      }
    );
    
    logError(errorReport);
    
    this.setState({
      errorReport,
    });
  }

  handleClose = () => {
    this.setState({
      hasError: false,
      errorReport: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <>
          {this.props.children}
          <FatalErrorDialog
            isOpen={this.state.hasError}
            onClose={this.handleClose}
            errorReport={this.state.errorReport}
          />
        </>
      );
    }

    return this.props.children;
  }
}
