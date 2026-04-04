import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Application } from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display/cubism4';
import type { Live2DWidgetProps } from './Live2DWidget';

declare global {
  interface Window {
    Live2DCubismCore?: unknown;
  }
}

function isCubismCoreLoaded(): boolean {
  return typeof window.Live2DCubismCore !== 'undefined' || 
         typeof (window as any).Live2DCubismCore !== 'undefined';
}

async function loadCubismCore(): Promise<void> {
  if (isCubismCoreLoaded()) {
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js';
    script.async = true;
    script.onload = () => {
      console.log('[Live2D] Cubism Core loaded');
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load Cubism Core'));
    };
    document.head.appendChild(script);
  });
}

export function Live2DWidgetInner({
  modelPath = '/live2d/米塔.model3.json',
  width = 280,
  height = 400,
  position = 'left'
}: Live2DWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);
  const mountedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    
    const container = document.createElement('div');
    container.id = 'live2d-portal';
    container.style.cssText = `
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 50;
      pointer-events: none;
      overflow: visible;
    `;
    document.body.appendChild(container);
    containerRef.current = container;
    setPortalContainer(container);
    
    return () => {
      mountedRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && containerRef.current.parentNode) {
        containerRef.current.parentNode.removeChild(containerRef.current);
      }
    };
  }, [position]);

  useEffect(() => {
    if (!portalContainer || isClosed) return;
    
    let destroyed = false;

    const initLive2D = async () => {
      if (!canvasRef.current || destroyed) return;

      try {
        if (!mountedRef.current) return;
        setIsLoading(true);
        setLoadError(null);

        if (!isCubismCoreLoaded()) {
          console.log('[Live2D] Loading Cubism Core...');
          await loadCubismCore();
        }

        if (destroyed || !mountedRef.current || !canvasRef.current) return;

        const app = new Application({
          view: canvasRef.current,
          width,
          height,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (destroyed || !mountedRef.current) {
          app.destroy(true, { children: true, texture: true });
          return;
        }

        appRef.current = app;

        const model = await Live2DModel.from(modelPath, {
          autoInteract: false,
        });

        if (destroyed || !mountedRef.current) {
          model.destroy();
          app.destroy(true, { children: true, texture: true });
          return;
        }

        modelRef.current = model;

        const modelWidth = model.width;
        const modelHeight = model.height;
        
        const scaleX = width / modelWidth;
        const scaleY = height / modelHeight;
        const scale = Math.min(scaleX, scaleY);
        
        model.scale.set(scale);
        
        model.anchor.set(0.5, 1);
        
        model.x = width / 2;
        model.y = height;

        app.stage.addChild(model);

        try {
          await model.motion('Idle', 0);
          if (mountedRef.current) {
            console.log('[Live2D] Idle motion started');
          }
        } catch (e) {
          if (mountedRef.current) {
            console.log('[Live2D] Idle motion not available, using default state');
          }
        }

        model.on('hit', (hitAreas: string[]) => {
          if (mountedRef.current) {
            console.log('[Live2D] Hit areas:', hitAreas);
          }
        });

        if (mountedRef.current) {
          setIsLoading(false);
          console.log('[Live2D] Model loaded successfully', {
            modelSize: { width: modelWidth, height: modelHeight },
            canvasSize: { width, height },
            scale,
            position: { x: model.x, y: model.y }
          });
        }

        const animate = () => {
          if (!destroyed && mountedRef.current && !isClosed) {
            app?.ticker?.update();
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };

        animate();
      } catch (error) {
        if (mountedRef.current && !destroyed) {
          console.error('[Live2D] Load failed:', error);
          setLoadError(error instanceof Error ? error.message : 'Load failed');
          setIsLoading(false);
        }
      }
    };

    initLive2D();

    return () => {
      destroyed = true;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (modelRef.current) {
        try {
          modelRef.current.destroy();
        } catch (e) {
          console.warn('[Live2D] Model cleanup error:', e);
        }
        modelRef.current = null;
      }
      
      if (appRef.current) {
        try {
          appRef.current.destroy(true, { children: true, texture: true });
        } catch (e) {
          console.warn('[Live2D] App cleanup error:', e);
        }
        appRef.current = null;
      }
    };
  }, [modelPath, width, height, portalContainer, isClosed]);

  const handleClose = () => {
    setIsClosed(true);
  };

  if (!portalContainer || isClosed) {
    return null;
  }

  return createPortal(
    <div style={{ 
      position: 'relative', 
      width, 
      height, 
      pointerEvents: 'auto',
      marginLeft: 0,
      marginBottom: 0,
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 8,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <span style={{ color: 'white', fontSize: 14 }}>Loading...</span>
          </div>
        </div>
      )}

      {loadError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 8,
        }}>
          <div style={{ textAlign: 'center', color: 'white', fontSize: 14, padding: 16 }}>
            <p>Load Failed</p>
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{loadError}</p>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: isLoading || loadError ? 'none' : 'block',
        }}
      />
      
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 24,
          height: 24,
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          color: 'white',
          cursor: 'pointer',
          display: isLoading || loadError ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 'bold',
          lineHeight: 1,
          padding: 0,
          margin: 0,
          zIndex: 100,
        }}
        aria-label="关闭Live2D"
        title="关闭Live2D"
      >
        ×
      </button>
    </div>,
    portalContainer
  );
}

export default Live2DWidgetInner;
