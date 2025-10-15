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

function getAbsoluteLeftRight(pos: Vector2D, box: HitboxDef): {left: number, right: number} {
  const halfWidth = box.width ? box.width / 2 : 0
  const midX = pos.x + box.offset.x
  const left = midX - halfWidth;
  const right = midX + halfWidth
  return { left, right }
}
function getAbsoluteTopBottom(pos: Vector2D, box: HitboxDef): {top: number, bottom: number} {
  const halfHeight = box.height ? box.height / 2 : 0
  const midY = pos.y + box.offset.y
  const top = midY - halfHeight;
  const bottom = midY + halfHeight
  return { top, bottom }
}
// Rectangle-Rectangle collision
function checkRectRectCollision(
  posA: Vector2D,
  hitboxA: HitboxDef,
  posB: Vector2D,
  hitboxB: HitboxDef
): boolean {
  const { left: aLeft, right: aRight } = getAbsoluteLeftRight(posA, hitboxA)
  const { top: aTop, bottom: aBottom } = getAbsoluteTopBottom(posA, hitboxA)

  const { left: bLeft, right: bRight } = getAbsoluteLeftRight(posB, hitboxB)
  const { top: bTop, bottom: bBottom } = getAbsoluteTopBottom(posB, hitboxB)

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
  const { left: rectLeft, right: rectRight } = getAbsoluteLeftRight(rectPos, rectHitbox);
  const { top: rectTop, bottom: rectBottom } = getAbsoluteTopBottom(rectPos, rectHitbox);

  const circleCenterX = circlePos.x + circleHitbox.offset.x;
  const circleCenterY = circlePos.y + circleHitbox.offset.y;
  const circleRadius = circleHitbox.radius || 0;

  // Find the closest point on the rectangle to the circle center
  const closestX = Math.max(rectLeft, Math.min(circleCenterX, rectRight));
  const closestY = Math.max(rectTop, Math.min(circleCenterY, rectBottom));

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
      const { left, right } = getAbsoluteLeftRight(body.position, hitbox);
      const { top, bottom } = getAbsoluteTopBottom(body.position, hitbox);

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
    offset: { x: 0, y: height }, // Center of the wide rectangle
    width: width,
    height: height *.2,
  };

  const tallRect: HitboxDef = {
    type: 'rect',
    offset: { x: 0, y: 0 }, // Center of the tall rectangle
    width: width * .2,
    height: height,
  };
  return [wideRect, tallRect];
}

// Helper to create a rectangular hitbox
export function createRectHitbox(width: number, height: number): HitboxDef[] {
  return [
    {
      type: 'rect',
      offset: { x: 0, y: 0 }, // Center of the rectangle
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
      offset: { x: 0, y: 0 }, // Center of the circle
      radius,
    },
  ];
}
