"""
Generate PNG icons for India Salary Calculator PWA.
Uses only Python standard library (struct + zlib).
"""
import struct
import zlib
import os

def write_png(filename, width, height, pixels):
    """Write a simple PNG file from pixel data (RGBA)."""
    def make_chunk(name, data):
        c = name + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)  # 8-bit RGB
    ihdr = make_chunk(b'IHDR', ihdr_data)

    # Build raw image rows (filter type 0 = None)
    raw_rows = []
    for y in range(height):
        row = b'\x00'
        for x in range(width):
            r, g, b = pixels[y][x]
            row += bytes([r, g, b])
        raw_rows.append(row)

    raw_data = b''.join(raw_rows)
    idat = make_chunk(b'IDAT', zlib.compress(raw_data))
    iend = make_chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(signature + ihdr + idat + iend)


def draw_icon(size):
    """Draw a simple salary calculator icon."""
    pixels = [[(0, 0, 0)] * size for _ in range(size)]

    # Gradient background: deep blue
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            r = int(37 + (29 - 37) * t)
            g = int(99 + (78 - 99) * t)
            b = int(235 + (216 - 235) * t)
            pixels[y][x] = (r, g, b)

    # Draw rupee symbol (₹) as pixel art scaled to icon size
    # Define a 7x9 pixel template for ₹
    rupee = [
        "0111110",
        "1000001",
        "0111110",
        "0100000",
        "0011000",
        "0001100",
        "0000110",
        "0000011",
        "0000001",
    ]

    glyph_h = len(rupee)
    glyph_w = len(rupee[0])
    scale = max(1, size // 10)

    glyph_pixel_h = glyph_h * scale
    glyph_pixel_w = glyph_w * scale

    start_y = (size - glyph_pixel_h) // 2
    start_x = (size - glyph_pixel_w) // 2

    for gy, row_str in enumerate(rupee):
        for gx, bit in enumerate(row_str):
            if bit == '1':
                for dy in range(scale):
                    for dx in range(scale):
                        py = start_y + gy * scale + dy
                        px = start_x + gx * scale + dx
                        if 0 <= py < size and 0 <= px < size:
                            pixels[py][px] = (255, 255, 255)

    return pixels


def main():
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    output_dir = os.path.dirname(os.path.abspath(__file__))

    for size in sizes:
        filename = os.path.join(output_dir, f'icon-{size}.png')
        pixels = draw_icon(size)
        write_png(filename, size, size, pixels)
        print(f'Generated: {filename}')

    print(f'\nAll {len(sizes)} icons generated successfully!')


if __name__ == '__main__':
    main()
