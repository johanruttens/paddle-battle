#!/usr/bin/env python3
"""
Paddle Battle App Icon Generator
Creates a 1024x1024 neon arcade-style app icon
"""

from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math

# Canvas size
SIZE = 1024

# Colors
BACKGROUND = (10, 10, 10)  # #0a0a0a
CYAN = (0, 255, 255)  # #00ffff
MAGENTA = (255, 0, 255)  # #ff00ff
WHITE = (255, 255, 255)
DARK_CYAN = (0, 180, 180)
DARK_MAGENTA = (180, 0, 180)

def create_glow_layer(size, color, blur_radius):
    """Create a glowing layer"""
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    return layer

def draw_glowing_rect(draw, glow_img, x1, y1, x2, y2, color, glow_color, glow_size=20):
    """Draw a rectangle with glow effect"""
    # Draw glow on separate image
    glow_draw = ImageDraw.Draw(glow_img)
    for i in range(glow_size, 0, -2):
        alpha = int(100 * (1 - i/glow_size))
        glow_draw.rounded_rectangle(
            [x1-i, y1-i, x2+i, y2+i],
            radius=15+i,
            fill=(*glow_color, alpha)
        )
    # Draw main rect
    draw.rounded_rectangle([x1, y1, x2, y2], radius=15, fill=color)

def draw_glowing_ellipse(draw, glow_img, cx, cy, radius, color, glow_color, glow_size=30):
    """Draw a circle with glow effect"""
    glow_draw = ImageDraw.Draw(glow_img)
    # Outer glow
    for i in range(glow_size, 0, -1):
        alpha = int(80 * (1 - i/glow_size))
        r = radius + i
        glow_draw.ellipse(
            [cx-r, cy-r, cx+r, cy+r],
            fill=(*glow_color, alpha)
        )
    # Main circle
    draw.ellipse(
        [cx-radius, cy-radius, cx+radius, cy+radius],
        fill=color
    )

def draw_motion_trail(glow_img, start_x, start_y, end_x, end_y, color, ball_radius):
    """Draw motion trail behind the ball"""
    glow_draw = ImageDraw.Draw(glow_img)
    steps = 15
    for i in range(steps):
        t = i / steps
        x = start_x + (end_x - start_x) * t
        y = start_y + (end_y - start_y) * t
        r = ball_radius * (0.3 + 0.7 * t)
        alpha = int(60 * t)
        glow_draw.ellipse(
            [x-r, y-r, x+r, y+r],
            fill=(*color, alpha)
        )

