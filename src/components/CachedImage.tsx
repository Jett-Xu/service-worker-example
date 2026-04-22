import { useState, useEffect, useRef } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';

export function CachedImage({ src, alt }: { src: string; alt: string }) {
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const startTimeRef = useRef<number>(performance.now());
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    startTimeRef.current = performance.now();
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    // 檢查圖片是否已經被瀏覽器瞬間載入完畢（例如從 Cache 撈出）
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      handleLoad();
    }
  }, [src]);

  const handleLoad = () => {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTimeRef.current);
    
    // Attempt to use Performance API for more accurate fetch time if available
    try {
      const entries = performance.getEntriesByName(src);
      if (entries.length > 0) {
        const latestEntry = entries[entries.length - 1];
        setLoadTime(Math.round(latestEntry.duration));
      } else {
        setLoadTime(duration);
      }
    } catch (e) {
      setLoadTime(duration);
    }
    
    setIsLoading(false);
  };

  const handleError = () => {
    console.error('[App] 圖片載入失敗:', src);
    setIsLoading(false);
    setHasError(true);
  };

  const isCacheHit = loadTime !== null && loadTime < 100;

  return (
    <div className="group relative glass-card rounded-2xl overflow-hidden p-2 flex flex-col gap-3">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 animate-pulse">
            <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
          </div>
        )}
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80">
            <CloudOff className="w-8 h-8 text-rose-400 mb-2" />
            <span className="text-xs text-rose-300 font-medium px-4 text-center">圖片載入失敗，請檢查控制台或網路面板。</span>
          </div>
        ) : (
          <img 
            ref={imgRef}
            src={src} 
            alt={alt}
            crossOrigin="anonymous"
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-105'}`}
          />
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
      </div>
      
      <div className="px-2 pb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{alt}</span>
        {loadTime !== null && !hasError && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">{loadTime}ms</span>
            {isCacheHit && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px] font-bold text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
                快取
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
