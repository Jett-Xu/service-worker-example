import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { CachedImage } from './components/CachedImage';
import { TypographySection } from './components/TypographySection';

const IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3840&auto=format&fit=crop', alt: '高山風景' },
];

export default function App() {
  const [swStatus, setSwStatus] = useState<'unregistered' | 'active'>('unregistered');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStats, setCacheStats] = useState({ images: 0, fonts: 0 });
  const [reloadKey, setReloadKey] = useState(0);

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

  // Update Cache stats periodically
  useEffect(() => {
    const updateCacheStats = async () => {
      try {
        const cache = await caches.open('portfolio-cache-v1');
        const requests = await cache.keys();
        
        let imgCount = 0;
        let fontCount = 0;

        requests.forEach((req) => {
          const url = new URL(req.url);
          if (url.hostname === 'images.unsplash.com') imgCount++;
          if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') fontCount++;
        });

        setCacheStats({ images: imgCount, fonts: fontCount });
      } catch (err) {
        console.error('[App] 讀取快取失敗:', err);
      }
    };

    updateCacheStats();
    const interval = setInterval(updateCacheStats, 2000);
    return () => clearInterval(interval);
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

  const clearCacheAndReload = async () => {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            setReloadKey((prev) => prev + 1);
            setCacheStats({ images: 0, fonts: 0 });
          }
        };
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' }, [messageChannel.port2]);
      } else {
        await caches.delete('portfolio-cache-v1');
        setReloadKey((prev) => prev + 1);
        setCacheStats({ images: 0, fonts: 0 });
      }
    } catch (err) {
      console.error('[App] 清除快取失敗:', err);
    }
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
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col overflow-y-auto pb-16">
        <div className="flex-1 max-w-5xl w-full mx-auto p-10 space-y-12">
          
          {/* Typography Section */}
          <TypographySection />

          {/* Photo Gallery */}
          <section className="space-y-6">
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
                <CachedImage key={`${img.id}-${reloadKey}`} src={img.url} alt={img.alt} />
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* Footer Status Bar */}
      <Footer isOnline={isOnline} />
    </div>
  );
}
