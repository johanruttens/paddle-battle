import type { SharedValue } from 'react-native-reanimated';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface PaddleState {
  x: SharedValue<number>;
  y: number;
  width: number;
  height: number;
}

export interface BallState {
  x: SharedValue<number>;
  y: SharedValue<number>;
  velocityX: SharedValue<number>;
  velocityY: SharedValue<number>;
  speed: SharedValue<number>;
  radius: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export type Winner = 'player' | 'ai' | null;

export interface GameState {
  playerScore: number;
  aiScore: number;
  status: GameStatus;
  winner: Winner;
  winningScore: number;
}

export interface GameActions {
  incrementPlayerScore: () => void;
  incrementAIScore: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  endGame: (winner: 'player' | 'ai') => void;
}

export type GameStore = GameState & GameActions;
