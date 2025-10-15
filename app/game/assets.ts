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
  '/assets/ships/spaceship.png',
  '/assets/enemies/asteroid_medium.png',
  '/assets/enemies/asteroid_large.png',
  '/assets/weapons/MG.png',
  '/assets/explosions/exp01_260x260x7.png', // Explosion sprite sheet
  '/assets/powerups/powerup_dualgun.png',
  '/assets/powerups/powerup_shield.png',
  '/assets/powerups/powerup_speed.png',
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
