import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import type { Asteroid, Bullet, PowerUp, PlayerShip, KeysPressed } from "~/game/core/types";
import { createPlayerShip, updatePlayerShip, PLAYER_SHIP_CONFIG } from "~/game/entities/player";
import { createAsteroid, ASTEROID_CONFIG } from "~/game/entities/asteroid";
import { createBullet, fireBullets, updateBullets, BULLET_CONFIG } from "~/game/entities/bullet";
import { createPowerup, POWERUP_CONFIG } from "~/game/entities/powerup";
import { preloadAssets } from "~/game/core/assets";
import { checkPhysicsCollision } from "~/game/core/physics";
import { renderPlayerShip } from "~/game/rendering/player";
import { renderAsteroids } from "~/game/rendering/asteroid";
import { renderBullets } from "~/game/rendering/bullet";
import { renderPowerups } from "~/game/rendering/powerup";
import { renderHitboxes, renderLabel } from "~/game/rendering/debug";

interface TestLevelState {
  player: PlayerShip;
  staticAsteroids: Asteroid[];
  staticBullets: Bullet[];
  staticPowerups: PowerUp[];
  bullets: Bullet[]; // Active bullets fired by player
  keysPressed: KeysPressed;
}

export default function TestLevel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<TestLevelState | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const bulletCooldownRef = useRef<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize test level state
    const initTestLevel = async () => {
      await preloadAssets();

      const player = createPlayerShip(canvas.width, canvas.height);

      // Create static test objects arranged in a grid
      const staticAsteroids: Asteroid[] = [
        // Medium asteroids
        createAsteroid(200, 200, 'medium', 'normal'),
        createAsteroid(400, 200, 'medium', 'normal'),
        createAsteroid(600, 200, 'medium', 'normal'),

        // Large asteroids
        createAsteroid(200, 400, 'large', 'normal'),
        createAsteroid(400, 400, 'large', 'normal'),
        createAsteroid(600, 400, 'large', 'normal'),
      ];

      const staticBullets: Bullet[] = [
        createBullet(800, 200),
        createBullet(900, 200),
        createBullet(1000, 200),
      ];

      const staticPowerups: PowerUp[] = [
        createPowerup(800, 400, 'dual-gun'),
        createPowerup(900, 400, 'shield'),
        createPowerup(1000, 400, 'speed'),
      ];

      stateRef.current = {
        player,
        staticAsteroids,
        staticBullets,
        staticPowerups,
        bullets: [],
        keysPressed: {
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
        },
      };

      lastTimeRef.current = performance.now();
      gameLoop(lastTimeRef.current);
    };

    const gameLoop = (currentTime: number) => {
      if (!stateRef.current) return;

      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const state = stateRef.current;

      // Update player
      updatePlayerShip(state.player, state.keysPressed, canvas.width, canvas.height, deltaTime);

      // Update bullet cooldown
      bulletCooldownRef.current = Math.max(0, bulletCooldownRef.current - deltaTime * 1000);

      // Fire bullets
      if (state.keysPressed[' '] && bulletCooldownRef.current === 0) {
        const newBullets = fireBullets(
          state.player.position.x,
          state.player.position.y,
          state.player.weaponLevel
        );
        state.bullets.push(...newBullets);
        bulletCooldownRef.current = 500;
      }

      // Update active bullets
      updateBullets(state.bullets, deltaTime);

      // Remove bullets that hit static objects
      const bulletsToRemove = new Set<string>();
      for (const bullet of state.bullets) {
        for (const asteroid of state.staticAsteroids) {
          if (checkPhysicsCollision(bullet, asteroid)) {
            bulletsToRemove.add(bullet.id);
          }
        }
      }
      state.bullets = state.bullets.filter(b => !bulletsToRemove.has(b.id));

      // Render
      render(ctx, canvas, state);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: TestLevelState) => {
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render static objects
      renderAsteroids(ctx, state.staticAsteroids);
      renderBullets(ctx, state.staticBullets);
      renderPowerups(ctx, state.staticPowerups);

      // Render active bullets
      renderBullets(ctx, state.bullets);

      // Render player
      renderPlayerShip(ctx, state.player);

      // Render hitboxes with collision detection
      state.staticAsteroids.forEach((asteroid, i) => {
        const isColliding = checkPhysicsCollision(state.player, asteroid);
        renderHitboxes(ctx, asteroid, '#FF0000', isColliding);
        renderLabel(ctx, `Asteroid ${asteroid.size} ${i + 1}`, asteroid.position.x, asteroid.position.y - 60);
      });

      state.staticBullets.forEach((bullet, i) => {
        const isColliding = checkPhysicsCollision(state.player, bullet);
        renderHitboxes(ctx, bullet, '#FFFF00', isColliding);
        renderLabel(ctx, `Bullet ${i + 1}`, bullet.position.x, bullet.position.y - 40);
      });

      state.staticPowerups.forEach((powerup) => {
        const isColliding = checkPhysicsCollision(state.player, powerup);
        renderHitboxes(ctx, powerup, '#00FFFF', isColliding);
        renderLabel(ctx, `Powerup: ${powerup.type}`, powerup.position.x, powerup.position.y - 30);
      });

      state.bullets.forEach((bullet) => {
        // Check if player's bullet collides with any static object
        let isColliding = false;
        for (const asteroid of state.staticAsteroids) {
          if (checkPhysicsCollision(bullet, asteroid)) {
            isColliding = true;
            break;
          }
        }
        renderHitboxes(ctx, bullet, '#FFAA00', isColliding);
      });

      // Check if player collides with anything
      let playerColliding = false;
      for (const asteroid of state.staticAsteroids) {
        if (checkPhysicsCollision(state.player, asteroid)) {
          playerColliding = true;
          break;
        }
      }
      if (!playerColliding) {
        for (const bullet of state.staticBullets) {
          if (checkPhysicsCollision(state.player, bullet)) {
            playerColliding = true;
            break;
          }
        }
      }
      if (!playerColliding) {
        for (const powerup of state.staticPowerups) {
          if (checkPhysicsCollision(state.player, powerup)) {
            playerColliding = true;
            break;
          }
        }
      }

      renderHitboxes(ctx, state.player, '#00FF00', playerColliding);
      renderLabel(ctx, 'Player', state.player.position.x, state.player.position.y - 60, '#00FF00');

      // Info text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TEST LEVEL - Physics Debug Mode', 10, 30);
      ctx.fillText('WASD/Arrows: Move  |  Space: Fire  |  ESC: Back to Menu', 10, 50);
      ctx.fillText(`Player: ${Math.round(state.player.position.x)}, ${Math.round(state.player.position.y)}`, 10, 70);
      ctx.fillText(`Weapon Level: ${state.player.weaponLevel}`, 10, 90);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stateRef.current) return;

      if (e.key in stateRef.current.keysPressed) {
        stateRef.current.keysPressed[e.key as keyof KeysPressed] = true;

        if (e.key === 'Escape') {
          navigate('/');
        }

        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!stateRef.current) return;

      if (e.key in stateRef.current.keysPressed) {
        stateRef.current.keysPressed[e.key as keyof KeysPressed] = false;
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    initTestLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">
          🔧 TEST LEVEL - PHYSICS DEBUG 🔧
        </h1>
        <p className="text-gray-300 text-sm">
          Hidden debug level for testing collision detection and hitboxes
        </p>
      </div>

      <div className="relative border-4 border-amber-600 rounded-lg shadow-2xl">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="bg-black rounded"
        />
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-400 text-sm">
          All hitboxes are visible. Static objects have zero velocity.
        </p>
        <p className="text-gray-400 text-sm">
          Green = Player | Red = Asteroids | Yellow = Bullets | Cyan = Powerups
        </p>
      </div>
    </div>
  );
}
