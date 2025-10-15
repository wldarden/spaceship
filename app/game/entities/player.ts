import type { PlayerShip, KeysPressed } from '../core/types';
import { createCrossHitbox } from '../core/physics';

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
