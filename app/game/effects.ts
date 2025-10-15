import type { Explosion, Vector2D } from './types';
import { getImage } from './assets';

// Create a new explosion effect
export function createExplosion(
  position: Vector2D,
  velocity: Vector2D = { x: 0, y: 0 },
  scale: number = 1
): Explosion {
  return {
    id: `explosion-${Date.now()}-${Math.random()}`,
    position: { ...position },
    velocity: { ...velocity },
    currentFrame: 0,
    totalFrames: 7,
    frameWidth: 260,
    frameHeight: 260,
    frameDuration: 50, // 50ms per frame
    elapsedTime: 0,
    scale,
    spriteSheet: '/assets/explosions/exp01_260x260x7.png',
    finished: false,
  };
}

// Update all explosions
export function updateExplosions(explosions: Explosion[], deltaTime: number): Explosion[] {
  return explosions
    .map((explosion) => {
      // Update position based on velocity
      const newPosition = {
        x: explosion.position.x + explosion.velocity.x * deltaTime,
        y: explosion.position.y + explosion.velocity.y * deltaTime,
      };

      // Update animation frame
      const newElapsedTime = explosion.elapsedTime + deltaTime * 1000; // Convert to ms
      let newCurrentFrame = explosion.currentFrame;
      let newFinished = explosion.finished;

      if (newElapsedTime >= explosion.frameDuration) {
        newCurrentFrame = explosion.currentFrame + 1;
        if (newCurrentFrame >= explosion.totalFrames) {
          newFinished = true;
        }
      }

      return {
        ...explosion,
        position: newPosition,
        elapsedTime: newElapsedTime % explosion.frameDuration,
        currentFrame: newCurrentFrame,
        finished: newFinished,
      };
    })
    .filter((explosion) => !explosion.finished);
}

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
