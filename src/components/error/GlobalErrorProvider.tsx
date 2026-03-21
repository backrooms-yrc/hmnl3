import { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useGlobalErrorHandler } from '@/hooks/use-global-error-handler';
import { FatalErrorDialog } from './FatalErrorDialog';

interface GlobalErrorProviderProps {
  children: ReactNode;
}

function GlobalErrorWrapper({ children }: { children: ReactNode }) {
  const { errorReport, showDialog, closeDialog } = useGlobalErrorHandler();

  return (
    <>
      {children}
      <FatalErrorDialog
        isOpen={showDialog}
        onClose={closeDialog}
        errorReport={errorReport}
      />
    </>
  );
}

export function GlobalErrorProvider({ children }: GlobalErrorProviderProps) {
  return (
    <ErrorBoundary>
      <GlobalErrorWrapper>{children}</GlobalErrorWrapper>
    </ErrorBoundary>
  );
}
