#!/usr/bin/env python3
"""Tile frames into a strip, optionally cropping and zooming.

    tile.py OUT.png f0.png f1.png ...            # side by side, 1x
    tile.py OUT.png --crop 420,300,640,450 --zoom 3 f0.png f1.png

Cropping first, then zooming, is not the same as the other way round: the crop
takes pixels from the original render, so a 3x zoom of a 200 px box shows real
pixels and real dither instead of a resampled blur. Judge speckle, contours and
pixel grid on this, never on the full frame.
"""
import sys
from PIL import Image

def main(argv):
    out = argv[1]
    args = argv[2:]
    crop = None
    zoom = 1
    files = []
    i = 0
    while i < len(args):
        if args[i] == '--crop':
            crop = tuple(int(n) for n in args[i + 1].split(','))
            i += 2
        elif args[i] == '--zoom':
            zoom = int(args[i + 1])
            i += 2
        else:
            files.append(args[i])
            i += 1

    if not files:
        print('no frames given')
        return 1

    ims = []
    for f in files:
        im = Image.open(f).convert('RGB')
        if crop:
            im = im.crop(crop)
        if zoom > 1:
            im = im.resize((im.width * zoom, im.height * zoom), Image.NEAREST)
        ims.append(im)

    w, h = ims[0].size
    strip = Image.new('RGB', (w * len(ims), h), 'white')
    for n, im in enumerate(ims):
        strip.paste(im, (n * w, 0))
    strip.save(out)
    print(out, strip.size)
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv))
