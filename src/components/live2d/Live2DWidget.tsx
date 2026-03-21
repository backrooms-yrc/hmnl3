import { useState, useEffect, useRef, lazy, Suspense } from 'react';

export interface Live2DWidgetProps {
  modelPath?: string;
  width?: number;
  height?: number;
  position?: 'left' | 'right';
}

const Live2DWidgetLoader = lazy(() => 
  import('./Live2DWidgetInner').then(module => ({ default: module.Live2DWidgetInner }))
);

export function Live2DWidget(props: Live2DWidgetProps) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
          setError('WebGL not supported');
          return false;
        }

        return true;
      } catch (err) {
        console.error('[Live2D] Support check failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    };
    
    checkSupport().then(setIsSupported);
  }, []);

  if (isSupported === null) {
    return null;
  }

  if (!isSupported) {
    if (error) {
      console.warn('[Live2D]', error);
    }
    return null;
  }

  return (
    <Suspense fallback={null}>
      <Live2DWidgetLoader {...props} />
    </Suspense>
  );
}

export default Live2DWidget;
