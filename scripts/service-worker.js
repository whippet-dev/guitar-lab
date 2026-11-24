const scope = self.registration.scope
const scopePath = new URL(scope).pathname
const cachePrefix = `guitar-lab:${scope}:`
const cacheName = cachePrefix + __BUILD_VERSION__
const assets = __BUILD_ASSETS__.map((path) => new URL(path, scope).href)
const assetSet = new Set(assets)
const appShell = new URL('index.html', scope).href

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets.map((asset) => new Request(asset, { cache: 'reload' })))))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key.startsWith(cachePrefix) && key !== cacheName).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(scopePath)) return

  if (request.mode === 'navigate' && (url.pathname === scopePath || url.href.split('?')[0] === appShell)) {
    event.respondWith(caches.open(cacheName).then(async (cache) => (await cache.match(appShell)) ?? fetch(request)))
  } else if (assetSet.has(url.href)) {
    // Build assets have one representation even if the preview server sends Vary: Origin.
    event.respondWith(caches.open(cacheName).then(async (cache) => (await cache.match(url.href, { ignoreVary: true })) ?? fetch(request)))
  }
})
