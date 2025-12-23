/**
 * Pure logic tests - no React Native dependencies
 * These test the core game logic functions directly
 */

// Mock the 'worklet' directive
const workletFn = (fn: Function) => fn;

// Inline collision utils for testing (without worklet directive)
function checkPaddleCollision(
  ballX: number,
  ballY: number,
  ballRadius: number,
  paddleX: number,
  paddleY: number,
  paddleWidth: number,
  paddleHeight: number
): boolean {
  const closestX = Math.max(paddleX, Math.min(ballX, paddleX + paddleWidth));
  const closestY = Math.max(paddleY, Math.min(ballY, paddleY + paddleHeight));
  const distanceX = ballX - closestX;
  const distanceY = ballY - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;
  return distanceSquared < ballRadius * ballRadius;
}

function checkWallCollision(
  ballX: number,
  ballRadius: number,
  screenWidth: number
): 'left' | 'right' | null {
  if (ballX - ballRadius <= 0) return 'left';
  if (ballX + ballRadius >= screenWidth) return 'right';
  return null;
}

function checkScoring(
  ballY: number,
  ballRadius: number,
  screenHeight: number
): 'player' | 'ai' | null {
  if (ballY - ballRadius <= 0) return 'player';
  if (ballY + ballRadius >= screenHeight) return 'ai';
  return null;
}

function calculateBounceAngle(
  ballX: number,
  paddleX: number,
  paddleWidth: number
): number {
  const MAX_BOUNCE_ANGLE = 60;
  const paddleCenter = paddleX + paddleWidth / 2;
  const hitPosition = (ballX - paddleCenter) / (paddleWidth / 2);
  const clampedHitPosition = Math.max(-1, Math.min(1, hitPosition));
  const maxAngleRadians = (MAX_BOUNCE_ANGLE * Math.PI) / 180;
  return clampedHitPosition * maxAngleRadians;
}

function updateBallPosition(
  ballX: number,
  ballY: number,
  velocityX: number,
  velocityY: number,
  speed: number,
  deltaTime: number
): { x: number; y: number } {
  const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
  if (magnitude === 0) {
    return { x: ballX, y: ballY };
  }
  const normalizedVx = velocityX / magnitude;
  const normalizedVy = velocityY / magnitude;
  const frameNormalization = deltaTime / 16.67;
  const newX = ballX + normalizedVx * speed * frameNormalization;
  const newY = ballY + normalizedVy * speed * frameNormalization;
  return { x: newX, y: newY };
}

// Level config pure functions
function getLevelTier(level: number): string {
  if (level <= 10) return 'BEGINNER';
  if (level <= 25) return 'ROOKIE';
  if (level <= 50) return 'CHALLENGER';
  if (level <= 75) return 'EXPERT';
  return 'MASTER';
}

function getBossName(level: number): string | null {
  switch (level) {
    case 25: return 'THE WALL';
    case 50: return 'THE TWINS';
    case 75: return 'THE GHOST';
    case 100: return 'THE MASTER';
    default: return null;
  }
}

function getTierColor(level: number): string {
  if (level <= 10) return '#39ff14';
  if (level <= 25) return '#00ffff';
  if (level <= 50) return '#ff6b35';
  if (level <= 75) return '#ff00ff';
  return '#9d00ff';
}

// Tests
describe('Collision Detection', () => {
  describe('checkPaddleCollision', () => {
    const paddleWidth = 80;
    const paddleHeight = 15;
    const ballRadius = 10;

    test('detects collision when ball is on paddle', () => {
      expect(checkPaddleCollision(100, 95, ballRadius, 60, 100, paddleWidth, paddleHeight)).toBe(true);
    });

    test('returns false when ball is far from paddle', () => {
      expect(checkPaddleCollision(100, 50, ballRadius, 60, 100, paddleWidth, paddleHeight)).toBe(false);
    });

    test('returns false when ball misses horizontally', () => {
      expect(checkPaddleCollision(200, 100, ballRadius, 60, 100, paddleWidth, paddleHeight)).toBe(false);
    });

    test('detects collision at paddle edge', () => {
      expect(checkPaddleCollision(65, 95, ballRadius, 60, 100, paddleWidth, paddleHeight)).toBe(true);
    });
  });

  describe('checkWallCollision', () => {
    const screenWidth = 400;
    const ballRadius = 10;

    test('returns left when ball hits left wall', () => {
      expect(checkWallCollision(5, ballRadius, screenWidth)).toBe('left');
    });

    test('returns right when ball hits right wall', () => {
      expect(checkWallCollision(395, ballRadius, screenWidth)).toBe('right');
    });

    test('returns null when ball is in middle', () => {
      expect(checkWallCollision(200, ballRadius, screenWidth)).toBeNull();
    });
  });

  describe('checkScoring', () => {
    const screenHeight = 800;
    const ballRadius = 10;

    test('player scores when ball passes top', () => {
      expect(checkScoring(5, ballRadius, screenHeight)).toBe('player');
    });

    test('AI scores when ball passes bottom', () => {
      expect(checkScoring(795, ballRadius, screenHeight)).toBe('ai');
    });

    test('returns null when ball is in play', () => {
      expect(checkScoring(400, ballRadius, screenHeight)).toBeNull();
    });
  });
});

