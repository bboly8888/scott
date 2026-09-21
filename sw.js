const CACHE_NAME = 'budget-app-v3';
const CORE_ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
// xlsx/pdf.js 라이브러리는 이제 별도 파일이 아니라 index.html 안에 직접 담겨있어요
// (index.html 파일 하나만 다운로드해서 file://로 열어도 항상 동작하게 하기 위함).

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// 같은 사이트(index.html 등)는 네트워크 우선 + 오프라인 시 캐시 사용.
// 구글 앱스 스크립트 API, 구글 폰트는 다른 도메인이라 그대로 네트워크로 통과시켜요.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html')))
  );
});
