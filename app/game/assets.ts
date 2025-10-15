// Asset loader for preloading game assets

interface AssetCache {
  images: Map<string, HTMLImageElement>;
  audio: Map<string, HTMLAudioElement>;
}

const assetCache: AssetCache = {
  images: new Map(),
  audio: new Map(),
};

// List of all image assets to preload
const imageAssets = [
  '/game-assets/spaceship.png',
  '/game-assets/asteroid_medium.png',
  '/game-assets/asteroid_large.png',
  '/game-assets/bullet.png',
  '/game-assets/exp01_260x260x7.png', // Explosion sprite sheet
  '/game-assets/powerup_dualgun.png',
  '/game-assets/powerup_shield.png',
  '/game-assets/powerup_speed.png',
];

// Preload all game assets
export async function preloadAssets(): Promise<void> {
  const imagePromises = imageAssets.map((src) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        assetCache.images.set(src, img);
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  });

  await Promise.all(imagePromises);
}

// Get a preloaded image from the cache
export function getImage(src: string): HTMLImageElement | undefined {
  return assetCache.images.get(src);
}

// Get audio from the cache (if we add audio in the future)
export function getAudio(src: string): HTMLAudioElement | undefined {
  return assetCache.audio.get(src);
}

// Check if all assets are loaded
export function areAssetsLoaded(): boolean {
  return assetCache.images.size === imageAssets.length;
}
