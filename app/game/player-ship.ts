import type { PlayerShip, KeysPressed, Vector2D } from './types';
import { createCrossHitbox } from './physics';

export function createPlayerShip(canvasWidth: number, canvasHeight: number): PlayerShip {
  const width = 40;
  const height = 50;
  const baseSpeed = 5;

  return {
    position: { x: canvasWidth / 2, y: canvasHeight - 100 },
    velocity: { x: 0, y: 0 },
    speed: baseSpeed,
    baseSpeed,
    width,
    height,
    health: 100,
    maxHealth: 100,
    weaponLevel: 1,
    shieldLevel: 0,
    speedLevel: 0,
    collisionBodies: createCrossHitbox(width, height),
  };
}

export function updatePlayerShip(
  player: PlayerShip,
  keys: KeysPressed,
  canvasWidth: number,
  canvasHeight: number,
  deltaTime: number
): void {
  // Reset velocity
  player.velocity.x = 0;
  player.velocity.y = 0;

  // Handle input
  if (keys.w || keys.ArrowUp) player.velocity.y = -1;
  if (keys.s || keys.ArrowDown) player.velocity.y = 1;
  if (keys.a || keys.ArrowLeft) player.velocity.x = -1;
  if (keys.d || keys.ArrowRight) player.velocity.x = 1;

  // Normalize diagonal movement
  if (player.velocity.x !== 0 && player.velocity.y !== 0) {
    const normalizer = Math.sqrt(2);
    player.velocity.x /= normalizer;
    player.velocity.y /= normalizer;
  }

  // Update position
  player.position.x += player.velocity.x * player.speed * deltaTime * 60;
  player.position.y += player.velocity.y * player.speed * deltaTime * 60;

  // Keep player within bounds
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;

  player.position.x = Math.max(halfWidth, Math.min(canvasWidth - halfWidth, player.position.x));
  player.position.y = Math.max(halfHeight, Math.min(canvasHeight - halfHeight, player.position.y));
}

export function renderPlayerShip(ctx: CanvasRenderingContext2D, player: PlayerShip): void {
  const { x, y } = player.position;
  const w = player.width;
  const h = player.height;

  // Draw a simple steampunk-style ship (triangle with details)
  ctx.save();
  ctx.translate(x, y);

  // Main body (bronze/copper color)
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
