import type { PowerUp } from '../core/types';
import { createRectHitbox, checkPhysicsCollision } from '../core/physics';

let powerupIdCounter = 0;

const POWERUP_CONFIG = {
  width: 32,
  height: 32,
  speed: 1.5, // Slower than asteroids
};

export function createPowerup(
  x: number,
  y: number,
  type: 'dual-gun' | 'shield' | 'speed'
): PowerUp {
  return {
    id: `powerup-${powerupIdCounter++}`,
    position: { x, y },
    velocityY: POWERUP_CONFIG.speed,
    width: POWERUP_CONFIG.width,
    height: POWERUP_CONFIG.height,
    type,
    collisionBodies: createRectHitbox(POWERUP_CONFIG.width, POWERUP_CONFIG.height),
  };
}

export function spawnPowerup(canvasWidth: number): PowerUp {
  // Randomly choose powerup type
  const types: Array<'dual-gun' | 'shield' | 'speed'> = ['dual-gun', 'shield', 'speed'];
  const type = types[Math.floor(Math.random() * types.length)];

  // Center-based coordinates
  const x = Math.random() * canvasWidth;
  const y = -POWERUP_CONFIG.height / 2; // Start above screen (center at -height/2)

  return createPowerup(x, y, type);
}

export function updatePowerups(
  powerups: PowerUp[],
  canvasHeight: number,
  deltaTime: number
): void {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const powerup = powerups[i];

    // Update position (center-based)
    powerup.position.y += powerup.velocityY * deltaTime * 60;

    // Remove if off screen (bottom edge passes canvas bottom)
    if (powerup.position.y - powerup.height / 2 > canvasHeight) {
      powerups.splice(i, 1);
    }
  }
}

export function checkPlayerPowerupCollision(
  player: { position: { x: number; y: number }; collisionBodies: any[] },
  powerups: PowerUp[]
): PowerUp | null {
  for (const powerup of powerups) {
    if (checkPhysicsCollision(player, powerup)) {
      return powerup;
    }
  }
  return null;
}

export { POWERUP_CONFIG };
