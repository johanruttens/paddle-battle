#!/usr/bin/env python3
"""
Paddle Battle Splash Screen Generator
Creates a 1284x2778 splash screen matching the icon style
"""

from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math

# Canvas size (iPhone Pro Max)
WIDTH = 1284
HEIGHT = 2778

# Colors
BACKGROUND = (10, 10, 10)
CYAN = (0, 255, 255)
MAGENTA = (255, 0, 255)
WHITE = (255, 255, 255)

def create_splash():
    # Create main image
    img = Image.new('RGBA', (WIDTH, HEIGHT), (*BACKGROUND, 255))
    draw = ImageDraw.Draw(img)

    # Glow layer
    glow_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)

    # Center position
    cx = WIDTH // 2
    cy = HEIGHT // 2

    # === Draw paddles and ball (like icon but larger) ===

    # AI Paddle (top, magenta)
    paddle_width = 400
    paddle_height = 60
    ai_y = cy - 250

    for i in range(50, 0, -2):
        alpha = int(60 * (1 - i/50))
        glow_draw.rounded_rectangle(
            [cx - paddle_width//2 - i, ai_y - i, cx + paddle_width//2 + i, ai_y + paddle_height + i],
            radius=30 + i//2,
            fill=(*MAGENTA, alpha)
        )

    # Player Paddle (bottom, cyan)
    player_y = cy + 190
    player_paddle_width = 450

    for i in range(60, 0, -2):
        alpha = int(80 * (1 - i/60))
        glow_draw.rounded_rectangle(
            [cx - player_paddle_width//2 - i, player_y - i, cx + player_paddle_width//2 + i, player_y + paddle_height + i],
            radius=30 + i//2,
            fill=(*CYAN, alpha)
        )

    # Ball
    ball_radius = 65
    ball_x = cx + 50
    ball_y = cy - 20

    # Motion trail
    trail_steps = 15
    for i in range(trail_steps):
        t = i / trail_steps
        x = ball_x - 150 * (1 - t)
        y = ball_y - 100 * (1 - t)
        r = ball_radius * (0.3 + 0.7 * t)
        alpha = int(60 * t)
        glow_draw.ellipse([x-r, y-r, x+r, y+r], fill=(*CYAN, alpha))

    # Ball glow
    for i in range(80, 0, -1):
        alpha = int(100 * (1 - i/80))
        r = ball_radius + i
        glow_draw.ellipse([ball_x-r, ball_y-r, ball_x+r, ball_y+r], fill=(*CYAN, alpha))

    # Blur and composite glow
    glow_blurred = glow_layer.filter(ImageFilter.GaussianBlur(radius=10))
    img = Image.alpha_composite(img, glow_blurred)
    draw = ImageDraw.Draw(img)

    # Draw solid shapes
    # AI Paddle
    draw.rounded_rectangle(
        [cx - paddle_width//2, ai_y, cx + paddle_width//2, ai_y + paddle_height],
        radius=30, fill=MAGENTA
    )
    draw.rounded_rectangle(
        [cx - paddle_width//2 + 15, ai_y + 10, cx + paddle_width//2 - 15, ai_y + 22],
        radius=6, fill=(255, 100, 255)
    )

    # Player Paddle
    draw.rounded_rectangle(
        [cx - player_paddle_width//2, player_y, cx + player_paddle_width//2, player_y + paddle_height],
        radius=30, fill=CYAN
    )
    draw.rounded_rectangle(
        [cx - player_paddle_width//2 + 15, player_y + 12, cx + player_paddle_width//2 - 15, player_y + 26],
        radius=6, fill=(150, 255, 255)
    )

    # Ball
    draw.ellipse([ball_x-ball_radius, ball_y-ball_radius, ball_x+ball_radius, ball_y+ball_radius], fill=WHITE)

    # Scan lines
    for y in range(0, HEIGHT, 4):
        draw.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, 12), width=1)

    # Convert to RGB
    final = Image.new('RGB', (WIDTH, HEIGHT), BACKGROUND)
    final.paste(img, mask=img.split()[3])

    return final

if __name__ == '__main__':
    splash = create_splash()
    output_path = '/Users/johanruttens/Repositories/PaddleBattle/assets/splash.png'
    splash.save(output_path, 'PNG')
    print(f"Splash saved to {output_path}")
    print(f"Size: {splash.size}")
