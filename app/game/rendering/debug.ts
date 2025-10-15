import type { PhysicsBody } from '../core/physics';
import type { HitboxDef } from '../core/physics';

/**
 * Render hitboxes for debugging collision detection
 * Shows the actual collision boundaries used by the physics system
 * @param filled - If true, fills the hitbox (used when collision is detected)
 */
export function renderHitboxes(
  ctx: CanvasRenderingContext2D,
  body: PhysicsBody,
  color: string = '#00FF00',
  filled: boolean = false
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  for (const hitbox of body.collisionBodies) {
    if (hitbox.type === 'rect') {
      // Rectangle hitbox
      const halfWidth = (hitbox.width || 0) / 2;
      const halfHeight = (hitbox.height || 0) / 2;
      const centerX = body.position.x + hitbox.offset.x;
      const centerY = body.position.y + hitbox.offset.y;

      ctx.strokeRect(
        centerX - halfWidth,
        centerY - halfHeight,
        hitbox.width || 0,
        hitbox.height || 0
      );

      // Only fill if collision detected
      if (filled) {
        ctx.fillStyle = `${color}40`; // Semi-transparent fill
        ctx.fillRect(
          centerX - halfWidth,
          centerY - halfHeight,
          hitbox.width || 0,
          hitbox.height || 0
        );
      }

      // Draw center point
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (hitbox.type === 'circle') {
      // Circle hitbox
      const centerX = body.position.x + hitbox.offset.x;
      const centerY = body.position.y + hitbox.offset.y;
      const radius = hitbox.radius || 0;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Only fill if collision detected
      if (filled) {
        ctx.fillStyle = `${color}40`; // Semi-transparent fill
        ctx.fill();
      }

      // Draw center point
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draw a label at a position
 */
export function renderLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string = '#FFFFFF'
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y - 10);
  ctx.restore();
}
