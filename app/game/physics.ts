import type { Vector2D } from './types';

export interface HitboxDef {
  type: 'rect' | 'circle';
  offset: Vector2D;
  width?: number;
  height?: number;
  radius?: number;
}

export type PhysicsBody = {
  position: Vector2D;
  collisionBodies: HitboxDef[];
};

// Check collision between two physics bodies
export function checkPhysicsCollision(a: PhysicsBody, b: PhysicsBody): boolean {
  for (const hitboxA of a.collisionBodies) {
    for (const hitboxB of b.collisionBodies) {
      if (checkHitboxCollision(a.position, hitboxA, b.position, hitboxB)) {
        return true;
      }
    }
  }
  return false;
}

// Check collision between two individual hitboxes
function checkHitboxCollision(
  posA: Vector2D,
  hitboxA: HitboxDef,
  posB: Vector2D,
  hitboxB: HitboxDef
): boolean {
  if (hitboxA.type === 'rect' && hitboxB.type === 'rect') {
    return checkRectRectCollision(posA, hitboxA, posB, hitboxB);
  } else if (hitboxA.type === 'circle' && hitboxB.type === 'circle') {
    return checkCircleCircleCollision(posA, hitboxA, posB, hitboxB);
  } else if (hitboxA.type === 'rect' && hitboxB.type === 'circle') {
    return checkRectCircleCollision(posA, hitboxA, posB, hitboxB);
  } else if (hitboxA.type === 'circle' && hitboxB.type === 'rect') {
    return checkRectCircleCollision(posB, hitboxB, posA, hitboxA);
  }
  return false;
}

// Rectangle-Rectangle collision
function checkRectRectCollision(
  posA: Vector2D,
  hitboxA: HitboxDef,
  posB: Vector2D,
  hitboxB: HitboxDef
): boolean {
  const aLeft = posA.x + hitboxA.offset.x;
  const aRight = aLeft + (hitboxA.width || 0);
  const aTop = posA.y + hitboxA.offset.y;
  const aBottom = aTop + (hitboxA.height || 0);

  const bLeft = posB.x + hitboxB.offset.x;
  const bRight = bLeft + (hitboxB.width || 0);
  const bTop = posB.y + hitboxB.offset.y;
  const bBottom = bTop + (hitboxB.height || 0);

  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

// Circle-Circle collision
function checkCircleCircleCollision(
  posA: Vector2D,
  hitboxA: HitboxDef,
  posB: Vector2D,
  hitboxB: HitboxDef
): boolean {
  const centerAX = posA.x + hitboxA.offset.x;
  const centerAY = posA.y + hitboxA.offset.y;
  const centerBX = posB.x + hitboxB.offset.x;
  const centerBY = posB.y + hitboxB.offset.y;

  const dx = centerAX - centerBX;
  const dy = centerAY - centerBY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const radiusA = hitboxA.radius || 0;
  const radiusB = hitboxB.radius || 0;

  return distance < radiusA + radiusB;
}

// Rectangle-Circle collision
function checkRectCircleCollision(
  rectPos: Vector2D,
  rectHitbox: HitboxDef,
  circlePos: Vector2D,
  circleHitbox: HitboxDef
): boolean {
  const rectLeft = rectPos.x + rectHitbox.offset.x;
  const rectTop = rectPos.y + rectHitbox.offset.y;
  const rectWidth = rectHitbox.width || 0;
  const rectHeight = rectHitbox.height || 0;

  const circleCenterX = circlePos.x + circleHitbox.offset.x;
  const circleCenterY = circlePos.y + circleHitbox.offset.y;
  const circleRadius = circleHitbox.radius || 0;

  // Find the closest point on the rectangle to the circle center
  const closestX = Math.max(rectLeft, Math.min(circleCenterX, rectLeft + rectWidth));
  const closestY = Math.max(rectTop, Math.min(circleCenterY, rectTop + rectHeight));

  // Calculate distance from circle center to this closest point
  const dx = circleCenterX - closestX;
  const dy = circleCenterY - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < circleRadius;
}

// Check if a point collides with a physics body
export function checkPointPhysicsCollision(point: Vector2D, body: PhysicsBody): boolean {
  for (const hitbox of body.collisionBodies) {
    if (hitbox.type === 'rect') {
      const left = body.position.x + hitbox.offset.x;
      const right = left + (hitbox.width || 0);
      const top = body.position.y + hitbox.offset.y;
      const bottom = top + (hitbox.height || 0);

      if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) {
        return true;
      }
    } else if (hitbox.type === 'circle') {
      const centerX = body.position.x + hitbox.offset.x;
      const centerY = body.position.y + hitbox.offset.y;
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= (hitbox.radius || 0)) {
        return true;
      }
    }
  }
  return false;
}

// Helper to create a cross-shaped hitbox (two overlapping rectangles)
export function createCrossHitbox(width: number, height: number): HitboxDef[] {
  const wideRect: HitboxDef = {
    type: 'rect',
    offset: { x: 0, y: height * 0.25 },
    width: width,
    height: height * 0.5,
  };

  const tallRect: HitboxDef = {
    type: 'rect',
    offset: { x: width * 0.25, y: 0 },
    width: width * 0.5,
    height: height,
  };

  return [wideRect, tallRect];
}

// Helper to create a rectangular hitbox
export function createRectHitbox(width: number, height: number): HitboxDef[] {
  return [
    {
      type: 'rect',
      offset: { x: 0, y: 0 },
      width,
      height,
    },
  ];
}

// Helper to create a circular hitbox
export function createCircleHitbox(radius: number): HitboxDef[] {
  return [
    {
      type: 'circle',
      offset: { x: radius, y: radius },
      radius,
    },
  ];
}
