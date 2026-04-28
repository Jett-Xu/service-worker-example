import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Image as ImageIcon, Activity } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { CachedImage } from './components/CachedImage';
import type { RequestData } from './components/NetworkTrafficChart';

// 延遲載入 (Lazy Loading) 肥大的圖表套件，避免阻塞主執行緒 (Main Thread)
const LazyNetworkTrafficChart = lazy(() => 
  import('./components/NetworkTrafficChart').then(module => ({ default: module.NetworkTrafficChart }))
);
const IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3840&auto=format&fit=crop', alt: '高山風景' },
];

const App = () => {
  const [swStatus, setSwStatus] = useState<'unregistered' | 'active'>('unregistered');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [reloadKey, setReloadKey] = useState(0);
  const [requestHistory, setRequestHistory] = useState<RequestData[]>([]);
  const requestCountRef = useRef(0);
  const lastRecordedKeyRef = useRef(-1);
  const nextEventRef = useRef<string | undefined>(undefined);

  const handleImageLoadComplete = (stats: { isCacheHit: boolean, duration: number, estimatedSizeMB: number }) => {
    if (lastRecordedKeyRef.current === reloadKey) return;
    lastRecordedKeyRef.current = reloadKey;

    requestCountRef.current += 1;
    const currentCount = requestCountRef.current;
    
    // 取得是否有標記的事件
    const currentEvent = nextEventRef.current;
    nextEventRef.current = undefined; // reset

    const newEntry = {
      id: currentCount,
      name: `載入 #${currentCount}`,
      networkSize: stats.isCacheHit ? 0 : stats.estimatedSizeMB,
      cacheSize: stats.isCacheHit ? stats.estimatedSizeMB : 0,
      duration: stats.duration,
      event: currentEvent
    };
    console.log('handleImageLoadComplete', newEntry, stats)
    setRequestHistory(prev => {
      const newHistory = [...prev, newEntry];
      return newHistory.slice(-10); // Keep last 10 entries
    });
  };


  // Status effects
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check SW status on mount
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          console.log('[App] ℹ️ 偵測到已註冊的 Service Worker:', reg.scope);
          if (reg.active) {
            console.log('[App] 🟢 Service Worker 已在作用中');
            setSwStatus('active');
          }
        } else {
          console.log('[App] ⚪ 目前尚未註冊 Service Worker');
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerSW = async () => {
    console.log('[App] 準備註冊 Service Worker...');
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[App] ✅ SW 註冊成功，Scope 為:', registration.scope);

        if (registration.installing) {
          console.log('[App] ⏳ SW 正在安裝...');
        } else if (registration.waiting) {
          console.log('[App] ⏳ SW 已安裝，等待啟用...');
        } else if (registration.active) {
          console.log('[App] 🟢 SW 已啟用');
          setSwStatus('active');
          nextEventRef.current = '啟動 SW';
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[App] 🔄 發現新的 SW 版本正在安裝...');
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log(`[App] SW 狀態變更: ${newWorker.state}`);
              if (newWorker.state === 'activated') {
                console.log('[App] 🟢 新版 SW 已啟用，開始接管網路請求');
                setSwStatus('active');
                nextEventRef.current = '啟動 SW';
              }
            });
          }
        });
      } catch (error) {
        console.error('[App] ❌ SW 註冊失敗:', error);
      }
    } else {
      console.warn('[App] ❌ 您的瀏覽器不支援 Service Worker');
      alert('您的瀏覽器不支援 Service Worker。');
    }
  };

  const unregisterSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        console.log('[App] ⚪ SW 已解除註冊');
        setSwStatus('unregistered');
        nextEventRef.current = '解除 SW';
        await caches.delete('portfolio-cache-v1');
      } catch (err) {
        console.error('[App] ❌ 解除註冊失敗:', err);
      }
    }
  };

  const clearCacheAndReload = async () => {
    try {
      nextEventRef.current = '清除快取';
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            setReloadKey((prev) => prev + 1);
          }
        };
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' }, [messageChannel.port2]);
      } else {
        await caches.delete('portfolio-cache-v1');
        setReloadKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error('[App] 清除快取失敗:', err);
    }
  };

  const reloadImageOnly = () => {
    nextEventRef.current = '一般重新載入';
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-inter text-slate-100">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      {/* Sidebar */}
      <Sidebar 
        swStatus={swStatus} 
        registerSW={registerSW} 
        unregisterSW={unregisterSW}
        clearCacheAndReload={clearCacheAndReload}
        reloadImageOnly={reloadImageOnly}
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col overflow-y-auto pb-16">
        <div className="flex-1 max-w-5xl w-full mx-auto p-10 space-y-12">
          {/* Photo Gallery & Chart Section */}
          <section className="grid grid-cols-1 gap-8 items-start">
            <div className="flex w-full h-full min-h-[300px]">
              <Suspense fallback={
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800/50 min-h-[380px]">
                  <Activity className="w-8 h-8 animate-spin mb-4 text-slate-600" />
                  <span className="text-sm font-medium">載入圖表模組中...</span>
                </div>
              }>
                <LazyNetworkTrafficChart data={requestHistory} />
              </Suspense>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/50">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-200">靜態資產快取</h3>
                  <p className="text-sm text-slate-400">跨網域載入 4K Unsplash 圖片</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {IMAGES.map((img) => (
                  <CachedImage 
                    key={`${img.id}-${reloadKey}`} 
                    src={img.url} 
                    alt={img.alt} 
                    onLoadComplete={handleImageLoadComplete}
                  />
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer Status Bar */}
      <Footer isOnline={isOnline} />
    </div>
  );
};

export default App;
