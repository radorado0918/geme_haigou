"""AI生成したモンスター画像の白背景を透明にして、ゲーム用のサイズにそろえる。

使い方: python3 tools/cutout.py 入力.png public/monsters/<種族ID>.png
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

SIZE = 512  # 出力の最大辺
WHITE_THRESHOLD = 235  # これより明るい画素を背景候補にする


def cutout(src: str, dst: str) -> None:
    img = Image.open(src).convert('RGBA')
    a = np.array(img)
    h, w = a.shape[:2]
    light = (a[:, :, :3].min(axis=2) >= WHITE_THRESHOLD)

    # 上の辺と左右の辺（上半分）からつながっている白だけを背景とみなす。
    # 体の中の白や、画像の下で切れた足の中の白は残す
    bg = np.zeros((h, w), dtype=bool)
    q = deque()
    seeds = [(0, x) for x in range(w)] + [(y, x) for y in range(h // 2) for x in (0, w - 1)]
    for y, x in seeds:
        if light[y, x] and not bg[y, x]:
            bg[y, x] = True
            q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and light[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                q.append((ny, nx))

    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # 輪郭のギザギザを少しなめらかに
    alpha_img = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.8))
    a[:, :, 3] = np.array(alpha_img)
    out = Image.fromarray(a)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    out.thumbnail((SIZE, SIZE), Image.LANCZOS)
    out.save(dst)
    print(f'{dst}: {out.size[0]}x{out.size[1]}')


if __name__ == '__main__':
    cutout(sys.argv[1], sys.argv[2])
