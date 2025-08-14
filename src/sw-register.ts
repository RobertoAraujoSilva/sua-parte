// Service Worker registration with cache cleanup on chunk errors

interface SWRegister {
  register(): void;
  handleChunkError(event: ErrorEvent): Promise<void>;
  clearCaches(): Promise<void>;
}

const swRegister: SWRegister = {
  register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  },

  async handleChunkError(event: ErrorEvent) {
    const msg = String(event?.message || '');
    if (/ChunkLoadError|Loading chunk \d+ failed/i.test(msg)) {
      console.log('Chunk loading error detected, clearing caches and reloading...');
      await this.clearCaches();
      location.reload();
    }
  },

  async clearCaches() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
      } catch (error) {
        console.error('Error clearing caches:', error);
      }
    }
  }
};

// Register service worker
swRegister.register();

// Listen for chunk loading errors
window.addEventListener('error', (event) => {
  swRegister.handleChunkError(event);
});

export default swRegister;