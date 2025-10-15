import type { Explosion } from '../core/types';
import { getImage } from '../core/assets';

// Render an explosion
export function renderExplosion(ctx: CanvasRenderingContext2D, explosion: Explosion): void {
  const img = getImage(explosion.spriteSheet);
  if (!img) return;

  const frameX = explosion.currentFrame * explosion.frameWidth;
  const frameY = 0;

  const drawWidth = explosion.frameWidth * explosion.scale;
  const drawHeight = explosion.frameHeight * explosion.scale;

  ctx.drawImage(
    img,
    frameX,
    frameY,
    explosion.frameWidth,
    explosion.frameHeight,
    explosion.position.x - drawWidth / 2,
    explosion.position.y - drawHeight / 2,
    drawWidth,
    drawHeight
  );
}

// Render all explosions
export function renderExplosions(ctx: CanvasRenderingContext2D, explosions: Explosion[]): void {
  explosions.forEach((explosion) => renderExplosion(ctx, explosion));
}
