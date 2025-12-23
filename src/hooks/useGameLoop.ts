import { useCallback, useEffect, useRef } from 'react';
import {
  useSharedValue,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { updateBallPosition } from '../physics/ballPhysics';
import {
  checkPaddleCollision,
  checkWallCollision,
  checkScoring,
  calculatePaddleBounceVelocity,
} from '../physics/collisionUtils';
import { updateAIPaddle } from '../ai/aiController';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  BALL_MAX_SPEED,
  BALL_SPEED_INCREMENT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
} from '../physics/constants';

export interface GameEventCallbacks {
  onPaddleHit?: (isPlayer: boolean) => void;
  onWallBounce?: () => void;
  onPlayerScore?: () => void;
  onAIScore?: () => void;
}

export function useGameLoop(eventCallbacks?: GameEventCallbacks) {
  // Get level config from store
  const levelConfig = useGameStore((s) => s.levelConfig);

  // Ball state (shared values for UI thread)
  const ballX = useSharedValue(GAME_WIDTH / 2);
  const ballY = useSharedValue(GAME_HEIGHT / 2);
  const ballVelocityX = useSharedValue(0.5);
  const ballVelocityY = useSharedValue(-1);
  const ballSpeed = useSharedValue(BALL_INITIAL_SPEED);

  // Level config as shared values (for worklet access)
  const initialBallSpeed = useSharedValue(BALL_INITIAL_SPEED);
  const maxBallSpeed = useSharedValue(BALL_MAX_SPEED);
  const ballSpeedIncrement = useSharedValue(BALL_SPEED_INCREMENT);
  const aiReactionSpeed = useSharedValue(0.06);
  const aiPredictionError = useSharedValue(25);
  const aiMaxSpeed = useSharedValue(4.5);

  // Store callbacks in ref to avoid worklet issues
  const callbacksRef = useRef(eventCallbacks);
  callbacksRef.current = eventCallbacks;

  // Update config shared values when levelConfig changes
  useEffect(() => {
    if (levelConfig) {
      initialBallSpeed.value = levelConfig.ballSpeed;
      maxBallSpeed.value = levelConfig.maxBallSpeed;
      ballSpeedIncrement.value = levelConfig.ballSpeedIncrement;
      aiReactionSpeed.value = levelConfig.aiReactionSpeed;
      aiPredictionError.value = levelConfig.aiPredictionError;
      aiMaxSpeed.value = levelConfig.aiMaxSpeed;
      // Reset ball speed to new initial
      ballSpeed.value = levelConfig.ballSpeed;
    }
  }, [levelConfig, initialBallSpeed, maxBallSpeed, ballSpeedIncrement, aiReactionSpeed, aiPredictionError, aiMaxSpeed, ballSpeed]);

  // Paddle positions
  const playerPaddleX = useSharedValue((GAME_WIDTH - PADDLE_WIDTH) / 2);
  const aiPaddleX = useSharedValue((GAME_WIDTH - PADDLE_WIDTH) / 2);

  // Game state flag for worklet
  const isPlaying = useSharedValue(false);

  // Paddle Y positions (fixed)
  const playerPaddleY = GAME_HEIGHT - PADDLE_MARGIN - PADDLE_HEIGHT;
  const aiPaddleY = PADDLE_MARGIN;

  // Subscribe to game store status
  const status = useGameStore((state) => state.status);

  // Update isPlaying shared value when status changes
  useEffect(() => {
    isPlaying.value = status === 'playing';
  }, [status, isPlaying]);

  // JS thread callbacks for events
  const handlePlayerScore = useCallback(() => {
    useGameStore.getState().incrementPlayerScore();
    callbacksRef.current?.onPlayerScore?.();
  }, []);

  const handleAIScore = useCallback(() => {
    useGameStore.getState().incrementAIScore();
    callbacksRef.current?.onAIScore?.();
  }, []);

  const handlePaddleHit = useCallback((isPlayer: boolean) => {
    callbacksRef.current?.onPaddleHit?.(isPlayer);
  }, []);

  const handleWallBounce = useCallback(() => {
    callbacksRef.current?.onWallBounce?.();
  }, []);

  // Reset ball to center
  const resetBall = useCallback(
    (scoredAgainst: 'player' | 'ai') => {
      'worklet';
      ballX.value = GAME_WIDTH / 2;
      ballY.value = GAME_HEIGHT / 2;
      ballSpeed.value = initialBallSpeed.value;

      // Random horizontal direction
      ballVelocityX.value = Math.random() > 0.5 ? 0.5 : -0.5;
      // Ball goes towards whoever just scored against
      ballVelocityY.value = scoredAgainst === 'player' ? 1 : -1;
    },
    [ballX, ballY, ballSpeed, ballVelocityX, ballVelocityY, initialBallSpeed]
  );

  // Main game loop
  useFrameCallback((frameInfo) => {
    'worklet';

    if (!isPlaying.value) return;

    const deltaTime = frameInfo.timeSincePreviousFrame ?? 16.67;

    // 1. Calculate new ball position
    const newPosition = updateBallPosition(
      ballX.value,
      ballY.value,
      ballVelocityX.value,
      ballVelocityY.value,
      ballSpeed.value,
      deltaTime
    );

    // 2. Check wall collisions (left/right)
    const wallHit = checkWallCollision(newPosition.x, BALL_RADIUS, GAME_WIDTH);
    if (wallHit) {
      ballVelocityX.value = -ballVelocityX.value;
      // Prevent ball from getting stuck in wall
      newPosition.x =
        wallHit === 'left' ? BALL_RADIUS : GAME_WIDTH - BALL_RADIUS;
      runOnJS(handleWallBounce)();
    }

    // 3. Check player paddle collision (bottom)
    if (
      ballVelocityY.value > 0 && // Ball moving down
      checkPaddleCollision(
        newPosition.x,
        newPosition.y,
        BALL_RADIUS,
        playerPaddleX.value,
        playerPaddleY,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
      )
    ) {
      const { vx, vy } = calculatePaddleBounceVelocity(
        newPosition.x,
        playerPaddleX.value,
        PADDLE_WIDTH,
        true
      );
      ballVelocityX.value = vx;
      ballVelocityY.value = vy;
      ballSpeed.value = Math.min(ballSpeed.value + ballSpeedIncrement.value, maxBallSpeed.value);
      // Prevent ball from getting stuck in paddle
      newPosition.y = playerPaddleY - BALL_RADIUS;
      runOnJS(handlePaddleHit)(true);
    }

    // 4. Check AI paddle collision (top)
    if (
      ballVelocityY.value < 0 && // Ball moving up
      checkPaddleCollision(
        newPosition.x,
        newPosition.y,
        BALL_RADIUS,
        aiPaddleX.value,
        aiPaddleY,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
      )
    ) {
      const { vx, vy } = calculatePaddleBounceVelocity(
        newPosition.x,
        aiPaddleX.value,
        PADDLE_WIDTH,
        false
      );
      ballVelocityX.value = vx;
      ballVelocityY.value = vy;
      ballSpeed.value = Math.min(ballSpeed.value + ballSpeedIncrement.value, maxBallSpeed.value);
      // Prevent ball from getting stuck in paddle
      newPosition.y = aiPaddleY + PADDLE_HEIGHT + BALL_RADIUS;
      runOnJS(handlePaddleHit)(false);
    }

    // 5. Check scoring
    const scorer = checkScoring(newPosition.y, BALL_RADIUS, GAME_HEIGHT);
    if (scorer) {
      if (scorer === 'player') {
        runOnJS(handlePlayerScore)();
      } else {
        runOnJS(handleAIScore)();
      }
      // Reset ball (goes towards whoever was scored against)
      resetBall(scorer === 'player' ? 'ai' : 'player');
      return; // Skip position update this frame
    }

    // 6. Update AI paddle with level-specific config
    updateAIPaddle(
      aiPaddleX,
      newPosition.x,
      newPosition.y,
      ballVelocityY.value,
      GAME_WIDTH,
      GAME_HEIGHT,
      deltaTime,
      {
        reactionSpeed: aiReactionSpeed.value,
        predictionError: aiPredictionError.value,
        maxSpeed: aiMaxSpeed.value,
      }
    );

    // 7. Apply new ball position
    ballX.value = newPosition.x;
    ballY.value = newPosition.y;
  });

  // Reset game state
  const resetGameState = useCallback(() => {
    ballX.value = GAME_WIDTH / 2;
    ballY.value = GAME_HEIGHT / 2;
    ballVelocityX.value = Math.random() > 0.5 ? 0.5 : -0.5;
    ballVelocityY.value = -1;
    ballSpeed.value = initialBallSpeed.value;
    playerPaddleX.value = (GAME_WIDTH - PADDLE_WIDTH) / 2;
    aiPaddleX.value = (GAME_WIDTH - PADDLE_WIDTH) / 2;
  }, [ballX, ballY, ballVelocityX, ballVelocityY, ballSpeed, playerPaddleX, aiPaddleX, initialBallSpeed]);

  return {
    // Ball state
    ballX,
    ballY,

    // Paddle state
    playerPaddleX,
    aiPaddleX,
    playerPaddleY,
    aiPaddleY,

    // Game control
    isPlaying,
    resetGameState,
  };
}
