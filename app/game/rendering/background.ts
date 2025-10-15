import type { Star } from '../core/types';

// Render the starfield
export function renderStars(ctx: CanvasRenderingContext2D, stars: Star[]): void {
  stars.forEach((star) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
}
