// Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

export class Cache {
	public static setup(): void {
		if ("serviceWorker" in navigator) {
			navigator["serviceWorker"].register("cache.js", { scope: "./" }).then(function(reg) {
				if (reg.installing) {
					console.log("Service worker installing");
				} else if (reg.waiting) {
					console.log("Service worker installed");
				} else if (reg.active) {
					console.log("Service worker active");
				}
			}).catch(function(error) {
				console.log("Cache service failed (" + error + ")");
			});
		} else {
			console.log("Cache service failed (navigator.serviceWorker is not defined)");
		}
	}
}
