import React, { useState, useRef, useCallback } from 'react';
import { RotateCw, CheckCircle2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 65; // pixels needed to trigger refresh

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-to-refresh if window is scrolled to top
    if (window.scrollY <= 5 && !isRefreshing) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0 && window.scrollY <= 5) {
      // Resistance curve: logarithmic dampening so pulling feels natural
      const distance = Math.min(85, diff * 0.45);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || isRefreshing) return;
    isPulling.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(60); // lock at 60px during refresh animation

      try {
        await Promise.resolve(onRefresh());
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setIsRefreshing(false);
          setPullDistance(0);
        }, 800);
      } catch {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  const rotation = Math.min(360, (pullDistance / PULL_THRESHOLD) * 360);
  const opacity = Math.min(1, pullDistance / (PULL_THRESHOLD * 0.7));

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-full overflow-hidden"
    >
      {/* iOS-Style Pull-to-Refresh Indicator Banner */}
      <div
        className="w-full flex items-center justify-center transition-all duration-200 overflow-hidden pointer-events-none"
        style={{
          height: `${pullDistance}px`,
          opacity: isRefreshing ? 1 : opacity,
        }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-indigo-500/30 shadow-xl backdrop-blur-xl text-xs font-extrabold text-cyan-300">
          {isRefreshing ? (
            isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="text-emerald-300">¡Información Sincronizada!</span>
              </>
            ) : (
              <>
                <RotateCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent">
                  Sincronizando tareas y proyectos...
                </span>
              </>
            )
          ) : (
            <>
              <RotateCw
                className="w-4 h-4 text-cyan-400 transition-transform duration-100"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
              <span className="text-slate-300">
                {pullDistance >= PULL_THRESHOLD ? 'Suelta para actualizar' : 'Desliza hacia abajo para actualizar'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: isRefreshing || pullDistance > 0 ? `translateY(${pullDistance * 0.15}px)` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};
