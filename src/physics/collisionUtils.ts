import {
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  MAX_BOUNCE_ANGLE,
  BALL_RADIUS,
} from './constants';

/**
 * Check if ball collides with a paddle using AABB collision detection
 */
export function checkPaddleCollision(
  ballX: number,
  ballY: number,
  ballRadius: number,
  paddleX: number,
  paddleY: number,
  paddleWidth: number,
  paddleHeight: number
): boolean {
  'worklet';

  // Find the closest point on the paddle to the ball center
  const closestX = Math.max(paddleX, Math.min(ballX, paddleX + paddleWidth));
  const closestY = Math.max(paddleY, Math.min(ballY, paddleY + paddleHeight));

  // Calculate distance from ball center to closest point
  const distanceX = ballX - closestX;
  const distanceY = ballY - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  return distanceSquared < ballRadius * ballRadius;
}

/**
 * Calculate the bounce angle based on where the ball hits the paddle
 * Returns angle in radians from vertical
 */
export function calculateBounceAngle(
  ballX: number,
  paddleX: number,
  paddleWidth: number
): number {
  'worklet';

  // Calculate hit position relative to paddle center (-1 to 1)
  const paddleCenter = paddleX + paddleWidth / 2;
  const hitPosition = (ballX - paddleCenter) / (paddleWidth / 2);

  // Clamp to valid range
  const clampedHitPosition = Math.max(-1, Math.min(1, hitPosition));

  // Convert to angle in radians
  const maxAngleRadians = (MAX_BOUNCE_ANGLE * Math.PI) / 180;
  return clampedHitPosition * maxAngleRadians;
}

/**
 * Check if ball hits left or right wall
 */
export function checkWallCollision(
  ballX: number,
  ballRadius: number,
  screenWidth: number
): 'left' | 'right' | null {
  'worklet';

  if (ballX - ballRadius <= 0) return 'left';
  if (ballX + ballRadius >= screenWidth) return 'right';
  return null;
}

/**
 * Check if ball passed top or bottom (scoring event)
 */
export function checkScoring(
  ballY: number,
  ballRadius: number,
  screenHeight: number
): 'player' | 'ai' | null {
  'worklet';

  // Ball passed AI paddle (top) - player scores
  if (ballY - ballRadius <= 0) return 'player';
  // Ball passed player paddle (bottom) - AI scores
  if (ballY + ballRadius >= screenHeight) return 'ai';
  return null;
}

/**
 * Calculate new velocity after paddle collision
 */
export function calculatePaddleBounceVelocity(
  ballX: number,
  paddleX: number,
  paddleWidth: number,
  isPlayerPaddle: boolean
): { vx: number; vy: number } {
  'worklet';

  const bounceAngle = calculateBounceAngle(ballX, paddleX, paddleWidth);

  // Calculate velocity components
  const vx = Math.sin(bounceAngle);
  // Player paddle (bottom) sends ball up (-), AI paddle (top) sends ball down (+)
  const vy = isPlayerPaddle ? -Math.abs(Math.cos(bounceAngle)) : Math.abs(Math.cos(bounceAngle));

  return { vx, vy };
}
