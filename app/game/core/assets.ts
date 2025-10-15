// Asset loader for preloading game assets

import {ASTEROID_ASSETS} from '~/game/entities/asteroid'

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
  ...ASTEROID_ASSETS,
  '/assets/weapons/MG.png',
  '/assets/explosions/exp01_260x260x7.png', // Explosion sprite sheet
  '/assets/powerups/powerup_dualgun.png',
  '/assets/powerups/powerup_shield.png',
  '/assets/powerups/powerup_speed.png',
];

// Preload all game assets
export async function preloadAssets(): Promise<void> {
  const imagePromises = imageAssets.map((src) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        assetCache.images.set(src, img);
        console.log(`✓ Loaded image: ${src}`);
        resolve();
      };
      img.onerror = () => {
        console.warn(`⚠ Failed to load image (will use fallback): ${src}`);
        // Don't reject, just resolve - fallback rendering will be used
        resolve();
      };
      img.src = src;
    });
  });

  await Promise.all(imagePromises);
  console.log(`Asset loading complete. ${assetCache.images.size}/${imageAssets.length} images loaded.`);
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
