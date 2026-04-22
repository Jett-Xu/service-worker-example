/**
 * Service Worker 核心腳本 (Cache-First 策略實作)
 * 核心包含四個生命週期階段：安裝 (Install)、啟動 (Activate)、攔截 (Fetch)、通訊 (Message)。
 */

const CACHE_NAME = 'portfolio-cache-v1';

// 若有需要強制預先下載的靜態資源，可填入此陣列
const CACHE_URLS = [];

/**
 * 1. 安裝階段 (Install Event)
 * 觸發時機：瀏覽器第一次註冊 SW，或發現 SW 檔案內容有更新時。
 * 這裡用來「預先快取 (Pre-caching)」核心的 App Shell (HTML/CSS/JS)。
 */
self.addEventListener('install', (event) => {
  console.log('[SW] 🟡 安裝中 (Installing)...');
  
  // 強制讓這個新的 SW 進入 activating 階段，不需要等待舊的 SW 關閉
  // 這可以確保使用者重整後立刻套用新版 SW。
  self.skipWaiting();
  
  // event.waitUntil 會確保這段 Promise 執行完畢後，SW 才會被視為安裝成功
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 📦 準備預設快取空間:', CACHE_NAME);
      return cache.addAll(CACHE_URLS);
    })
  );
});

/**
 * 2. 啟動階段 (Activate Event)
 * 觸發時機：安裝完成後，並準備接管頁面時。
 * 這個階段最適合用來「清理舊版本的快取」，確保使用者的儲存空間不會被無用的舊資料塞滿。
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] 🟢 已啟動 (Activated)!');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          // 如果找到不是當前版本 (CACHE_NAME) 的快取，就把它刪除
          if (name !== CACHE_NAME) {
            console.log('[SW] 🧹 清除舊快取:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  
  // 讓啟動的 SW 立即接管所有開啟的網頁 (Client)，否則預設要等下次重新整理才會接管
  self.clients.claim();
});

/**
 * 3. 攔截網路請求 (Fetch Event)
 * 觸發時機：網頁發出任何網路請求時 (例如 Fetch API, img src, script src 等)。
 * 這裡實作了「Cache-First (快取優先)」策略。
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 只處理 GET 請求，POST/PUT 等改變狀態的請求不該被快取
  if (event.request.method !== 'GET') return;

  // 例外處理：繞過 Chrome 開發者工具中「重新整理」時產生的特定 Bug (only-if-cached 衝突)
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }

  // 設定攔截範圍：只針對 Unsplash 的圖片，以及 Google Fonts
  const isImage = url.hostname === 'images.unsplash.com';
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (isImage || isFont) {
    event.respondWith(
      // 先去快取找找看。加入 { ignoreVary: true } 是因為跨網域的 Vary header (例如 Origin) 
      // 在每次刷新時可能會有些微不同，忽略它能大幅提高快取命中率。
      caches.match(event.request, { ignoreVary: true }).then((cachedResponse) => {
        
        if (cachedResponse) {
          // 如果快取裡有，就直接返回快取
          console.log(`[SW Cache Hit] ${url.hostname}:`, event.request.url);
          return cachedResponse;
        }

        // 如果快取沒有，就實際發起網路請求
        console.log(`[SW Fetching] ${url.hostname}:`, event.request.url);
        
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || 
             (networkResponse.type !== 'cors' && networkResponse.type !== 'basic')) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          
          // 存進快取
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          // 把原本的 Response 回傳給瀏覽器
          return networkResponse;
        }).catch((err) => {
          console.error(`[SW Fetch Error] ${event.request.url}:`, err);
        });
      })
    );
  }
});

/**
 * 4. 訊息通訊 (Message Event)
 * 觸發時機：當前端 UI 透過 postMessage 傳遞訊息給 Service Worker 時。
 * 展示 UI 與背景執行緒 (Worker) 之間的溝通。這裡用來實作 UI 點擊「清除快取」的功能。
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // 找出並刪除所有快取
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((name) => caches.delete(name))
      ).then(() => {
        console.log('[SW] 🗑️ 收到指令，快取已清除完畢');
        
        // 透過 MessageChannel 把「清除成功」的訊號回傳給前端 UI
        event.ports[0].postMessage({ success: true });
      });
    });
  }
});
