import type { Asteroid } from './types';
import type { HitboxDef } from './physics';
import { getImage } from './assets';
import { createCrossHitbox, checkPhysicsCollision } from './physics';

// Asteroid configuration by size
const ASTEROID_CONFIG = {
  medium: {
    width: 60,
    height: 60,
    damage: 15,
    health: 50,
    speed: { min: 1, max: 2.5 },
    asset: '/assets/enemies/Asteroid_Medium_60x60_01.png',
  },
  large: {
    width: 128,
    height: 128,
    damage: 35,
    health: 100,
    speed: { min: 0.5, max: 1.5 },
    asset: '/assets/enemies/Asteroid_Large_128x128_01.png',
  },
} as const;

let asteroidIdCounter = 0;

export function createAsteroid(
  x: number,
  y: number,
  size: 'medium' | 'large',
  difficulty: 'easy' | 'normal' | 'hard'
): Asteroid {
  const config = ASTEROID_CONFIG[size];

  // Adjust damage based on difficulty
  const difficultyMultiplier = difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 1.5 : 1.0;

  // Random velocity within range
  const velocityY = config.speed.min + Math.random() * (config.speed.max - config.speed.min);

  return {
    id: `asteroid-${asteroidIdCounter++}`,
    position: { x, y },
    x,
    y,
    width: config.width,
    height: config.height,
    velocityY,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.05, // Random rotation speed
    size,
    damage: Math.floor(config.damage * difficultyMultiplier),
    health: config.health,
    collisionBodies: createCrossHitbox(config.width, config.height),
  };
}

export function spawnAsteroid(
  canvasWidth: number,
  difficulty: 'easy' | 'normal' | 'hard'
): Asteroid {
  // Random size weighted toward medium
  const size: 'medium' | 'large' = Math.random() < 0.7 ? 'medium' : 'large';

  // Random X position across the top of the screen
  const config = ASTEROID_CONFIG[size];
  const x = Math.random() * (canvasWidth - config.width) + config.width / 2;
  const y = -config.height; // Start above screen

  return createAsteroid(x, y, size, difficulty);
}

export function updateAsteroids(
  asteroids: Asteroid[],
  canvasHeight: number,
  deltaTime: number
): void {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];

    // Update position
    asteroid.y += asteroid.velocityY * deltaTime * 60;
    asteroid.position.y = asteroid.y;

    // Update rotation
    asteroid.rotation += asteroid.rotationSpeed;

    // Remove if off screen
    if (asteroid.y - asteroid.height / 2 > canvasHeight) {
      asteroids.splice(i, 1);
    }
  }
}

export function renderAsteroids(
  ctx: CanvasRenderingContext2D,
  asteroids: Asteroid[]
): void {
  for (const asteroid of asteroids) {
    const config = ASTEROID_CONFIG[asteroid.size];
    const image = getImage(config.asset);

    if (image) {
      // Draw rotated image manually
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);
      ctx.drawImage(
        image,
        -asteroid.width / 2,
        -asteroid.height / 2,
        asteroid.width,
        asteroid.height
      );
      ctx.restore();
    } else {
      // Fallback rendering if image not loaded
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(0, 0, asteroid.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }
}

// Check if two circular objects collide
export function checkCircleCollision(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

// Check if a point (circle) collides with a cross-shaped hitbox
// The cross is made of two rectangles: one horizontal (wide & short) and one vertical (tall & skinny)
export function checkPointCrossCollision(
  pointX: number,
  pointY: number,
  pointRadius: number,
  crossX: number,
  crossY: number,
  crossSize: number
): boolean {
  // Define the two rectangles that form the cross
  // Horizontal rectangle: 80% width, 40% height
  const horizWidth = crossSize * 0.8;
  const horizHeight = crossSize * 0.4;

  // Vertical rectangle: 40% width, 80% height
  const vertWidth = crossSize * 0.4;
  const vertHeight = crossSize * 0.8;

  // Check collision with horizontal rectangle
  const horizLeft = crossX - horizWidth / 2;
  const horizRight = crossX + horizWidth / 2;
  const horizTop = crossY - horizHeight / 2;
  const horizBottom = crossY + horizHeight / 2;

  const horizCollision =
    pointX + pointRadius > horizLeft &&
    pointX - pointRadius < horizRight &&
    pointY + pointRadius > horizTop &&
    pointY - pointRadius < horizBottom;

  if (horizCollision) return true;

  // Check collision with vertical rectangle
  const vertLeft = crossX - vertWidth / 2;
  const vertRight = crossX + vertWidth / 2;
  const vertTop = crossY - vertHeight / 2;
  const vertBottom = crossY + vertHeight / 2;

  const vertCollision =
    pointX + pointRadius > vertLeft &&
    pointX - pointRadius < vertRight &&
    pointY + pointRadius > vertTop &&
    pointY - pointRadius < vertBottom;

  return vertCollision;
}

export function checkPlayerAsteroidCollision(
  player: { position: { x: number; y: number }; collisionBodies: HitboxDef[] },
  asteroids: Asteroid[]
): Asteroid | null {
  for (const asteroid of asteroids) {
    // Both player and asteroid have PhysicsObject properties
    if (checkPhysicsCollision(player, asteroid)) {
      return asteroid;
    }
  }
  return null;
}

// Check if two cross-shaped hitboxes collide
export function checkCrossCrossCollision(
  x1: number,
  y1: number,
  width1: number,
  height1: number,
  x2: number,
  y2: number,
  width2: number,
  height2: number
): boolean {
  // First cross (player ship)
  // Horizontal rectangle: 80% width, 40% height
  const horiz1Width = width1 * 0.8;
  const horiz1Height = height1 * 0.4;

  // Vertical rectangle: 40% width, 80% height
  const vert1Width = width1 * 0.4;
  const vert1Height = height1 * 0.8;

  // Second cross (asteroid)
  const horiz2Width = width2 * 0.8;
  const horiz2Height = height2 * 0.4;
  const vert2Width = width2 * 0.4;
  const vert2Height = height2 * 0.8;

  // Check all combinations of rectangle collisions (4 total)
  // Player horizontal vs asteroid horizontal
  if (checkRectCollision(x1, y1, horiz1Width, horiz1Height, x2, y2, horiz2Width, horiz2Height)) return true;

  // Player horizontal vs asteroid vertical
  if (checkRectCollision(x1, y1, horiz1Width, horiz1Height, x2, y2, vert2Width, vert2Height)) return true;

  // Player vertical vs asteroid horizontal
  if (checkRectCollision(x1, y1, vert1Width, vert1Height, x2, y2, horiz2Width, horiz2Height)) return true;

  // Player vertical vs asteroid vertical
  if (checkRectCollision(x1, y1, vert1Width, vert1Height, x2, y2, vert2Width, vert2Height)) return true;

  return false;
}

// Check if two rectangles (centered at x, y) collide
function checkRectCollision(
  x1: number,
  y1: number,
  width1: number,
  height1: number,
  x2: number,
  y2: number,
  width2: number,
  height2: number
): boolean {
  const left1 = x1 - width1 / 2;
  const right1 = x1 + width1 / 2;
  const top1 = y1 - height1 / 2;
  const bottom1 = y1 + height1 / 2;

  const left2 = x2 - width2 / 2;
  const right2 = x2 + width2 / 2;
  const top2 = y2 - height2 / 2;
  const bottom2 = y2 + height2 / 2;

  return !(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2);
}
