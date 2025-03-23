// This is the service worker for the Smart Todo app

const CACHE_NAME = "smart-todo-v1"

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/tasks",
  "/wheel",
  "/settings",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]

// Install event - precache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME
            })
            .map((cacheName) => {
              return caches.delete(cacheName)
            }),
        )
      })
      .then(() => {
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // For API requests, use network first, then cache
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response for future use
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
        }),
    )
    return
  }

  // For other requests, use cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((response) => {
        // Cache the response for future use
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
    }),
  )
})

// Handle offline sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    event.waitUntil(syncTasks())
  }
})

// Function to sync tasks when back online
async function syncTasks() {
  const db = await openDatabase()
  const pendingChanges = await db.getAll("pendingChanges")

  for (const change of pendingChanges) {
    try {
      // Attempt to sync the change
      await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(change),
      })

      // If successful, remove from pending changes
      await db.delete("pendingChanges", change.id)
    } catch (error) {
      console.error("Failed to sync change:", error)
    }
  }
}

// Helper function to open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SmartTodoDB", 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains("pendingChanges")) {
        db.createObjectStore("pendingChanges", { keyPath: "id" })
      }
    }
  })
}

