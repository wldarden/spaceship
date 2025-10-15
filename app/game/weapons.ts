import type { Bullet, Asteroid } from './types';
import { getImage } from './assets';
import { createRectHitbox, checkPhysicsCollision } from './physics';

let bulletIdCounter = 0;

const BULLET_CONFIG = {
  width: 40,
  height: 64,
  speed: 12, // pixels per frame
  damage: 25,
  sprite: '/assets/weapons/MG.png',
};

export function createBullet(x: number, y: number, velocityX: number = 0, velocityY: number = -BULLET_CONFIG.speed): Bullet {
  return {
    id: `bullet-${bulletIdCounter++}`,
    position: { x, y },
    x,
    y,
    velocityX,
    velocityY,
    width: BULLET_CONFIG.width,
    height: BULLET_CONFIG.height,
    damage: BULLET_CONFIG.damage,
    collisionBodies: createRectHitbox(BULLET_CONFIG.width, BULLET_CONFIG.height),
  };
}

/**
 * Fire bullets based on weapon level
 * Returns array of newly created bullets
 */
export function fireBullets(playerX: number, playerY: number, weaponLevel: number): Bullet[] {
  const bullets: Bullet[] = [];
  const offset = 15;

  if (weaponLevel === 1) {
    // Level 1: Single gun - center
    bullets.push(createBullet(playerX, playerY));
  } else if (weaponLevel === 2) {
    // Level 2: Dual guns - left and right
    bullets.push(createBullet(playerX - offset, playerY));
    bullets.push(createBullet(playerX + offset, playerY));
  } else if (weaponLevel === 3) {
    // Level 3: Triple guns - left, center, right (all straight)
    bullets.push(createBullet(playerX - offset, playerY));
    bullets.push(createBullet(playerX, playerY));
    bullets.push(createBullet(playerX + offset, playerY));
  } else if (weaponLevel >= 4) {
    // Level 4: Triple guns + diagonal shots
    // Straight bullets (left, center, right)
    bullets.push(createBullet(playerX - offset, playerY));
    bullets.push(createBullet(playerX, playerY));
    bullets.push(createBullet(playerX + offset, playerY));

    // Diagonal bullets at 45 degrees
    const diagonalSpeed = BULLET_CONFIG.speed * 0.707; // cos(45°) = sin(45°) ≈ 0.707
    // Left diagonal (up-left)
    bullets.push(createBullet(playerX - offset, playerY, -diagonalSpeed, -diagonalSpeed));
    // Right diagonal (up-right)
    bullets.push(createBullet(playerX + offset, playerY, diagonalSpeed, -diagonalSpeed));
  }

  return bullets;
}

export function updateBullets(bullets: Bullet[], deltaTime: number): void {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    // Update position (both X and Y for diagonal bullets)
    bullet.x += bullet.velocityX * deltaTime * 60;
    bullet.y += bullet.velocityY * deltaTime * 60;
    bullet.position.x = bullet.x;
    bullet.position.y = bullet.y;

    // Remove if off screen (top or sides)
    if (bullet.y + bullet.height < 0 || bullet.x < -bullet.width || bullet.x > 2000) {
      bullets.splice(i, 1);
    }
  }
}

export function renderBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[]): void {
  const image = getImage(BULLET_CONFIG.sprite);

  for (const bullet of bullets) {
    if (image) {
      ctx.drawImage(
        image,
        bullet.x - bullet.width / 2,
        bullet.y - bullet.height / 2,
        bullet.width,
        bullet.height
      );
    } else {
      // Fallback rendering
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(
        bullet.x - bullet.width / 2,
        bullet.y - bullet.height / 2,
        bullet.width,
        bullet.height
      );
    }
  }
}

export function checkBulletAsteroidCollisions(
  bullets: Bullet[],
  asteroids: Asteroid[]
): Array<{ bullet: Bullet; asteroid: Asteroid }> {
  const collisions: Array<{ bullet: Bullet; asteroid: Asteroid }> = [];

  for (const bullet of bullets) {
    for (const asteroid of asteroids) {
      // Both Bullet and Asteroid extend PhysicsObject, so we can pass them directly
      if (checkPhysicsCollision(bullet, asteroid)) {
        collisions.push({ bullet, asteroid });
      }
    }
  }

  return collisions;
}
