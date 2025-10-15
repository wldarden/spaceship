import type { GameState, KeysPressed } from './types';
import { initStars, updateStars } from './background';
import { createPlayer, updatePlayer } from './player-ship';
import { spawnAsteroid, updateAsteroids } from './asteroid';
import { fireBullets, updateBullets } from './weapons';
import { spawnPowerUp, updatePowerUps, collectPowerUp } from './powerup';
import { updateExplosions, createExplosion } from './effects';
import { checkPhysicsCollision } from './physics';
import { render } from './renderer';

interface SpawnTimers {
  asteroidTimer: number;
  powerupTimer: number;
}

// Initialize the game state
export function initGameState(
  canvasWidth: number,
  canvasHeight: number,
  difficulty: 'easy' | 'normal' | 'hard' = 'normal'
): GameState {
  return {
    player: createPlayer(canvasWidth, canvasHeight),
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
    newAsteroids.push(spawnAsteroid(canvasWidth, canvasHeight, state.difficulty));
    newAsteroidTimer = 0;
  }

  // Spawn powerups
  let newPowerups = [...state.powerups];
  if (newPowerupTimer >= intervals.powerup) {
    newPowerups.push(spawnPowerUp(canvasWidth));
    newPowerupTimer = 0;
  }

  // Fire bullets (if spacebar is pressed)
  let newBullets = [...state.bullets];
  if (keysPressed[' ']) {
    const firedBullets = fireBullets(state.player);
    newBullets.push(...firedBullets);
  }

  // Update entities
  const updatedPlayer = updatePlayer(state.player, keysPressed, deltaTime, canvasWidth, canvasHeight);
  const updatedStars = updateStars(state.stars, deltaTime, canvasWidth, canvasHeight);
  const updatedAsteroids = updateAsteroids(newAsteroids, deltaTime, canvasHeight);
  const updatedBullets = updateBullets(newBullets, deltaTime, canvasHeight);
  const updatedPowerups = updatePowerUps(newPowerups, deltaTime, canvasHeight);
  const updatedExplosions = updateExplosions(state.explosions, deltaTime);

  // Collision detection
  let finalPlayer = { ...updatedPlayer };
  let finalAsteroids = [...updatedAsteroids];
  let finalBullets = [...updatedBullets];
  let finalPowerups = [...updatedPowerups];
  let finalExplosions = [...updatedExplosions];
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
      finalPlayer = collectPowerUp(finalPlayer, powerup);
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

// Game loop
export function startGameLoop(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  initialState: GameState,
  keysPressed: KeysPressed
): () => void {
  let state = initialState;
  let lastTime = performance.now();
  let animationFrameId: number | null = null;

  const spawnTimers: SpawnTimers = {
    asteroidTimer: 0,
    powerupTimer: 0,
  };

  function gameLoop(currentTime: number) {
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Update game state
    const { newState, newTimers } = updateGameState(
      state,
      deltaTime,
      keysPressed,
      canvas.width,
      canvas.height,
      spawnTimers
    );
    state = newState;
    spawnTimers.asteroidTimer = newTimers.asteroidTimer;
    spawnTimers.powerupTimer = newTimers.powerupTimer;

    // Render
    render(ctx, state, canvas);

    // Continue loop
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Start the loop
  animationFrameId = requestAnimationFrame(gameLoop);

  // Return cleanup function
  return () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}

// Toggle pause
export function togglePause(state: GameState): GameState {
  return {
    ...state,
    paused: !state.paused,
  };
}

// Restart game
export function restartGame(canvasWidth: number, canvasHeight: number, difficulty: 'easy' | 'normal' | 'hard'): GameState {
  return initGameState(canvasWidth, canvasHeight, difficulty);
}
