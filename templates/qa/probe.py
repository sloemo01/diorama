#!/usr/bin/env python3
"""Sample a strip of pixels across an edge and print the colour runs.

    probe.py frame.png 520 425 560        # column 520, rows 425..560

The first tool to reach for when something "looks wrong" at an edge. It answers
which palette entry is on screen, how thick a band is, and whether a ramp steps
or fades, none of which a screenshot can be trusted for after it has been
downscaled once.
"""
import sys
from PIL import Image

def run(pixels):
    out = []
    prev = None
    start = 0
    for i, p in enumerate(pixels):
        if p != prev:
            if prev is not None:
                out.append((start, i - 1, prev))
            prev = p
            start = i
    out.append((start, len(pixels) - 1, prev))
    return out

def main(argv):
    path, x, y0, y1 = argv[1], int(argv[2]), int(argv[3]), int(argv[4])
    im = Image.open(path).convert('RGB')
    col = [im.getpixel((x, y)) for y in range(y0, y1)]
    for a, b, c in run(col):
        print(f'y {y0 + a}..{y0 + b}  {c}  #{c[0]:02x}{c[1]:02x}{c[2]:02x}  ({b - a + 1}px)')
    return 0

if __name__ == '__main__':
    if len(sys.argv) < 5:
        print(__doc__)
        sys.exit(1)
    sys.exit(main(sys.argv))
