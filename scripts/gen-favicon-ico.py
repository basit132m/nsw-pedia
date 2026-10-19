"""
Builds a real multi-resolution favicon.ico (16/32/48) from the squared console
crop that gen-assets.mjs produces. Run gen-assets.mjs first.
"""
from PIL import Image
import os

SRC = 'public/favicon-ico-source.png'
OUT = 'public/favicon.ico'

img = Image.open(SRC).convert('RGBA')
img.save(OUT, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
os.remove(SRC)
print(f'  ✓ {OUT} ({os.path.getsize(OUT)} bytes, 16/32/48)')
