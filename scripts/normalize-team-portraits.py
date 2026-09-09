"""
Normalise the supplied team photographs to one framing for the team grid.

These are the client's own photographs, shot on location at the clinic, so
unlike a studio set they share no backdrop: some subjects stand against the
verandah, some against planting, one was sent in from elsewhere entirely. The
backgrounds are theirs and are left alone. What this script does is make the
*people* line up, which is the only thing a row of cards needs to agree on.

FRAMING - a face is detected in each plate and the crop is scaled and
translated so every face lands at the same size and the same height in a 3:4
frame. Faces rather than silhouettes: the earlier set was shot on a plain
sweep, where a subject could be cut out by how far each pixel sat from its
row's background, and the crown and shoulder span measured off that mask. On
these frames the background is foliage and window mullions, so a silhouette
measurement reads the hedge as shoulder. A face is the one landmark that
survives a busy backdrop, and fixing it fixes the head line and the head size
together.

Run:  python scripts/normalize-team-portraits.py
Writes public/team/*.jpg plus a guide-lined contact sheet beside this script.
Needs opencv-python-headless (4.x - the Haar cascades this uses were dropped
in 5.0) and Pillow.
"""
import os
import cv2
import numpy as np
from PIL import Image

# Point this at wherever the raw plates live, and list them in FILES below.
SRC = r"C:\Users\This PC\Downloads"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "team")

# 3:4 to match .v2-team-photo.
OUT_W, OUT_H = 900, 1200

# Where the detected face box lands, as fractions of the frame. The cascade's
# box runs brow to chin rather than crown to chin, so these are not head
# measurements - they are the two numbers that, on this set, put the crowns on
# the 12% line and the shoulders across roughly two thirds of the frame, which
# is the framing the grid was designed around. Re-check the contact sheet if
# either is changed: the guide lines on it are drawn at the target crown and
# at the frame's midpoint.
FACE_H_FRAC = 0.20
FACE_TOP_FRAC = 0.175

# Ordered as the cards are. Five of these are full-size frames from the
# location shoot. Two are not, and both are framed tighter than the target:
# Dr. Ramya's came in separately and is phone-sized, and Dr. Emidaka's is a
# WhatsApp crop of a shoot frame - the client picked that frame over the
# full-size ERS_9719.jpg, which fits the framing but is a different pose. On
# a plate this tight there is not enough picture around the subject to reach
# the framing above, so it is cropped as wide as the plate allows and the
# head reads larger than its row-mates'. Those are the two plates to
# re-request at full size if the row ever needs to match properly; the run
# flags each one as PLATE TOO TIGHT.
FILES = [
    ("WhatsApp Image 2026-09-01 at 9.56.35 PM (1).jpeg", "emidaka"),   # badge: Dr Emidaka Dkhar
    ("ERS_9677.jpg", "practitioner-1"),
    ("WhatsApp Image 2026-08-23 at 1.48.20 PM.jpeg", "practitioner-2"),
    ("ERS_9673.jpg", "practitioner-3"),
    ("ERS_9576.jpg", "practitioner-4"),
    ("ERS_9614-2.jpg", "practitioner-5"),
    ("ERS_9636.jpg", "practitioner-6"),                          # badge: Ms. Aiba
]

CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


def find_face(path):
    """Largest face in the plate, in source pixels.

    Detection runs on a 900px-wide copy: the plates are up to 6000px tall and
    the cascade is both slower and jumpier at full size. Every plate here has
    the subject as far and away the largest face - anyone in the background is
    a fraction of the size - so taking the largest box is enough, and there is
    no need to reason about position.
    """
    img = cv2.imread(path)
    if img is None:
        raise SystemExit("could not read " + path)
    h, w = img.shape[:2]
    scale = 900.0 / w
    small = cv2.resize(img, (900, int(h * scale)))
    grey = cv2.equalizeHist(cv2.cvtColor(small, cv2.COLOR_BGR2GRAY))
    faces = sorted(CASCADE.detectMultiScale(grey, 1.08, 6, minSize=(50, 50)),
                   key=lambda r: -r[2] * r[3])
    if not faces:
        raise SystemExit("no face found in " + path)
    x, y, fw, fh = (v / scale for v in faces[0])
    return x, y, fw, fh


