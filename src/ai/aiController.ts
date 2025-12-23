import type { SharedValue } from 'react-native-reanimated';
import {
  AI_REACTION_SPEED,
  AI_PREDICTION_ERROR,
  AI_MAX_SPEED,
  PADDLE_WIDTH,
} from '../physics/constants';

interface AIConfig {
  reactionSpeed: number;
  predictionError: number;
  maxSpeed: number;
}

/**
 * Update AI paddle position to track the ball
 * Called from worklet context
 */
export function updateAIPaddle(
  aiPaddleX: SharedValue<number>,
  ballX: number,
  ballY: number,
  ballVelocityY: number,
  screenWidth: number,
  screenHeight: number,
  deltaTime: number,
  config?: AIConfig
): void {
  'worklet';

  // Use provided config or defaults
  const reactionSpeed = config?.reactionSpeed ?? AI_REACTION_SPEED;
  const predictionError = config?.predictionError ?? AI_PREDICTION_ERROR;
  const maxSpeed = config?.maxSpeed ?? AI_MAX_SPEED;

  // Only track ball when it's moving towards AI (upward)
  const trackingIntensity = ballVelocityY < 0 ? 1 : 0.3;

  // Calculate paddle center
  const paddleCenter = aiPaddleX.value + PADDLE_WIDTH / 2;

  // Add prediction error for imperfection (makes AI beatable)
  const errorAmount = (Math.random() - 0.5) * predictionError * 2;
  const targetX = ballX + errorAmount;

  // Calculate direction and distance to target
  const diff = targetX - paddleCenter;
  const direction = Math.sign(diff);
  const distance = Math.abs(diff);

  // Calculate movement speed based on distance and reaction speed
  const frameNormalization = deltaTime / 16.67;
  const moveAmount = Math.min(
    distance * reactionSpeed * trackingIntensity * frameNormalization,
    maxSpeed * frameNormalization
  );

  // Apply movement
  let newX = aiPaddleX.value + direction * moveAmount;

  // Clamp to screen bounds
  newX = Math.max(0, Math.min(newX, screenWidth - PADDLE_WIDTH));

  aiPaddleX.value = newX;
}
