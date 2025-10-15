import type { PlayerShip } from '../core/types';
import { getImage } from '../core/assets';
import { PLAYER_SHIP_CONFIG } from '../entities/player';

export function renderPlayerShip(ctx: CanvasRenderingContext2D, player: PlayerShip): void {
  const { x, y } = player.position;
  const w = player.width;
  const h = player.height;

  const image = getImage(PLAYER_SHIP_CONFIG.asset);

  ctx.save();
  ctx.translate(x, y);

  if (image) {
    // Draw the player ship sprite (center-based)
    ctx.drawImage(
      image,
      -w / 2,
      -h / 2,
      w,
      h
    );
  } else {
    // Fallback rendering if image not loaded
    ctx.fillStyle = '#CD7F32';
    ctx.beginPath();
    ctx.moveTo(0, -h / 2); // Top point
    ctx.lineTo(-w / 2, h / 2); // Bottom left
    ctx.lineTo(w / 2, h / 2); // Bottom right
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Engine glow (blue/purple)
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.arc(-w / 4, h / 2 - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w / 4, h / 2 - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit window
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.arc(0, -h / 4, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Render shield if active
  if (player.shieldLevel > 0) {
    renderShield(ctx, player);
  }
}

function renderShield(ctx: CanvasRenderingContext2D, player: PlayerShip): void {
  const { x, y } = player.position;
  const time = Date.now() / 1000;

  // Pulsing effect
  const pulseScale = 1 + Math.sin(time * 2) * 0.1;
  const baseRadius = Math.max(player.width, player.height) * 0.8;

  ctx.save();

  // Draw shields - each level is a separate bubble
  for (let i = 0; i < player.shieldLevel; i++) {
    const radius = (baseRadius + i * 10) * pulseScale;
    const alpha = 0.3 - i * 0.1; // Outer shields more transparent

    // Shield bubble
    const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius);
    gradient.addColorStop(0, `rgba(0, 191, 255, 0)`);
    gradient.addColorStop(0.7, `rgba(0, 191, 255, ${alpha})`);
    gradient.addColorStop(1, `rgba(0, 255, 255, ${alpha + 0.2})`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Shield edge glow
    ctx.strokeStyle = `rgba(0, 255, 255, ${alpha + 0.3})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}