def reframe(path, out_path, out_w=OUT_W, out_h=OUT_H,
            face_h_frac=FACE_H_FRAC, face_top_frac=FACE_TOP_FRAC):
    fx, fy, fw, fh = find_face(path)
    arr = np.asarray(Image.open(path).convert("RGB"))
    h, w = arr.shape[:2]

    scale = (face_h_frac * out_h) / fh
    # A plate framed tighter than the target cannot be zoomed out - the
    # picture the crop wants simply is not there. Rather than replicate an
    # edge across a third of the card, fall back to the widest crop the plate
    # can actually supply and report it, so the mismatch is a known one.
    fitted = max(scale, out_w / w, out_h / h)
    short = fitted > scale + 1e-9
    scale = fitted

    src_w, src_h = out_w / scale, out_h / scale
    left = (fx + fw / 2) - src_w / 2
    top = fy - (face_top_frac * out_h) / scale

    # Pad by edge replication where the crop runs past the plate. Only the
    # narrowest frames need it, and then only by a few dozen pixels down one
    # side, where replicating the edge is invisible against a soft background.
    # A crop that had to be fitted is instead slid back inside the plate: it is
    # already as wide as the picture goes, so it needs no padding at all.
    if short:
        left = max(0.0, min(left, w - src_w))
        top = max(0.0, min(top, h - src_h))
        pad_l = pad_t = pad_r = pad_b = 0
    else:
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
    Image.fromarray(arr).crop(box).resize((out_w, out_h), Image.LANCZOS).save(
        out_path, "JPEG", quality=88, optimize=True, progressive=True)
    return fh, scale, (pad_l, pad_t, pad_r, pad_b), short


os.makedirs(OUT, exist_ok=True)

sheet = Image.new("RGB", (OUT_W // 3 * len(FILES), OUT_H // 3), (27, 25, 22))
for i, (src, slug) in enumerate(FILES):
    dst = os.path.join(OUT, slug + ".jpg")
    face_h, scale, pads, short = reframe(os.path.join(SRC, src), dst)
    print("%-16s face=%4d scale=%.3f pad=%s  head=%.3f of frame%s  %dKB" % (
        slug, face_h, scale, pads, face_h * scale / OUT_H,
        "  PLATE TOO TIGHT" if short else "", os.path.getsize(dst) // 1024))
    sheet.paste(Image.open(dst).resize((OUT_W // 3, OUT_H // 3), Image.LANCZOS),
                (i * (OUT_W // 3), 0))

# Guide lines at the target crown and at the frame's vertical midpoint.
px = sheet.load()
for y in [int(0.12 * OUT_H // 3), OUT_H // 3 // 2]:
    for x in range(sheet.size[0]):
        px[x, y] = (255, 0, 128)
# Written beside the script, not into public/ - it is a checking aid, not an
# asset, and anything under public/ ships with the site.
sheet_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "team-contact-sheet.png")
sheet.save(sheet_path)
print("\ncontact sheet written to", sheet_path)


# ── The founder's bio portrait ───────────────────────────────────────────────
# /dr-emidaka-bio.jpg is not a grid card - it is the seated portrait the about
# section, the moving gallery and /gallery all draw on, and it is framed loose
# rather than to the row. The two fractions below are measured off the plate
# it replaces, so the new frame sits where the old one did. It is a landscape
# plate, so the 3:4 box takes the full height and the fallback above puts her
# head a little higher in the frame than the target asks; a portrait-oriented
# original of this frame is what would close that gap.
BIO_SRC = "WhatsApp Image 2026-09-01 at 9.57.04 PM (1).jpeg"
BIO_OUT = os.path.join(os.path.dirname(OUT), "dr-emidaka-bio.jpg")
BIO_W, BIO_H = 1200, 1600
BIO_FACE_H_FRAC = 0.1475
BIO_FACE_TOP_FRAC = 0.3208

face_h, scale, pads, short = reframe(
    os.path.join(SRC, BIO_SRC), BIO_OUT,
    BIO_W, BIO_H, BIO_FACE_H_FRAC, BIO_FACE_TOP_FRAC)
print("\n%-16s face=%4d scale=%.3f pad=%s  head=%.3f of frame%s  %dKB" % (
    "dr-emidaka-bio", face_h, scale, pads, face_h * scale / BIO_H,
    "  PLATE TOO TIGHT" if short else "", os.path.getsize(BIO_OUT) // 1024))
