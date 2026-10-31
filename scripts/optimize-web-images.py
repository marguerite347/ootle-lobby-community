"""Generate committed web derivatives. Requires Pillow and the cwebp CLI.

Original assets remain unchanged. Run after adding/changing site artwork or
preview posters; only local, reviewed inputs enter the client manifest.
"""
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CLIENT = ROOT / "creator-hub/hub/client"
PREVIEWS = ROOT / "creator-hub/hub/data/seed/previews"
ART = CLIENT / "public/seasonal/october-2026"
ART_WIDTHS = {
    "spooky-vault-scene.png": 960, "witch-builder-scene.png": 960,
    "ootlejuice-bug.png": 800, "confidential-potion.png": 960,
    "friendly-spider.png": 192, "pumpkin-leaves.png": 432,
    "creator-ghost.png": 640, "ritual-cauldron-v2.png": 640,
    "ritual-spellbook-v3.png": 640,
}

manifest = {}
sources = [(p, PREVIEWS, "/previews", [480, 960]) for p in sorted(PREVIEWS.rglob("*"))
           if p.is_file() and p.suffix.lower() in (".png", ".jpg", ".jpeg") and "optimized" not in p.parts]
sources += [(ART / name, ART, "/seasonal/october-2026", [width]) for name, width in ART_WIDTHS.items()]
source_total = output_total = 0
for source, base, public, widths in sources:
    original = source.read_bytes()
    digest = hashlib.sha256(original + b"webp-q86-alpha100-m6-v1").hexdigest()[:16]
    with Image.open(source) as im:
        original_width = im.width
    variants = []
    for width in sorted(set(min(w, original_width) for w in widths)):
        target = base / "optimized" / f"{digest}-{width}.webp"
        target.parent.mkdir(exist_ok=True)
        if not target.exists():
            subprocess.run(["cwebp", "-quiet", "-q", "86", "-alpha_q", "100", "-m", "6", "-resize", str(width), "0", str(source), "-o", str(target)], check=True)
        variants.append({"src": f"{public}/optimized/{target.name}", "width": width})
        output_total += target.stat().st_size
    manifest[f"{public}/{source.relative_to(base).as_posix()}"] = variants
    source_total += len(original)
(CLIENT / "src/imageVariants.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"{len(manifest)} reviewed images: {source_total:,} source bytes -> {output_total:,} bytes across all variants")
