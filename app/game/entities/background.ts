import type { Star } from '../core/types';

// Initialize the starfield
export function initStars(canvasWidth: number, canvasHeight: number, count: number = 100): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 100 + 50,
      brightness: Math.random() * 0.5 + 0.5,
    });
  }
  return stars;
}

// Update star positions (scrolling effect)
export function updateStars(
  stars: Star[],
  deltaTime: number,
  canvasWidth: number,
  canvasHeight: number
): Star[] {
  return stars.map((star) => {
    let newY = star.y + star.speed * deltaTime;

    // Wrap around when star goes off bottom
    if (newY > canvasHeight) {
      newY = 0;
      return {
        ...star,
        y: newY,
        x: Math.random() * canvasWidth,
      };
    }

    return {
      ...star,
      y: newY,
    };
  });
}
