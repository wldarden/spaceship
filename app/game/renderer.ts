import type { GameState } from './types';
import { renderStars } from './background';
import { renderAsteroids } from './asteroid';
import { renderPlayer } from './player-ship';
import { renderBullets } from './weapons';
import { renderPowerUps } from './powerup';
import { renderExplosions } from './effects';

// Main render function
export function render(ctx: CanvasRenderingContext2D, state: GameState, canvas: HTMLCanvasElement): void {
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render layers from back to front
  renderStars(ctx, state.stars);
  renderAsteroids(ctx, state.asteroids);
  renderBullets(ctx, state.bullets);
  renderPowerUps(ctx, state.powerups);
  renderPlayer(ctx, state.player);
  renderExplosions(ctx, state.explosions);

  // Render HUD
  renderHUD(ctx, state, canvas);

  // Render overlays
  if (state.paused) {
    renderPauseMenu(ctx, canvas);
  }

  if (state.gameOver) {
    renderGameOver(ctx, state, canvas);
  }

  if (state.missionComplete) {
    renderMissionComplete(ctx, state, canvas);
  }
}

// Render the HUD (health, score, etc.)
function renderHUD(ctx: CanvasRenderingContext2D, state: GameState, canvas: HTMLCanvasElement): void {
  ctx.save();

  // Score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${state.score}`, 20, 40);

  // Health bar
  const healthBarWidth = 200;
  const healthBarHeight = 20;
  const healthBarX = 20;
  const healthBarY = 60;

  // Health bar background
  ctx.fillStyle = '#333';
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  // Health bar fill
  const healthPercent = state.player.health / state.player.maxHealth;
  const healthColor = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
  ctx.fillStyle = healthColor;
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);

  // Health bar border
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  // Health text
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Health: ${Math.ceil(state.player.health)}/${state.player.maxHealth}`, healthBarX, healthBarY + healthBarHeight + 18);

  // Power-up indicators
  const powerupY = 110;
  ctx.font = '16px monospace';

  // Weapon level
  ctx.fillStyle = state.player.weaponLevel > 1 ? '#0ff' : '#666';
  ctx.fillText(`Weapon: Lv${state.player.weaponLevel}`, 20, powerupY);

  // Shield level
  ctx.fillStyle = state.player.shieldLevel > 0 ? '#0ff' : '#666';
  ctx.fillText(`Shield: ${state.player.shieldLevel}/2`, 20, powerupY + 25);

  // Speed level
  ctx.fillStyle = state.player.speedLevel > 0 ? '#0ff' : '#666';
  ctx.fillText(`Speed: ${state.player.speedLevel}/3`, 20, powerupY + 50);

  // Difficulty
  ctx.fillStyle = '#888';
  ctx.font = '14px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`Difficulty: ${state.difficulty.toUpperCase()}`, canvas.width - 20, 40);

  ctx.restore();
}

// Render pause menu
function renderPauseMenu(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  ctx.save();

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pause text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 40);

  // Instructions
  ctx.font = '20px monospace';
  ctx.fillText('Press ESC to resume', canvas.width / 2, canvas.height / 2 + 20);

  ctx.restore();
}

// Render game over screen
function renderGameOver(ctx: CanvasRenderingContext2D, state: GameState, canvas: HTMLCanvasElement): void {
  ctx.save();

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Game over text
  ctx.fillStyle = '#f00';
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);

  // Final score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px monospace';
  ctx.fillText(`Final Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 20);

  // Instructions
  ctx.font = '20px monospace';
  ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 80);

  ctx.restore();
}

// Render mission complete screen
function renderMissionComplete(ctx: CanvasRenderingContext2D, state: GameState, canvas: HTMLCanvasElement): void {
  ctx.save();

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mission complete text
  ctx.fillStyle = '#0f0';
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MISSION COMPLETE', canvas.width / 2, canvas.height / 2 - 60);

  // Final score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px monospace';
  ctx.fillText(`Final Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 20);

  // Instructions
  ctx.font = '20px monospace';
  ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 80);

  ctx.restore();
}
