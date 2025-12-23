import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Screen dimensions
export const GAME_WIDTH = SCREEN_WIDTH;
export const GAME_HEIGHT = SCREEN_HEIGHT;

// Ball physics constants
export const BALL_INITIAL_SPEED = 6;
export const BALL_MAX_SPEED = 15;
export const BALL_SPEED_INCREMENT = 0.3;
export const BALL_RADIUS = 12;

// Bounce angle range in degrees (from perpendicular)
export const MAX_BOUNCE_ANGLE = 60;

// Paddle constants
export const PADDLE_WIDTH = 100;
export const PADDLE_HEIGHT = 16;
export const PADDLE_MARGIN = 60; // Distance from screen edge
export const PADDLE_BORDER_RADIUS = PADDLE_HEIGHT / 2;

// AI constants
export const AI_REACTION_SPEED = 0.08; // Lower = slower reaction (0-1)
export const AI_PREDICTION_ERROR = 30; // Pixels of random error
export const AI_MAX_SPEED = 5; // Max pixels per frame

// Game settings
export const DEFAULT_WINNING_SCORE = 5;

// Colors (80s neon palette - for later phases)
export const COLORS = {
  background: '#0a0a0a',
  playerPaddle: '#00ffff', // Cyan
  aiPaddle: '#ff00ff', // Magenta
  ball: '#ffffff',
  centerLine: 'rgba(255, 255, 255, 0.2)',
  scorePlayer: 'rgba(0, 255, 255, 0.6)',
  scoreAI: 'rgba(255, 0, 255, 0.6)',
} as const;
