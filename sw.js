const CACHE_NAME = 'catalog-cache-v1.3';
const PRECACHE_URLS = [
	'./',
	'./index.html',
	'./manifest.json',
	'./data.json',
	'./images/icon-192x192.png',
	// ./offline.html,
];

// Утилита: безопасно кешировать список (чтобы install не падал из-за одного 404)
async function safePrecache(cache, urls) {
	for (const url of urls) {
		try {
			const resp = await fetch(url, { cache: 'no-cache' });
			if (resp && (resp.ok || resp.type === 'opaque')) {
				await cache.put(url, resp.clone());
			} else {
				console.warn('[sw] not caching (bad response):', url, resp && resp.status);
			}
		} catch (err) {
			console.warn('[sw] failed to fetch for precache:', url, err);
		}
	}
}

self.addEventListener('install', (event) => {
	self.skipWaiting();
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			await safePrecache(cache, PRECACHE_URLS);
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(keys =>
			Promise.all(
				keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
			)
		).then(() => self.clients.claim())
	);
});

// Простая политика кэширования:
// - Навигация (SPA) -> network-first, fallback to cached index.html
// - Статические ресурсы (.js/.css/.json/.png/.svg/изображения) -> cache-first (с подкачкой в кеш)
// - Остальное -> network-first then cache
self.addEventListener('fetch', (event) => {
	const req = event.request;
	
	// не трогаем не-GET запросы
	if (req.method !== 'GET') return;
	
	const url = new URL(req.url);
	
	// Навигация / HTML (SPA)
	if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
		event.respondWith(
			(async () => {
				try {
					const networkResp = await fetch(req);
					// обновляем кеш для навигации (опционально)
					const cache = await caches.open(CACHE_NAME);
					if (networkResp && (networkResp.ok || networkResp.type === 'opaque')) {
						cache.put('./', networkResp.clone()).catch(()=>{});
					}
					return networkResp;
				} catch (err) {
					// offline fallback -> index.html из кеша
					const cached = await caches.match('./index.html');
					if (cached) return cached;
					// можно вернуть оффлайн-страницу, если есть
					return new Response('Offline', { status: 503, statusText: 'Offline' });
				}
			})()
		);
		return;
	}
	
	// Статические ассеты: js/css/json/images — cache-first
	if (/\.(js|css|png|jpg|jpeg|svg|gif|webp|json)$/.test(url.pathname)) {
		event.respondWith(
			caches.match(req).then(cached => {
				if (cached) return cached;
				return fetch(req).then(networkResp => {
					if (!networkResp || (!networkResp.ok && networkResp.type !== 'opaque')) return networkResp;
					caches.open(CACHE_NAME).then(cache => cache.put(req, networkResp.clone()).catch(()=>{}));
					return networkResp;
				}).catch(async () => {
					// если это изображение и его нет в кеше — можно вернуть placeholder
					if (req.destination === 'image') {
						return caches.match('./images/icon-192x192.png'); // или другой заглушечный файл
					}
					return caches.match('./index.html');
				});
			})
		);
		return;
	}
	
	// По-умолчанию: network-first, fallback to cache
	event.respondWith(
		fetch(req).then(networkResp => {
			// по желанию можно кешировать успешные сетевые ответы
			if (networkResp && (networkResp.ok || networkResp.type === 'opaque')) {
				caches.open(CACHE_NAME).then(cache => cache.put(req, networkResp.clone()).catch(()=>{}));
			}
			return networkResp;
		}).catch(() => caches.match(req))
	);
});
