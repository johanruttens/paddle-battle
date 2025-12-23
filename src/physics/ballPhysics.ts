/**
 * Update ball position based on velocity and delta time
 * Frame-rate independent movement
 */
export function updateBallPosition(
  ballX: number,
  ballY: number,
  velocityX: number,
  velocityY: number,
  speed: number,
  deltaTime: number
): { x: number; y: number } {
  'worklet';

  // Normalize velocity vector
  const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
  if (magnitude === 0) {
    return { x: ballX, y: ballY };
  }

  const normalizedVx = velocityX / magnitude;
  const normalizedVy = velocityY / magnitude;

  // Frame-rate independent movement (normalize to 60fps)
  const frameNormalization = deltaTime / 16.67;

  // Calculate new position
  const newX = ballX + normalizedVx * speed * frameNormalization;
  const newY = ballY + normalizedVy * speed * frameNormalization;

  return { x: newX, y: newY };
}

/**
 * Generate random starting direction for ball
 */
export function getRandomStartDirection(): { vx: number; vy: number } {
  'worklet';

  // Random horizontal direction
  const vx = Math.random() > 0.5 ? 1 : -1;
  // Random vertical direction with slight angle
  const vy = Math.random() > 0.5 ? 1 : -1;

  // Add some randomness to the angle
  const angle = (Math.random() - 0.5) * 0.5; // -0.25 to 0.25

  return {
    vx: vx * (0.5 + Math.abs(angle)),
    vy: vy,
  };
}