def create_icon():
    # Create main image with alpha
    img = Image.new('RGBA', (SIZE, SIZE), (*BACKGROUND, 255))
    draw = ImageDraw.Draw(img)

    # Create glow layer
    glow_layer = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)

    # === Background gradient (subtle radial) ===
    for i in range(SIZE//2, 0, -5):
        alpha = int(20 * (i / (SIZE//2)))
        color = (20, 20, 40, alpha)
        draw.ellipse(
            [SIZE//2-i, SIZE//2-i, SIZE//2+i, SIZE//2+i],
            fill=color
        )

    # === Draw AI Paddle (top, magenta) ===
    paddle_width = 320
    paddle_height = 50
    paddle_radius = 25

    ai_paddle_x1 = (SIZE - paddle_width) // 2
    ai_paddle_y1 = 180
    ai_paddle_x2 = ai_paddle_x1 + paddle_width
    ai_paddle_y2 = ai_paddle_y1 + paddle_height

    # AI paddle glow
    for i in range(40, 0, -2):
        alpha = int(60 * (1 - i/40))
        glow_draw.rounded_rectangle(
            [ai_paddle_x1-i, ai_paddle_y1-i, ai_paddle_x2+i, ai_paddle_y2+i],
            radius=paddle_radius+i//2,
            fill=(*MAGENTA, alpha)
        )

    # === Draw Player Paddle (bottom, cyan) - LARGER and more prominent ===
    player_paddle_width = 380
    player_paddle_height = 60

    player_paddle_x1 = (SIZE - player_paddle_width) // 2
    player_paddle_y1 = SIZE - 220
    player_paddle_x2 = player_paddle_x1 + player_paddle_width
    player_paddle_y2 = player_paddle_y1 + player_paddle_height

    # Player paddle glow (stronger)
    for i in range(60, 0, -2):
        alpha = int(80 * (1 - i/60))
        glow_draw.rounded_rectangle(
            [player_paddle_x1-i, player_paddle_y1-i, player_paddle_x2+i, player_paddle_y2+i],
            radius=paddle_radius+i//2,
            fill=(*CYAN, alpha)
        )

    # === Draw Ball with motion trail ===
    ball_radius = 55
    ball_x = SIZE // 2 + 80
    ball_y = SIZE // 2 - 30

    # Motion trail (coming from upper left)
    trail_start_x = ball_x - 180
    trail_start_y = ball_y - 120
    draw_motion_trail(glow_layer, trail_start_x, trail_start_y, ball_x, ball_y, CYAN, ball_radius)

    # Ball glow (intense)
    for i in range(70, 0, -1):
        alpha = int(100 * (1 - i/70))
        r = ball_radius + i
        glow_draw.ellipse(
            [ball_x-r, ball_y-r, ball_x+r, ball_y+r],
            fill=(*CYAN, alpha)
        )

    # Inner cyan glow
    for i in range(30, 0, -1):
        alpha = int(150 * (1 - i/30))
        r = ball_radius + i
        glow_draw.ellipse(
            [ball_x-r, ball_y-r, ball_x+r, ball_y+r],
            fill=(200, 255, 255, alpha)
        )

    # === Composite glow layer ===
    # Apply gaussian blur to glow
    glow_blurred = glow_layer.filter(ImageFilter.GaussianBlur(radius=8))
    img = Image.alpha_composite(img, glow_blurred)
    draw = ImageDraw.Draw(img)

    # === Draw solid shapes on top ===
    # AI Paddle (magenta)
    draw.rounded_rectangle(
        [ai_paddle_x1, ai_paddle_y1, ai_paddle_x2, ai_paddle_y2],
        radius=paddle_radius,
        fill=MAGENTA
    )
    # Highlight on AI paddle
    draw.rounded_rectangle(
        [ai_paddle_x1+10, ai_paddle_y1+8, ai_paddle_x2-10, ai_paddle_y1+18],
        radius=5,
        fill=(255, 100, 255)
    )

    # Player Paddle (cyan)
    draw.rounded_rectangle(
        [player_paddle_x1, player_paddle_y1, player_paddle_x2, player_paddle_y2],
        radius=paddle_radius,
        fill=CYAN
    )
    # Highlight on player paddle
    draw.rounded_rectangle(
        [player_paddle_x1+10, player_paddle_y1+10, player_paddle_x2-10, player_paddle_y1+22],
        radius=5,
        fill=(150, 255, 255)
    )

    # Ball (white core with gradient)
    draw.ellipse(
        [ball_x-ball_radius, ball_y-ball_radius, ball_x+ball_radius, ball_y+ball_radius],
        fill=WHITE
    )
    # Ball inner highlight
    highlight_offset = -15
    highlight_radius = ball_radius * 0.4
    draw.ellipse(
        [ball_x+highlight_offset-highlight_radius, ball_y+highlight_offset-highlight_radius,
         ball_x+highlight_offset+highlight_radius, ball_y+highlight_offset+highlight_radius],
        fill=(255, 255, 255)
    )

    # === Add subtle scan lines for retro effect ===
    scanline_layer = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    scanline_draw = ImageDraw.Draw(scanline_layer)
    for y in range(0, SIZE, 4):
        scanline_draw.line([(0, y), (SIZE, y)], fill=(0, 0, 0, 15), width=1)

    img = Image.alpha_composite(img, scanline_layer)

    # === Add corner vignette ===
    vignette = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    vignette_draw = ImageDraw.Draw(vignette)
    for i in range(200):
        alpha = int(80 * (i / 200))
        offset = SIZE - i * 3
        if offset > 0:
            vignette_draw.rectangle([0, 0, SIZE, i*2], fill=(0, 0, 0, alpha//3))
            vignette_draw.rectangle([0, SIZE-i*2, SIZE, SIZE], fill=(0, 0, 0, alpha//3))

    img = Image.alpha_composite(img, vignette)

    # Convert to RGB (no transparency for App Store)
    final = Image.new('RGB', (SIZE, SIZE), BACKGROUND)
    final.paste(img, mask=img.split()[3])

    return final

if __name__ == '__main__':
    icon = create_icon()
    output_path = '/Users/johanruttens/Repositories/PaddleBattle/assets/icon.png'
    icon.save(output_path, 'PNG', quality=100)
    print(f"Icon saved to {output_path}")
    print(f"Size: {icon.size}")
