this.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open("v1").then(function(cache) {
			return cache.addAll([
				"index.html",
				"css/styles.css",
				"js/main.js",
				"lib/jQuery.js",
				"lib/require.js"
			]);
		})
	);
});
