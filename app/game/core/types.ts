import type { HitboxDef } from './physics';

export interface Vector2D {
  x: number;
  y: number;
}

// Base interface for all physical objects in the game
export interface PhysicsObject {
  position: Vector2D;
  collisionBodies: HitboxDef[];
}

export interface PlayerShip extends PhysicsObject {
  velocity: Vector2D;
  speed: number;
  baseSpeed: number; // Base speed before speed boosts
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  weaponLevel: number; // 1 = single gun, 2 = dual guns, etc.
  shieldLevel: number; // 0 = no shield, 1-2 = shield layers
  speedLevel: number; // 0 = no boost, 1-3 = speed boost levels
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export interface Asteroid extends PhysicsObject {
  id: string;
  width: number;
  height: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  size: 'medium' | 'large';
  damage: number;
  health: number;
}

export interface Explosion {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  currentFrame: number;
  totalFrames: number;
  frameWidth: number;
  frameHeight: number;
  frameDuration: number;
  elapsedTime: number;
  scale: number;
  spriteSheet: string;
  finished: boolean;
}

export interface GameState {
  player: PlayerShip;
  stars: Star[];
  asteroids: Asteroid[];
  bullets: Bullet[];
  explosions: Explosion[];
  powerups: PowerUp[];
  score: number;
  paused: boolean;
  gameOver: boolean;
  missionComplete: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface Bullet extends PhysicsObject {
  id: string;
  velocityX: number;
  velocityY: number;
  width: number;
  height: number;
  damage: number;
}

export interface PowerUp extends PhysicsObject {
  id: string;
  velocityY: number;
  width: number;
  height: number;
  type: 'dual-gun' | 'shield' | 'speed';
}

export interface KeysPressed {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  ArrowUp: boolean;
  ArrowLeft: boolean;
  ArrowDown: boolean;
  ArrowRight: boolean;
  Escape: boolean;
  ' ': boolean; // Spacebar for firing
}
