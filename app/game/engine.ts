import type { GameState, KeysPressed } from './types';
import { initStars, updateStars } from './background';
import { createPlayerShip, updatePlayerShip } from './player-ship';
import { spawnAsteroid, updateAsteroids } from './asteroid';
import { fireBullets, updateBullets } from './weapons';
import { spawnPowerup, updatePowerups } from './powerup';
import { updateExplosions, createExplosion } from './effects';
import { checkPhysicsCollision } from './physics';
import { render } from './renderer';
import { preloadAssets } from './assets';

interface SpawnTimers {
  asteroidTimer: number;
  powerupTimer: number;
}

// GameEngine class for managing the game
export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private keysPressed: KeysPressed;
  private spawnTimers: SpawnTimers;
  private lastTime: number;
  private animationFrameId: number | null;
  private assetsLoaded: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;

    this.state = initGameState(canvas.width, canvas.height, 'normal');
    this.keysPressed = {
      w: false,
      a: false,
      s: false,
      d: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false,
      Escape: false,
      ' ': false,
    };
    this.spawnTimers = {
      asteroidTimer: 0,
      powerupTimer: 0,
    };
    this.lastTime = 0;
    this.animationFrameId = null;
    this.assetsLoaded = false;

    this.setupKeyboardHandlers();
  }

  private setupKeyboardHandlers(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key in this.keysPressed) {
      this.keysPressed[e.key as keyof KeysPressed] = true;

      // Handle pause toggle
      if (e.key === 'Escape') {
        this.state = togglePause(this.state);
      }

      // Handle restart
      if (e.key === 'r' && (this.state.gameOver || this.state.missionComplete)) {
        this.restart();
      }

      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (e.key in this.keysPressed) {
      this.keysPressed[e.key as keyof KeysPressed] = false;
      e.preventDefault();
    }
  };

  async start(): Promise<void> {
    // Preload assets first
    if (!this.assetsLoaded) {
      await preloadAssets();
      this.assetsLoaded = true;
    }

    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  restart(): void {
    this.state = initGameState(this.canvas.width, this.canvas.height, this.state.difficulty);
    this.spawnTimers = {
      asteroidTimer: 0,
      powerupTimer: 0,
    };
  }

  private gameLoop = (currentTime: number): void => {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Update game state
    const { newState, newTimers } = updateGameState(
      this.state,
      deltaTime,
      this.keysPressed,
      this.canvas.width,
      this.canvas.height,
      this.spawnTimers
    );
    this.state = newState;
    this.spawnTimers = newTimers;

    // Render
    render(this.ctx, this.state, this.canvas);

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
}

// Initialize the game state
export function initGameState(
  canvasWidth: number,
  canvasHeight: number,
  difficulty: 'easy' | 'normal' | 'hard' = 'normal'
): GameState {
  return {
    player: createPlayerShip(canvasWidth, canvasHeight),
    stars: initStars(canvasWidth, canvasHeight, 100),
    asteroids: [],
    bullets: [],
    explosions: [],
    powerups: [],
    score: 0,
    paused: false,
    gameOver: false,
    missionComplete: false,
    difficulty,
  };
}

// Get spawn intervals based on difficulty
function getSpawnIntervals(difficulty: 'easy' | 'normal' | 'hard') {
  switch (difficulty) {
    case 'easy':
      return { asteroid: 2000, powerup: 15000 };
    case 'normal':
      return { asteroid: 1500, powerup: 20000 };
    case 'hard':
      return { asteroid: 1000, powerup: 25000 };
  }
}

// Update the game state
export function updateGameState(
  state: GameState,
  deltaTime: number,
  keysPressed: KeysPressed,
  canvasWidth: number,
  canvasHeight: number,
  spawnTimers: SpawnTimers
): { newState: GameState; newTimers: SpawnTimers } {
  if (state.paused || state.gameOver || state.missionComplete) {
    return { newState: state, newTimers: spawnTimers };
  }

  const intervals = getSpawnIntervals(state.difficulty);

  // Update timers
  let newAsteroidTimer = spawnTimers.asteroidTimer + deltaTime * 1000;
  let newPowerupTimer = spawnTimers.powerupTimer + deltaTime * 1000;

  // Spawn asteroids
  let newAsteroids = [...state.asteroids];
  if (newAsteroidTimer >= intervals.asteroid) {
    newAsteroids.push(spawnAsteroid(canvasWidth, state.difficulty));
    newAsteroidTimer = 0;
  }

  // Spawn powerups
  let newPowerups = [...state.powerups];
  if (newPowerupTimer >= intervals.powerup) {
    newPowerups.push(spawnPowerup(canvasWidth));
    newPowerupTimer = 0;
  }

  // Fire bullets (if spacebar is pressed)
  let newBullets = [...state.bullets];
  if (keysPressed[' ']) {
    const firedBullets = fireBullets(state.player.position.x, state.player.position.y, state.player.weaponLevel);
    newBullets.push(...firedBullets);
  }

  // Update entities (these functions mutate in place)
  updatePlayerShip(state.player, keysPressed, canvasWidth, canvasHeight, deltaTime);
  const updatedStars = updateStars(state.stars, deltaTime, canvasWidth, canvasHeight);
  updateAsteroids(newAsteroids, canvasHeight, deltaTime);
  updateBullets(newBullets, deltaTime);
  updatePowerups(newPowerups, canvasHeight, deltaTime);
  const updatedExplosions = updateExplosions(state.explosions, deltaTime);

  // Collision detection (use the updated arrays directly)
  let finalPlayer = state.player;
  let finalAsteroids = newAsteroids;
  let finalBullets = newBullets;
  let finalPowerups = newPowerups;
  let finalExplosions = updatedExplosions;
  let newScore = state.score;

  // Bullet-Asteroid collisions
  const bulletsToRemove = new Set<string>();
  const asteroidsToRemove = new Set<string>();

  for (const bullet of finalBullets) {
    for (const asteroid of finalAsteroids) {
      if (checkPhysicsCollision(bullet, asteroid)) {
        bulletsToRemove.add(bullet.id);

        // Damage asteroid
        asteroid.health -= bullet.damage;
        if (asteroid.health <= 0) {
          asteroidsToRemove.add(asteroid.id);
          newScore += asteroid.size === 'large' ? 100 : 50;

          // Create explosion at asteroid position
          finalExplosions.push(
            createExplosion(
              { x: asteroid.position.x + asteroid.width / 2, y: asteroid.position.y + asteroid.height / 2 },
              { x: 0, y: asteroid.velocityY * 0.5 },
              asteroid.size === 'large' ? 1.0 : 0.7
            )
          );
        }
      }
    }
  }

  finalBullets = finalBullets.filter((bullet) => !bulletsToRemove.has(bullet.id));
  finalAsteroids = finalAsteroids.filter((asteroid) => !asteroidsToRemove.has(asteroid.id));

  // Player-Asteroid collisions
  for (const asteroid of finalAsteroids) {
    if (checkPhysicsCollision(finalPlayer, asteroid)) {
      // Check if player has shield
      if (finalPlayer.shieldLevel > 0) {
        // Shield absorbs damage
        finalPlayer.shieldLevel -= 1;
        asteroidsToRemove.add(asteroid.id);

        // Create explosion at asteroid position
        finalExplosions.push(
          createExplosion(
            { x: asteroid.position.x + asteroid.width / 2, y: asteroid.position.y + asteroid.height / 2 },
            { x: 0, y: asteroid.velocityY * 0.5 },
            asteroid.size === 'large' ? 1.0 : 0.7
          )
        );
      } else {
        // Player takes damage
        finalPlayer.health -= asteroid.damage;
        asteroidsToRemove.add(asteroid.id);

        // Create explosion at asteroid position
        finalExplosions.push(
          createExplosion(
            { x: asteroid.position.x + asteroid.width / 2, y: asteroid.position.y + asteroid.height / 2 },
            { x: 0, y: asteroid.velocityY * 0.5 },
            asteroid.size === 'large' ? 1.0 : 0.7
          )
        );
      }
    }
  }

  finalAsteroids = finalAsteroids.filter((asteroid) => !asteroidsToRemove.has(asteroid.id));

  // Player-PowerUp collisions
  const powerupsToRemove = new Set<string>();
  for (const powerup of finalPowerups) {
    if (checkPhysicsCollision(finalPlayer, powerup)) {
      // Apply powerup effect directly
      if (powerup.type === 'dual-gun') {
        finalPlayer.weaponLevel = Math.min(4, finalPlayer.weaponLevel + 1);
      } else if (powerup.type === 'shield') {
        finalPlayer.shieldLevel = Math.min(2, finalPlayer.shieldLevel + 1);
      } else if (powerup.type === 'speed') {
        finalPlayer.speedLevel = Math.min(3, finalPlayer.speedLevel + 1);
        finalPlayer.speed = finalPlayer.baseSpeed * (1 + finalPlayer.speedLevel * 0.2);
      }
      powerupsToRemove.add(powerup.id);
    }
  }

  finalPowerups = finalPowerups.filter((powerup) => !powerupsToRemove.has(powerup.id));

  // Check game over
  const gameOver = finalPlayer.health <= 0;

  // Check mission complete (score threshold)
  const missionComplete = newScore >= 5000;

  return {
    newState: {
      ...state,
      player: finalPlayer,
      stars: updatedStars,
      asteroids: finalAsteroids,
      bullets: finalBullets,
      explosions: finalExplosions,
      powerups: finalPowerups,
      score: newScore,
      gameOver,
      missionComplete,
    },
    newTimers: {
      asteroidTimer: newAsteroidTimer,
      powerupTimer: newPowerupTimer,
    },
  };
}

// Toggle pause
export function togglePause(state: GameState): GameState {
  return {
    ...state,
    paused: !state.paused,
  };
}
