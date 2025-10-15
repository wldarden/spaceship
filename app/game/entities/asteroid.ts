import type { Asteroid } from '../core/types';
import type { HitboxDef } from '../core/physics';
import {createCrossHitbox, checkPhysicsCollision, createCircleHitbox} from '../core/physics'

// Asteroid configuration by size
const ASTEROID_CONFIG = {
  medium: {
    width: 39,
    height: 39,
    damage: 15,
    health: 50,
    speed: { min: 1, max: 2.5 },
    asset: '/assets/enemies/Asteroid_Medium_01_39x39.png',
  },
  large: {
    width: 86,
    height: 86,
    damage: 35,
    health: 100,
    speed: { min: 0.5, max: 1.5 },
    asset: '/assets/enemies/Asteroid_Large_01_86x86.png',
  },
} as const;

export const ASTEROID_ASSETS = Object.values(ASTEROID_CONFIG).map((cfg) => cfg.asset);

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
    width: config.width,
    height: config.height,
    velocityY,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.05, // Random rotation speed
    size,
    damage: Math.floor(config.damage * difficultyMultiplier),
    health: config.health,
    collisionBodies: createCircleHitbox(config.width / 2),
  };
}

export function spawnAsteroid(
  canvasWidth: number,
  difficulty: 'easy' | 'normal' | 'hard'
): Asteroid {
  // Random size weighted toward medium
  const size: 'medium' | 'large' = Math.random() < 0.7 ? 'medium' : 'large';

  // Random X position across the screen (center-based coordinates)
  const config = ASTEROID_CONFIG[size];
  const x = Math.random() * canvasWidth;
  const y = -config.height / 2; // Start above screen (center is at -height/2)

  return createAsteroid(x, y, size, difficulty);
}

export function updateAsteroids(
  asteroids: Asteroid[],
  canvasHeight: number,
  deltaTime: number
): void {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];

    // Update position (center-based)
    asteroid.position.y += asteroid.velocityY * deltaTime * 60;

    // Update rotation
    asteroid.rotation += asteroid.rotationSpeed;

    // Remove if off screen (bottom edge of asteroid passes bottom of canvas)
    if (asteroid.position.y - asteroid.height / 2 > canvasHeight) {
      asteroids.splice(i, 1);
    }
  }
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

export { ASTEROID_CONFIG };
