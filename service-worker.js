const CACHE_NAME = 'lms-cache-v1';
const STATIC_ASSETS = [
  'index.html',
  'register.html',
  'home.html',
  'admin.html',
  'profile.html',
  'chat.html',
  'manifest.json',
  'css/styles.css',
  'js/app.js',
  'js/home.js',
  'js/admin.js',
  'js/profile.js',
  'js/chat.js',
  'js/langToggle.js',
  'js/darkModeToggle.js',
  'js/googleBooks.js',
  'js/onboarding.js',
  'js/notificationCenter.js',
  'js/utils.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
