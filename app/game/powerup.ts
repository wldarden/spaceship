import type { PowerUp } from './types';
import { createRectHitbox, checkPhysicsCollision } from './physics';

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
    x,
    y,
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

  const x = Math.random() * (canvasWidth - POWERUP_CONFIG.width) + POWERUP_CONFIG.width / 2;
  const y = -POWERUP_CONFIG.height;

  return createPowerup(x, y, type);
}

export function updatePowerups(
  powerups: PowerUp[],
  canvasHeight: number,
  deltaTime: number
): void {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const powerup = powerups[i];

    // Update position
    powerup.y += powerup.velocityY * deltaTime * 60;
    powerup.position.y = powerup.y;

    // Remove if off screen
    if (powerup.y - powerup.height / 2 > canvasHeight) {
      powerups.splice(i, 1);
    }
  }
}

export function renderPowerups(
  ctx: CanvasRenderingContext2D,
  powerups: PowerUp[]
): void {
  for (const powerup of powerups) {
    ctx.save();
    ctx.translate(powerup.x, powerup.y);

    // Pulsing glow effect
    const time = Date.now() / 1000;
    const pulseScale = 1 + Math.sin(time * 3) * 0.1;

    // Outer glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = getPowerupColor(powerup.type);

    // Draw powerup based on type
    if (powerup.type === 'dual-gun') {
      // Draw a weapon icon
      ctx.fillStyle = getPowerupColor(powerup.type);
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;

      // Draw star shape
      const spikes = 8;
      const outerRadius = (powerup.width / 2) * pulseScale;
      const innerRadius = outerRadius * 0.5;

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw icon in center based on type
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000';

      if (powerup.type === 'dual-gun') {
        // Gun symbol
        ctx.fillRect(-4, -6, 2, 12);
        ctx.fillRect(-4, -8, 6, 4);
      } else if (powerup.type === 'shield') {
        // Shield symbol - hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = Math.cos(angle) * 6;
          const y = Math.sin(angle) * 6;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else if (powerup.type === 'speed') {
        // Speed symbol - lightning bolt
        ctx.beginPath();
        ctx.moveTo(2, -8);
        ctx.lineTo(-2, 0);
        ctx.lineTo(1, 0);
        ctx.lineTo(-3, 8);
        ctx.lineTo(3, -2);
        ctx.lineTo(0, -2);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

function getPowerupColor(type: 'dual-gun' | 'shield' | 'speed'): string {
  switch (type) {
    case 'dual-gun':
      return '#FFD700'; // Gold
    case 'shield':
      return '#00BFFF'; // Blue
    case 'speed':
      return '#FF00FF'; // Magenta
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
