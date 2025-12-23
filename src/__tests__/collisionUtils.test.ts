import {
  checkPaddleCollision,
  calculateBounceAngle,
  checkWallCollision,
  checkScoring,
  calculatePaddleBounceVelocity,
} from '../physics/collisionUtils';

describe('collisionUtils', () => {
  describe('checkPaddleCollision', () => {
    const paddleWidth = 80;
    const paddleHeight = 15;
    const ballRadius = 10;

    it('detects collision when ball is on paddle', () => {
      // Ball directly on top of paddle
      const result = checkPaddleCollision(
        100, // ballX - center of paddle
        95,  // ballY - just touching paddle top
        ballRadius,
        60,  // paddleX
        100, // paddleY
        paddleWidth,
        paddleHeight
      );
      expect(result).toBe(true);
    });

    it('detects collision at paddle edge', () => {
      // Ball at left edge of paddle
      const result = checkPaddleCollision(
        65,  // ballX - near left edge
        95,  // ballY
        ballRadius,
        60,  // paddleX
        100, // paddleY
        paddleWidth,
        paddleHeight
      );
      expect(result).toBe(true);
    });

    it('returns false when ball is far from paddle', () => {
      const result = checkPaddleCollision(
        100, // ballX
        50,  // ballY - far above paddle
        ballRadius,
        60,  // paddleX
        100, // paddleY
        paddleWidth,
        paddleHeight
      );
      expect(result).toBe(false);
    });

    it('returns false when ball misses paddle horizontally', () => {
      const result = checkPaddleCollision(
        200, // ballX - way off to the right
        100, // ballY - same height as paddle
        ballRadius,
        60,  // paddleX
        100, // paddleY
        paddleWidth,
        paddleHeight
      );
      expect(result).toBe(false);
    });

    it('detects collision when ball overlaps paddle corner', () => {
      const result = checkPaddleCollision(
        55,  // ballX - at corner
        95,  // ballY - at corner
        ballRadius,
        60,  // paddleX
        100, // paddleY
        paddleWidth,
        paddleHeight
      );
      expect(result).toBe(true);
    });
  });

  describe('calculateBounceAngle', () => {
    const paddleWidth = 80;

    it('returns 0 when ball hits center of paddle', () => {
      const angle = calculateBounceAngle(100, 60, paddleWidth);
      expect(angle).toBeCloseTo(0, 5);
    });

    it('returns positive angle when ball hits right side', () => {
      const angle = calculateBounceAngle(140, 60, paddleWidth); // Right edge
      expect(angle).toBeGreaterThan(0);
    });

    it('returns negative angle when ball hits left side', () => {
      const angle = calculateBounceAngle(60, 60, paddleWidth); // Left edge
      expect(angle).toBeLessThan(0);
    });

    it('clamps angle at extreme positions', () => {
      const maxAngle = (60 * Math.PI) / 180; // MAX_BOUNCE_ANGLE = 60

      // Far right
      const rightAngle = calculateBounceAngle(200, 60, paddleWidth);
      expect(rightAngle).toBeLessThanOrEqual(maxAngle);

      // Far left
      const leftAngle = calculateBounceAngle(0, 60, paddleWidth);
      expect(leftAngle).toBeGreaterThanOrEqual(-maxAngle);
    });
  });

  describe('checkWallCollision', () => {
    const screenWidth = 400;
    const ballRadius = 10;

    it('returns "left" when ball hits left wall', () => {
      const result = checkWallCollision(5, ballRadius, screenWidth);
      expect(result).toBe('left');
    });

    it('returns "right" when ball hits right wall', () => {
      const result = checkWallCollision(395, ballRadius, screenWidth);
      expect(result).toBe('right');
    });

    it('returns null when ball is in middle of screen', () => {
      const result = checkWallCollision(200, ballRadius, screenWidth);
      expect(result).toBeNull();
    });

    it('returns "left" when ball is exactly at left boundary', () => {
      const result = checkWallCollision(ballRadius, ballRadius, screenWidth);
      expect(result).toBe('left');
    });

    it('returns "right" when ball is exactly at right boundary', () => {
      const result = checkWallCollision(screenWidth - ballRadius, ballRadius, screenWidth);
      expect(result).toBe('right');
    });
  });

  describe('checkScoring', () => {
    const screenHeight = 800;
    const ballRadius = 10;

    it('returns "player" when ball passes top (AI missed)', () => {
      const result = checkScoring(5, ballRadius, screenHeight);
      expect(result).toBe('player');
    });

    it('returns "ai" when ball passes bottom (player missed)', () => {
      const result = checkScoring(795, ballRadius, screenHeight);
      expect(result).toBe('ai');
    });

    it('returns null when ball is in play', () => {
      const result = checkScoring(400, ballRadius, screenHeight);
      expect(result).toBeNull();
    });

    it('returns "player" when ball is exactly at top boundary', () => {
      const result = checkScoring(ballRadius, ballRadius, screenHeight);
      expect(result).toBe('player');
    });

    it('returns "ai" when ball is exactly at bottom boundary', () => {
      const result = checkScoring(screenHeight - ballRadius, ballRadius, screenHeight);
      expect(result).toBe('ai');
    });
  });

  describe('calculatePaddleBounceVelocity', () => {
    const paddleWidth = 80;

    it('sends ball upward from player paddle', () => {
      const { vx, vy } = calculatePaddleBounceVelocity(100, 60, paddleWidth, true);
      expect(vy).toBeLessThan(0); // Negative = upward
    });

    it('sends ball downward from AI paddle', () => {
      const { vx, vy } = calculatePaddleBounceVelocity(100, 60, paddleWidth, false);
      expect(vy).toBeGreaterThan(0); // Positive = downward
    });

    it('returns vx = 0 when ball hits center', () => {
      const { vx } = calculatePaddleBounceVelocity(100, 60, paddleWidth, true);
      expect(vx).toBeCloseTo(0, 5);
    });

    it('returns positive vx when ball hits right side', () => {
      const { vx } = calculatePaddleBounceVelocity(140, 60, paddleWidth, true);
      expect(vx).toBeGreaterThan(0);
    });

    it('returns negative vx when ball hits left side', () => {
      const { vx } = calculatePaddleBounceVelocity(60, 60, paddleWidth, true);
      expect(vx).toBeLessThan(0);
    });

    it('velocity vector is normalized', () => {
      const { vx, vy } = calculatePaddleBounceVelocity(140, 60, paddleWidth, true);
      const magnitude = Math.sqrt(vx * vx + vy * vy);
      expect(magnitude).toBeCloseTo(1, 1);
    });
  });
});
