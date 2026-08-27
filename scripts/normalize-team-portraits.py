"""
Normalise supplied studio portraits to one framing for the team grid.

The plates were generated at different distances and on different backdrops,
so this does two things to every image:

FRAMING - two landmarks are measured on each, the crown of the head and the
shoulder span, and the image is scaled and translated so both land on the same
spot in a 3:4 frame. Matching shoulders puts the bodies at one scale;
anchoring the crown puts the heads on one line.

BACKDROP - the studio sweeps do not match. One plate is a full stop darker and
warmer than the rest and carries a heavy vignette, which reads as a mismatched
card in the grid. Every backdrop is levelled onto a common mean and spread,
which lifts the dark one and flattens its gradient without touching the
subject. The target is the median across the set, so it tracks the group
rather than a hand-picked value, and a single outlier cannot drag it.

Background is estimated per row from the side margins rather than from the
corners: the vignetted plate defeats a single corner-sampled colour, which
reads the whole gradient as subject.

Run:  python scripts/normalize-team-portraits.py
Writes public/team/*.jpg plus a guide-lined contact sheet beside this script.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

# Point this at wherever the raw plates live, and list them in FILES below.
SRC = r"C:\Users\This PC\Downloads"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "team")

# 3:4 to match .v2-team-photo.
OUT_W, OUT_H = 900, 1200
# Where the crown sits, and how wide the shoulders are, as fractions of the
# frame. Shoulder span is the scale reference rather than head width: hair
# length swamps a head-width measurement (one subject's reads 60% wide on
# hair alone) whereas shoulders are stable, and matching them is what makes
# the bodies line up. The crown anchor then puts the heads on one line too.
HEAD_TOP_FRAC = 0.12
SHOULDER_W_FRAC = 0.68

# How hard the backdrop levelling is allowed to pull. Bounding the spread
# keeps a heavily vignetted plate from being flattened into visible banding.
STD_SCALE_LIMITS = (0.45, 1.6)
# Feather, in source pixels, on the subject cutout. Wispy hair has no clean
# edge; a hard mask leaves a halo where the correction stops dead.
FEATHER_PX = 7

# Hair that falls across the shoulders is counted as shoulder by a silhouette
# measurement, so a long-haired subject is scaled down too far. One nudge,
# applied to one plate, for that reason. Re-check against the contact sheet if
# the framing constants above are ever changed.
TWEAKS = {"practitioner-2": 1.12}

FILES = [
    ("c3e93ce6-b320-449c-93e8-e5af6c3bda56.png", "emidaka"),
    ("ChatGPT Image Aug 25, 2026, 08_52_30 PM.png", "practitioner-1"),
    ("ChatGPT Image Aug 25, 2026, 09_09_20 PM.png", "practitioner-2"),
    ("Gemini_Generated_Image_lo244mlo244mlo24.png", "practitioner-3"),
    ("ChatGPT Image Aug 25, 2026, 08_54_07 PM.png", "practitioner-4"),
    ("707c8284-da20-42f6-90fb-d8ef7118c5f9.png", "practitioner-5"),
    ("ChatGPT Image Aug 25, 2026, 09_05_34 PM.png", "practitioner-6"),
]


def subject_mask(arr):
    """True where the pixel departs from its own row's background."""
    h, w = arr.shape[:2]
    m = max(4, int(w * 0.05))
    margin = np.concatenate([arr[:, :m, :], arr[:, w - m:, :]], axis=1)
    bg = np.median(margin, axis=1)                      # (h, 3) per-row backdrop
    diff = np.abs(arr.astype(np.int16) - bg[:, None, :].astype(np.int16)).sum(axis=2)
    return diff > 40


def feathered_mask(hard):
    """Subject cutout as 0..1, softened so the backdrop fix has no hard edge."""
    img = Image.fromarray((hard * 255).astype(np.uint8))
    img = img.filter(ImageFilter.GaussianBlur(FEATHER_PX))
    return (np.asarray(img).astype(np.float32) / 255.0)[:, :, None]


def backdrop_stats(arr, soft):
    """Mean and spread of the backdrop only, well clear of the subject edge."""
    bg_only = (soft[:, :, 0] < 0.05)
    if bg_only.sum() < 500:
        bg_only = soft[:, :, 0] < 0.5
    px = arr[bg_only]
    return px.mean(axis=0), px.std(axis=0) + 1e-6


def landmarks(mask):
    """Crown row, shoulder span, and torso centre line."""
    h, w = mask.shape
    noise = max(3, int(w * 0.006))
    counts = mask.sum(axis=1)
    rows = np.where(counts >= noise)[0]
    if len(rows) == 0:
        return h * 0.2, w * 0.55, w / 2
    head_top, bottom = int(rows[0]), int(rows[-1])

    # Upper 55% of the subject covers head through crossed arms; the widest
    # part of it is the shoulder/arm span. The 97th percentile rather than the
    # max so a stray strand or a lens flare cannot set the scale.
    widths, centres = [], []
    for y in range(head_top, head_top + int((bottom - head_top) * 0.55)):
        if counts[y] < noise:
            continue
        xs = np.where(mask[y])[0]
        widths.append(xs[-1] - xs[0] + 1)
        centres.append((xs[0] + xs[-1]) / 2)
    if len(widths) < 4:
        return head_top, w * 0.55, w / 2
    shoulder_w = float(np.percentile(widths, 97))
    # Centre on the torso, not the head: hair can sit lopsided, shoulders do not.
    wide = [c for wd, c in zip(widths, centres) if wd > shoulder_w * 0.75]
    centre_x = float(np.median(wide)) if wide else float(np.median(centres))
    return head_top, shoulder_w, centre_x


