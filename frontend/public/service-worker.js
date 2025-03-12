// 缓存名称和版本
const CACHE_NAME = 'education-assistant-v1';

// 需要缓存的资源
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求并从缓存中响应
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到缓存的响应，则返回缓存
        if (response) {
          return response;
        }
        
        // 克隆请求，因为请求是一个流，只能使用一次
        const fetchRequest = event.request.clone();
        
        // 发起网络请求
        return fetch(fetchRequest).then(
          response => {
            // 检查响应是否有效
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应，因为响应是一个流，只能使用一次
            const responseToCache = response.clone();
            
            // 将响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
  );
});

// 后台同步
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// 推送通知
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 点击通知
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// 同步数据的函数
async function syncData() {
  // 从IndexedDB获取待同步的数据
  const db = await openDatabase();
  const pendingItems = await getPendingItems(db);
  
  // 如果有待同步的数据，则发送到服务器
  if (pendingItems.length > 0) {
    try {
      await Promise.all(pendingItems.map(item => sendToServer(item)));
      await markItemsAsSynced(db, pendingItems);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// 这些函数需要根据实际情况实现
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offlineDB', 1);
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
  });
}

function getPendingItems(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineItems'], 'readonly');
    const store = transaction.objectStore('offlineItems');
    const request = store.getAll();
    request.onerror = reject;
    request.onsuccess = () => resolve(request.result);
  });
}

function sendToServer(item) {
  return fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  });
}

function markItemsAsSynced(db, items) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineItems'], 'readwrite');
    const store = transaction.objectStore('offlineItems');
    
    items.forEach(item => {
      store.delete(item.id);
    });
    
    transaction.oncomplete = resolve;
    transaction.onerror = reject;
  });
} 