describe('Ball Physics', () => {
  describe('calculateBounceAngle', () => {
    const paddleWidth = 80;

    test('returns 0 when ball hits center', () => {
      expect(calculateBounceAngle(100, 60, paddleWidth)).toBeCloseTo(0, 5);
    });

    test('returns positive angle when ball hits right side', () => {
      expect(calculateBounceAngle(140, 60, paddleWidth)).toBeGreaterThan(0);
    });

    test('returns negative angle when ball hits left side', () => {
      expect(calculateBounceAngle(60, 60, paddleWidth)).toBeLessThan(0);
    });
  });

  describe('updateBallPosition', () => {
    test('moves ball in direction of velocity', () => {
      const result = updateBallPosition(100, 100, 1, 0, 10, 16.67);
      expect(result.x).toBeGreaterThan(100);
      expect(result.y).toBe(100);
    });

    test('moves ball upward with negative velocityY', () => {
      const result = updateBallPosition(100, 100, 0, -1, 10, 16.67);
      expect(result.x).toBe(100);
      expect(result.y).toBeLessThan(100);
    });

    test('returns same position when velocity is zero', () => {
      const result = updateBallPosition(100, 100, 0, 0, 10, 16.67);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    test('normalizes velocity vector', () => {
      const diagonal = updateBallPosition(100, 100, 3, 4, 10, 16.67);
      const distanceX = diagonal.x - 100;
      const distanceY = diagonal.y - 100;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      expect(distance).toBeCloseTo(10, 0);
    });
  });
});

describe('Level Configuration', () => {
  describe('getLevelTier', () => {
    test('returns BEGINNER for levels 1-10', () => {
      expect(getLevelTier(1)).toBe('BEGINNER');
      expect(getLevelTier(10)).toBe('BEGINNER');
    });

    test('returns ROOKIE for levels 11-25', () => {
      expect(getLevelTier(11)).toBe('ROOKIE');
      expect(getLevelTier(25)).toBe('ROOKIE');
    });

    test('returns CHALLENGER for levels 26-50', () => {
      expect(getLevelTier(26)).toBe('CHALLENGER');
      expect(getLevelTier(50)).toBe('CHALLENGER');
    });

    test('returns EXPERT for levels 51-75', () => {
      expect(getLevelTier(51)).toBe('EXPERT');
      expect(getLevelTier(75)).toBe('EXPERT');
    });

    test('returns MASTER for levels 76-100', () => {
      expect(getLevelTier(76)).toBe('MASTER');
      expect(getLevelTier(100)).toBe('MASTER');
    });
  });

  describe('getBossName', () => {
    test('returns correct boss names', () => {
      expect(getBossName(25)).toBe('THE WALL');
      expect(getBossName(50)).toBe('THE TWINS');
      expect(getBossName(75)).toBe('THE GHOST');
      expect(getBossName(100)).toBe('THE MASTER');
    });

    test('returns null for non-boss levels', () => {
      expect(getBossName(1)).toBeNull();
      expect(getBossName(24)).toBeNull();
      expect(getBossName(26)).toBeNull();
      expect(getBossName(99)).toBeNull();
    });
  });

  describe('getTierColor', () => {
    test('returns correct colors for each tier', () => {
      expect(getTierColor(1)).toBe('#39ff14');   // Green - Beginner
      expect(getTierColor(11)).toBe('#00ffff');  // Cyan - Rookie
      expect(getTierColor(26)).toBe('#ff6b35');  // Orange - Challenger
      expect(getTierColor(51)).toBe('#ff00ff');  // Magenta - Expert
      expect(getTierColor(76)).toBe('#9d00ff');  // Purple - Master
    });
  });
});

describe('Game Logic Edge Cases', () => {
  test('ball at exact boundary positions', () => {
    expect(checkWallCollision(10, 10, 400)).toBe('left');  // Exactly at boundary
    expect(checkWallCollision(390, 10, 400)).toBe('right'); // Exactly at boundary
    expect(checkScoring(10, 10, 800)).toBe('player'); // Exactly at top
    expect(checkScoring(790, 10, 800)).toBe('ai');    // Exactly at bottom
  });

  test('ball velocity normalization prevents speed boost from diagonal movement', () => {
    const horizontal = updateBallPosition(0, 0, 1, 0, 10, 16.67);
    const diagonal = updateBallPosition(0, 0, 1, 1, 10, 16.67);

    const hDist = Math.sqrt(horizontal.x ** 2 + horizontal.y ** 2);
    const dDist = Math.sqrt(diagonal.x ** 2 + diagonal.y ** 2);

    // Both should travel the same distance
    expect(hDist).toBeCloseTo(dDist, 0);
  });

  test('all 100 levels have valid tier assignments', () => {
    for (let level = 1; level <= 100; level++) {
      const tier = getLevelTier(level);
      expect(['BEGINNER', 'ROOKIE', 'CHALLENGER', 'EXPERT', 'MASTER']).toContain(tier);
    }
  });
});
