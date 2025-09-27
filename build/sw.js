const CACHE_NAME = 'catalog-v1';
const urlsToCache = [
	'/catalog-app/',
	'/catalog-app/static/js/main.2aa8deec.js',
	'/catalog-app/static/css/main.91961923.css',
	'/catalog-app/data.json'
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => response || fetch(event.request))
	);
});
