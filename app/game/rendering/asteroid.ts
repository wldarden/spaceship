import type { Asteroid } from '../core/types';
import { getImage } from '../core/assets';
import { ASTEROID_CONFIG } from '../entities/asteroid';

export function renderAsteroids(
  ctx: CanvasRenderingContext2D,
  asteroids: Asteroid[]
): void {
  for (const asteroid of asteroids) {
    const config = ASTEROID_CONFIG[asteroid.size];
    const image = getImage(config.asset);

    if (image) {
      // Draw rotated image manually (center-based coordinates)
      ctx.save();
      ctx.translate(asteroid.position.x, asteroid.position.y);
      ctx.rotate(asteroid.rotation);
      ctx.drawImage(
        image,
        -asteroid.width / 2,
        -asteroid.height / 2,
        asteroid.width,
        asteroid.height
      );
      ctx.restore();
    } else {
      // Fallback rendering if image not loaded (center-based coordinates)
      ctx.save();
      ctx.translate(asteroid.position.x, asteroid.position.y);
      ctx.rotate(asteroid.rotation);
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(0, 0, asteroid.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }
}
