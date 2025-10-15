import type { Bullet } from '../core/types';
import { getImage } from '../core/assets';
import { BULLET_CONFIG } from '../entities/bullet';

export function renderBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[]): void {
  const image = getImage(BULLET_CONFIG.sprite);

  for (const bullet of bullets) {
    if (image) {
      // Draw bullet image (center-based coordinates)
      ctx.drawImage(
        image,
        bullet.position.x - bullet.width / 2,
        bullet.position.y - bullet.height / 2,
        bullet.width,
        bullet.height
      );
    } else {
      // Fallback rendering (center-based coordinates)
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(
        bullet.position.x - bullet.width / 2,
        bullet.position.y - bullet.height / 2,
        bullet.width,
        bullet.height
      );
    }
  }
}
