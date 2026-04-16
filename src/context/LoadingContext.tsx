import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

// ── Context ───────────────────────────────────────────────────────────────────
interface LoadingCtx { start: () => void; done: () => void; }
const LoadingContext = createContext<LoadingCtx>({ start: () => {}, done: () => {} });

export const usePageLoading = () => useContext(LoadingContext);

// ── Provider + Bar ────────────────────────────────────────────────────────────
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible]   = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setProgress(0);
    setVisible(true);
    // Animate to ~80% quickly, then hold
    setTimeout(() => setProgress(30), 50);
    setTimeout(() => setProgress(60), 200);
    setTimeout(() => setProgress(80), 500);
  }, []);

  const done = useCallback(() => {
    setProgress(100);
    timer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
  }, []);

  return (
    <LoadingContext.Provider value={{ start, done }}>
      {/* The bar itself lives here, always on top */}
      {visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '3px',
            width: `${progress}%`,
            backgroundColor: 'var(--accent-blue)',
            transition: progress === 100 ? 'width 0.2s ease' : 'width 0.4s ease',
            zIndex: 9999,
          }}
        />
      )}
      {children}
    </LoadingContext.Provider>
  );
}