def load(path):
    arr = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    hard = subject_mask(arr)
    soft = feathered_mask(hard)
    return arr, hard, soft


def level_backdrop(arr, soft, target_mean, target_std):
    """Pull this plate's backdrop onto the group's mean and spread."""
    mean, std = backdrop_stats(arr, soft)
    scale = np.clip(target_std / std, *STD_SCALE_LIMITS)
    fixed = (arr - mean) * scale + target_mean
    # Only the backdrop moves; the subject is carried through untouched, and
    # the feather blends the two across the cutout edge.
    return np.clip(arr * soft + fixed * (1.0 - soft), 0, 255)


def reframe(arr, hard, out_path, tweak=1.0):
    head_top, shoulder_w, centre_x = landmarks(hard)

    scale = (SHOULDER_W_FRAC * OUT_W) / shoulder_w * tweak
    src_w, src_h = OUT_W / scale, OUT_H / scale
    left = centre_x - src_w / 2
    top = head_top - (HEAD_TOP_FRAC * OUT_H) / scale

    # Pad by edge replication so a crop running past the plate keeps the
    # backdrop's own gradient instead of showing a flat seam.
    h, w = arr.shape[:2]
    pad_l = max(0, int(np.ceil(-left)))
    pad_t = max(0, int(np.ceil(-top)))
    pad_r = max(0, int(np.ceil(left + src_w - w)))
    pad_b = max(0, int(np.ceil(top + src_h - h)))
    if pad_l or pad_t or pad_r or pad_b:
        arr = np.pad(arr, ((pad_t, pad_b), (pad_l, pad_r), (0, 0)), mode="edge")
        left += pad_l
        top += pad_t

    box = (int(round(left)), int(round(top)),
           int(round(left + src_w)), int(round(top + src_h)))
    img = Image.fromarray(arr.astype(np.uint8))
    img.crop(box).resize((OUT_W, OUT_H), Image.LANCZOS).save(
        out_path, "JPEG", quality=88, optimize=True, progressive=True)
    return head_top, shoulder_w, centre_x, scale, (pad_l, pad_t, pad_r, pad_b)


os.makedirs(OUT, exist_ok=True)

# Pass 1 - read every backdrop, so the target is the group's own median and no
# single odd plate can drag it.
plates, means, stds = {}, [], []
for src, slug in FILES:
    arr, hard, soft = load(os.path.join(SRC, src))
    mean, std = backdrop_stats(arr, soft)
    plates[slug] = (arr, hard, soft, mean, std)
    means.append(mean)
    stds.append(std)
    print("%-16s backdrop before  mean=%s  std=%s" % (
        slug, np.round(mean, 1), np.round(std, 1)))

target_mean = np.median(np.array(means), axis=0)
target_std = np.median(np.array(stds), axis=0)
print("\ntarget backdrop  mean=%s  std=%s\n" % (
    np.round(target_mean, 1), np.round(target_std, 1)))

# Pass 2 - level each backdrop, then reframe.
sheet = Image.new("RGB", (OUT_W // 3 * len(FILES), OUT_H // 3), (27, 25, 22))
for i, (src, slug) in enumerate(FILES):
    arr, hard, soft, _, _ = plates[slug]
    arr = level_backdrop(arr, soft, target_mean, target_std)
    after_mean, after_std = backdrop_stats(arr, soft)
    dst = os.path.join(OUT, slug + ".jpg")
    ht, sw_, cx, sc, pads = reframe(arr, hard, dst, TWEAKS.get(slug, 1.0))
    print("%-16s crown=%4d shoulders=%4d scale=%.3f pad=%s  backdrop after "
          "mean=%s  %dKB" % (slug, ht, sw_, sc, pads, np.round(after_mean, 1),
                             os.path.getsize(dst) // 1024))
    sheet.paste(Image.open(dst).resize((OUT_W // 3, OUT_H // 3), Image.LANCZOS),
                (i * (OUT_W // 3), 0))

# Guide lines at the target crown and at the frame's vertical midpoint.
px = sheet.load()
for y in [int(HEAD_TOP_FRAC * OUT_H // 3), OUT_H // 3 // 2]:
    for x in range(sheet.size[0]):
        px[x, y] = (255, 0, 128)
# Written beside the script, not into public/ - it is a checking aid, not an
# asset, and anything under public/ ships with the site.
sheet_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "team-contact-sheet.png")
sheet.save(sheet_path)
print("\ncontact sheet written to", sheet_path)
