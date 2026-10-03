"""Generate the Lobby Vault Daily Spark plates as self-contained SVG.

Labels are outlined from Poppins 800 so every plate renders identically in an <img>.
Usage (from creator-hub/hub, after npm ci):
  pip install fonttools brotli
  python3 scripts/daily-spark-art/generate.py client/public/daily-spark/vault-disc
  cp client/public/daily-spark/vault-disc/vault-charge-hero.svg client/public/daily-spark/vault-charge/
  node scripts/daily-spark-art/export-png.mjs
"""
import math, sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

HUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
FONT = TTFont(os.path.join(HUB, 'node_modules/@fontsource/poppins/files/poppins-latin-800-normal.woff2'))
GS, CMAP, HMTX, UPM = FONT.getGlyphSet(), FONT.getBestCmap(), FONT['hmtx'], FONT['head'].unitsPerEm
OUT = sys.argv[1]

INK, CLOUD, PURPLE, LIME = '#040723', '#ECEEFF', '#813BF5', '#C9EB00'
MULTIPLIERS = [1, 2, 1, 3, 2, 5]  # must match hub/server/dailyTrivia.mjs


def advance(ch, size, tracking=0.0):
    return HMTX[CMAP[ord(ch)]][0] * size / UPM + tracking * size


def text_width(text, size, tracking=0.0):
    return sum(advance(c, size, tracking) for c in text) - tracking * size


def text_d(text, size, cx, baseline, tracking=0.0):
    """Horizontal outlined text centred on cx."""
    x = cx - text_width(text, size, tracking) / 2
    parts = []
    for ch in text:
        pen = SVGPathPen(GS)
        s = size / UPM
        if ch != ' ':
            GS[CMAP[ord(ch)]].draw(TransformPen(pen, (s, 0, 0, -s, x, baseline)))
            parts.append(pen.getCommands())
        x += advance(ch, size, tracking)
    return ' '.join(parts)


def fit_size(text, width, largest, tracking=0.0):
    """Largest size up to `largest` at which text fits `width`."""
    return min(largest, largest * width / text_width(text, largest, tracking))


def arc_text_d(text, size, cx, cy, radius, centre_deg, tracking=0.0):
    """Text running clockwise along a circle, upright when read from outside at the top."""
    total = text_width(text, size, tracking)
    theta = math.radians(centre_deg) - total / 2 / radius
    parts = []
    for ch in text:
        w = advance(ch, size, tracking)
        mid = theta + (w - tracking * size) / 2 / radius
        if ch != ' ':
            g = HMTX[CMAP[ord(ch)]][0] * size / UPM
            # glyph origin sits half its width before the mid angle, along the tangent
            px, py = cx + radius * math.sin(mid), cy - radius * math.cos(mid)
            c, n = math.cos(mid), math.sin(mid)
            ox, oy = px - c * g / 2, py - n * g / 2
            s = size / UPM
            pen = SVGPathPen(GS)
            GS[CMAP[ord(ch)]].draw(TransformPen(pen, (s * c, s * n, s * n, -s * c, ox, oy)))
            parts.append(pen.getCommands())
        theta += w / radius
    return ' '.join(parts)


def pt(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.sin(a), cy - r * math.cos(a)


def wedge(cx, cy, r0, r1, a0, a1):
    p = [pt(cx, cy, r1, a0), pt(cx, cy, r1, a1), pt(cx, cy, r0, a1), pt(cx, cy, r0, a0)]
    return (f'M{p[0][0]:.2f},{p[0][1]:.2f} A{r1},{r1} 0 0 1 {p[1][0]:.2f},{p[1][1]:.2f} '
            f'L{p[2][0]:.2f},{p[2][1]:.2f} A{r0},{r0} 0 0 0 {p[3][0]:.2f},{p[3][1]:.2f} Z')


def arc(cx, cy, r, a0, a1):
    p, q = pt(cx, cy, r, a0), pt(cx, cy, r, a1)
    large = 1 if (a1 - a0) % 360 > 180 else 0
    return f'M{p[0]:.2f},{p[1]:.2f} A{r},{r} 0 {large} 1 {q[0]:.2f},{q[1]:.2f}'


def spark(x, y, r, fill, extra=''):
    """Four-point star."""
    k = r * 0.28
    return (f'<path d="M{x},{y-r} Q{x+k},{y-k} {x+r},{y} Q{x+k},{y+k} {x},{y+r} '
            f'Q{x-k},{y+k} {x-r},{y} Q{x-k},{y-k} {x},{y-r} Z" fill="{fill}"{extra}/>')


def diamond(x, y, r, fill, stroke=INK):
    return f'<path d="M{x},{y-r} L{x+r*.72},{y} L{x},{y+r} L{x-r*.72},{y} Z" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>'


def write(name, body):
    with open(os.path.join(OUT, name), 'w') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n' + body.strip() + '\n')


# ---------------------------------------------------------------- face
TIERS = {
    1: dict(inner='#12082e', outer='#2d0f55', edge='#4a2a8a', size=44, ink=CLOUD, pips=0),
    2: dict(inner='#2a1060', outer='#5a2fb8', edge='#8c5cf0', size=50, ink=CLOUD, pips=1),
    3: dict(inner='#3d1a8c', outer='#813BF5', edge='#b896ff', size=56, ink=CLOUD, pips=2),
    5: dict(inner='#5d6f00', outer='#C9EB00', edge='#ecff8a', size=66, ink=INK, pips=0),
}


def face():
    c = 256
    defs, body = [], []
    for m, t in TIERS.items():
        defs.append(f'<radialGradient id="w{m}" gradientUnits="userSpaceOnUse" cx="{c}" cy="{c}" r="240">'
                    f'<stop offset=".38" stop-color="{t["inner"]}"/><stop offset=".86" stop-color="{t["outer"]}"/>'
                    f'<stop offset="1" stop-color="{t["edge"]}"/></radialGradient>')
    defs.append('<linearGradient id="spoke" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/>'
                '<stop offset=".5" stop-color="#c3c9ee"/><stop offset="1" stop-color="#6c76ad"/></linearGradient>')
    defs.append('<radialGradient id="sheen" cx="34%" cy="22%" r="62%"><stop offset="0" stop-color="#ffffff" stop-opacity=".30"/>'
                '<stop offset=".45" stop-color="#ffffff" stop-opacity=".06"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>')
    defs.append('<radialGradient id="vignette" cx="50%" cy="50%" r="50%"><stop offset=".7" stop-color="#000" stop-opacity="0"/>'
                '<stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>')
    defs.append(f'<clipPath id="disc"><circle cx="{c}" cy="{c}" r="240"/></clipPath>')
    defs.append('<filter id="limeGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>')

    body.append(f'<circle cx="{c}" cy="{c}" r="252" fill="{INK}"/>')
    body.append('<g clip-path="url(#disc)">')
    for i, m in enumerate(MULTIPLIERS):
        a0, a1 = i * 60, i * 60 + 60
        body.append(f'<path d="{wedge(c, c, 0, 240, a0, a1)}" fill="url(#w{m})"/>')
        if m == 5:
            # jackpot wedge: sunburst rays and a light spill so it reads as the top tier by shape, not only colour
            for k in range(7):
                a = a0 + 6 + k * 8
                body.append(f'<path d="{wedge(c, c, 110, 240, a, a + 3.2)}" fill="#ffffff" opacity=".16"/>')
            body.append(f'<path d="{wedge(c, c, 200, 240, a0, a1)}" fill="#ffffff" opacity=".10"/>')
        # inner bevel along the outer arc
        body.append(f'<path d="{arc(c, c, 228, a0 + 1.5, a1 - 1.5)}" fill="none" stroke="{TIERS[m]["edge"]}" stroke-width="3" opacity=".7"/>')
    body.append(f'<circle cx="{c}" cy="{c}" r="240" fill="url(#sheen)"/>')
    body.append(f'<circle cx="{c}" cy="{c}" r="240" fill="url(#vignette)"/>')
    body.append('</g>')

    # marquee dots just inside the lip
    for k in range(72):
        a = k * 5
        if a % 60 == 0:
            continue
        x, y = pt(c, c, 234, a)
        on5 = MULTIPLIERS[int(a // 60)] == 5
        body.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="2.2" fill="{INK if on5 else CLOUD}" opacity="{.55 if on5 else .5}"/>')

    # foil spokes with rivets
    for i in range(6):
        a = i * 60
        (x0, y0), (x1, y1) = pt(c, c, 100, a), pt(c, c, 240, a)
        body.append(f'<line x1="{x0:.2f}" y1="{y0:.2f}" x2="{x1:.2f}" y2="{y1:.2f}" stroke="{INK}" stroke-width="9" stroke-linecap="round"/>')
        body.append(f'<line x1="{x0:.2f}" y1="{y0:.2f}" x2="{x1:.2f}" y2="{y1:.2f}" stroke="url(#spoke)" stroke-width="4.5" stroke-linecap="round"/>')
        rx, ry = pt(c, c, 214, a)
        body.append(f'<circle cx="{rx:.2f}" cy="{ry:.2f}" r="6.5" fill="{INK}"/><circle cx="{rx:.2f}" cy="{ry:.2f}" r="4.5" fill="url(#spoke)"/>')

    # labels (radial, upright at the pointer) and tier pips
    for i, m in enumerate(MULTIPLIERS):
        t = TIERS[m]
        mid = i * 60 + 30
        g = [f'<g transform="rotate({mid} {c} {c})">']
        label = text_d(f'{m}×', t['size'], c, c - 158, tracking=-0.02)
        if m == 5:
            g.append(f'<path d="{label}" fill="#ffffff" opacity=".85" transform="translate(0 -2)" filter="url(#limeGlow)"/>')
            g.append(f'<path d="{label}" fill="#7f9600" transform="translate(0 3)"/>')
            g.append(f'<path d="{label}" fill="{INK}"/>')
            g.append(spark(c, c - 130, 12, INK))
            g.append(spark(c - 30, c - 196, 6, INK, ' opacity=".8"'))
            g.append(spark(c + 32, c - 192, 5, INK, ' opacity=".7"'))
        else:
            g.append(f'<path d="{label}" fill="{INK}" transform="translate(0 4)" opacity=".75"/>')
            g.append(f'<path d="{label}" fill="none" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>')
            g.append(f'<path d="{label}" fill="{t["ink"]}"/>')
            for p in range(t['pips']):
                off = (p - (t['pips'] - 1) / 2) * 28
                g.append(diamond(c + off, c - 132, 12, LIME if m == 3 else CLOUD))
        g.append('</g>')
        body.extend(g)

    # hub socket (the Vault Charge hub sits over this)
    body.append(f'<circle cx="{c}" cy="{c}" r="102" fill="{INK}"/>')
    body.append(f'<circle cx="{c}" cy="{c}" r="100" fill="none" stroke="url(#spoke)" stroke-width="4"/>')
    body.append(f'<circle cx="{c}" cy="{c}" r="92" fill="none" stroke="{PURPLE}" stroke-width="2" opacity=".7"/>')
    # finished lip
    body.append(f'<circle cx="{c}" cy="{c}" r="244" fill="none" stroke="{INK}" stroke-width="8"/>')
    body.append(f'<circle cx="{c}" cy="{c}" r="248" fill="none" stroke="url(#spoke)" stroke-width="2" opacity=".8"/>')
    write('vault-disc-face.svg', f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Lobby Vault Disc face: 1×, 2×, 1×, 3×, 2×, 5×">
<defs>{''.join(defs)}</defs>
{chr(10).join(body)}
</svg>''')


# ---------------------------------------------------------------- rim
def rim():
    c = 256
    plate0, plate1 = 306, 354  # 5× Super path plaque, centred on the 5× wedge (330°)
    defs = [
        '<linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/>'
        '<stop offset=".22" stop-color="#d9ddf7"/><stop offset=".5" stop-color="#8a93c8"/>'
        '<stop offset=".72" stop-color="#ECEEFF"/><stop offset="1" stop-color="#5f6aa3"/></linearGradient>',
        '<linearGradient id="channel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150f33"/><stop offset="1" stop-color="#05061a"/></linearGradient>',
        '<radialGradient id="bulb"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#d9ccff"/><stop offset="1" stop-color="#813BF5"/></radialGradient>',
        '<radialGradient id="bulbLime"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#e4ff5c"/><stop offset="1" stop-color="#8aa300"/></radialGradient>',
        '<radialGradient id="halo"><stop offset="0" stop-color="#c9b6ff" stop-opacity=".55"/><stop offset="1" stop-color="#c9b6ff" stop-opacity="0"/></radialGradient>',
        '<linearGradient id="plate" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b6d400"/><stop offset=".5" stop-color="#e4ff5c"/><stop offset="1" stop-color="#b6d400"/></linearGradient>',
    ]
    b = []
    b.append(f'<circle cx="{c}" cy="{c}" r="252" fill="none" stroke="{INK}" stroke-width="8"/>')
    b.append(f'<circle cx="{c}" cy="{c}" r="241" fill="none" stroke="url(#foil)" stroke-width="16"/>')
    b.append(f'<path d="{arc(c, c, 243, 285, 350)}" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".75"/>')
    b.append(f'<path d="{arc(c, c, 239, 110, 160)}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity=".35"/>')
    for i in range(6):  # notches aligned with the face spokes
        (x0, y0), (x1, y1) = pt(c, c, 234, i * 60), pt(c, c, 249, i * 60)
        b.append(f'<line x1="{x0:.2f}" y1="{y0:.2f}" x2="{x1:.2f}" y2="{y1:.2f}" stroke="{INK}" stroke-width="3"/>')
    b.append(f'<circle cx="{c}" cy="{c}" r="232" fill="none" stroke="{INK}" stroke-width="2.5"/>')
    b.append(f'<circle cx="{c}" cy="{c}" r="218" fill="none" stroke="url(#channel)" stroke-width="27"/>')
    b.append(f'<circle cx="{c}" cy="{c}" r="205" fill="none" stroke="url(#foil)" stroke-width="3"/>')
    # marquee bulbs
    for k in range(32):
        a = k * 11.25 + 5.625
        if plate0 - 3 <= a <= plate1 + 3:
            continue
        x, y = pt(c, c, 218, a)
        b.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="10" fill="url(#halo)"/>')
        b.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="5" fill="url(#bulb)" stroke="{INK}" stroke-width="1"/>')
    # fused 5× Super path plaque
    b.append(f'<path d="{arc(c, c, 218, plate0, plate1)}" fill="none" stroke="{INK}" stroke-width="27" stroke-linecap="round"/>')
    b.append(f'<path d="{arc(c, c, 218, plate0, plate1)}" fill="none" stroke="url(#plate)" stroke-width="21" stroke-linecap="round"/>')
    b.append(f'<path d="{arc(c, c, 225, plate0 + 1, plate1 - 1)}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity=".7"/>')
    b.append(f'<path d="{arc_text_d("5× · SUPER PATH", 12.5, c, c, 213.5, 330, tracking=0.06)}" fill="{INK}"/>')
    for a in (plate0 - 5.5, plate1 + 5.5):
        x, y = pt(c, c, 218, a)
        b.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="10" fill="#e4ff5c" opacity=".35"/>')
        b.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="5" fill="url(#bulbLime)" stroke="{INK}" stroke-width="1"/>')
    write('vault-disc-rim.svg', f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Lobby Vault Disc rim with fused 5× Super path">
<defs>{''.join(defs)}</defs>
{chr(10).join(b)}
</svg>''')


# ---------------------------------------------------------------- pointer
def pointer():
    write('vault-pointer-lime.svg', f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 48" role="img" aria-label="Vault lime pointer">
<defs>
<linearGradient id="capFoil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#c3c9ee"/><stop offset="1" stop-color="#6c76ad"/></linearGradient>
<linearGradient id="lit" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1ff9e"/><stop offset="1" stop-color="#d7f53a"/></linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b3d000"/><stop offset="1" stop-color="#7f9600"/></linearGradient>
</defs>
<path d="M28 47 L6 13 L50 13 Z" fill="{INK}" opacity=".45" transform="translate(0 1.5)"/>
<path d="M28 46 L7 12 L28 16 Z" fill="url(#lit)"/>
<path d="M28 46 L49 12 L28 16 Z" fill="url(#shade)"/>
<path d="M28 46 L7 12 L49 12 Z" fill="none" stroke="{INK}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M13 15 L27 40" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
<rect x="11" y="2" width="34" height="12" rx="6" fill="url(#capFoil)" stroke="{INK}" stroke-width="2.5"/>
<circle cx="28" cy="8" r="3.4" fill="{LIME}" stroke="{INK}" stroke-width="1.5"/>
</svg>''')


# ---------------------------------------------------------------- badge
def badge():
    label = text_d('5× · SUPER PATH', fit_size('5× · SUPER PATH', 94, 14, 0.04), 96, 29, tracking=0.04)
    write('vault-gateway-badge.svg', f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" role="img" aria-label="5× Super path gateway badge">
<defs>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e4ff5c"/><stop offset=".5" stop-color="{LIME}"/><stop offset="1" stop-color="#9fbb00"/></linearGradient>
<linearGradient id="ticket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#23124a"/><stop offset="1" stop-color="{INK}"/></linearGradient>
</defs>
<path d="M13 2 H147 A11 11 0 0 1 158 13 V18 A6 6 0 0 0 158 30 V35 A11 11 0 0 1 147 46 H13 A11 11 0 0 1 2 35 V30 A6 6 0 0 0 2 18 V13 A11 11 0 0 1 13 2 Z" fill="url(#ticket)" stroke="url(#edge)" stroke-width="2.5"/>
<path d="M16 6 H144" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity=".25"/>
<line x1="40" y1="8" x2="40" y2="40" stroke="{LIME}" stroke-width="1.5" stroke-dasharray="3 3" opacity=".7"/>
{spark(22, 24, 10, LIME)}
{spark(31, 14, 3.5, CLOUD, ' opacity=".8"')}
<path d="{label}" fill="{LIME}"/>
</svg>''')


# ---------------------------------------------------------------- hero
def hero():
    # silhouette: top, shoulders, girdle, lower shoulders, point
    T, SL, SR, GL, GR, LL, LR, B = (120, 14), (66, 72), (174, 72), (34, 138), (206, 138), (64, 212), (176, 212), (120, 252)
    C = (120, 124)  # crown focus where facets meet
    P = lambda *ps: ' '.join(f'{x},{y}' for x, y in ps)
    facets = [
        (P(T, SL, C), 'fUL'), (P(T, SR, C), 'fUR'),
        (P(SL, GL, C), 'fML'), (P(SR, GR, C), 'fMR'),
        (P(GL, LL, C), 'fLL'), (P(GR, LR, C), 'fLR'),
        (P(LL, B, C), 'fBL'), (P(LR, B, C), 'fBR'),
    ]
    grads = {
        'fUL': ('#f3eeff', '#b58cff'), 'fUR': ('#a77bff', '#6b35d4'),
        'fML': ('#9a62ff', '#5a2fb8'), 'fMR': ('#4a1f9a', '#1e0a40'),
        'fLL': ('#6b35d4', '#2d0f55'), 'fLR': ('#2a0f58', '#12082e'),
        'fBL': ('#5a2fb8', '#1e0a40'), 'fBR': ('#1e0a40', '#0a0520'),
    }
    defs = [f'<linearGradient id="{k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>' for k, (a, b) in grads.items()]
    defs += [
        '<radialGradient id="aura" cx="50%" cy="46%" r="50%"><stop offset="0" stop-color="#813BF5" stop-opacity=".55"/><stop offset=".6" stop-color="#813BF5" stop-opacity=".12"/><stop offset="1" stop-color="#813BF5" stop-opacity="0"/></radialGradient>',
        '<radialGradient id="core" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#f1ff9e"/><stop offset=".7" stop-color="#C9EB00" stop-opacity=".75"/><stop offset="1" stop-color="#C9EB00" stop-opacity="0"/></radialGradient>',
        '<linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#c3c9ee"/><stop offset="1" stop-color="#5f6aa3"/></linearGradient>',
        '<linearGradient id="plinth" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a081c"/><stop offset=".45" stop-color="#2a1d5c"/><stop offset="1" stop-color="#05061a"/></linearGradient>',
        '<filter id="blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>',
        '<filter id="blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>',
        f'<clipPath id="gem"><polygon points="{P(T, SR, GR, LR, B, LL, GL, SL)}"/></clipPath>',
    ]
    b = []
    b.append('<circle cx="120" cy="136" r="118" fill="url(#aura)"/>')
    # orbit ring, back half
    b.append('<ellipse cx="120" cy="150" rx="104" ry="24" transform="rotate(-14 120 150)" fill="none" stroke="#c9b6ff" stroke-width="1.5" stroke-dasharray="2 6" opacity=".55"/>')
    # plinth
    b.append('<ellipse cx="120" cy="280" rx="86" ry="12" fill="#000" opacity=".45"/>')
    b.append('<path d="M40 252 A80 26 0 0 0 200 252 V264 A80 26 0 0 1 40 264 Z" fill="url(#plinth)"/>')
    b.append('<path d="M40 264 A80 26 0 0 0 200 264" fill="none" stroke="url(#foil)" stroke-width="2"/>')
    b.append('<ellipse cx="120" cy="252" rx="80" ry="26" fill="#0d0a26"/>')
    b.append('<ellipse cx="120" cy="252" rx="80" ry="26" fill="none" stroke="url(#foil)" stroke-width="2.5"/>')
    b.append(f'<ellipse cx="120" cy="252" rx="58" ry="18" fill="none" stroke="{LIME}" stroke-width="5" opacity=".55" filter="url(#blur2)"/>')
    b.append(f'<ellipse cx="120" cy="252" rx="58" ry="18" fill="none" stroke="#e4ff5c" stroke-width="1.5"/>')
    b.append('<polygon points="120,238 136,245 136,259 120,266 104,259 104,245" fill="#2d0f55" stroke="url(#foil)" stroke-width="1.5"/>')
    # gem body
    for pts, g in facets:
        b.append(f'<polygon points="{pts}" fill="url(#{g})"/>')
    # energy core inside the gem
    b.append('<g clip-path="url(#gem)">')
    b.append(f'<ellipse cx="120" cy="140" rx="30" ry="92" fill="{LIME}" opacity=".28" filter="url(#blur6)"/>')
    b.append('<ellipse cx="120" cy="138" rx="22" ry="40" fill="url(#core)"/>')
    b.append('<path d="M120 50 L114 92 L125 112 L113 146 L126 176 L117 214 L120 246" fill="none" stroke="#e4ff5c" stroke-width="3" stroke-linejoin="round" opacity=".6" filter="url(#blur2)"/>')
    b.append('<path d="M120 50 L114 92 L125 112 L113 146 L126 176 L117 214 L120 246" fill="none" stroke="#fbffe0" stroke-width="1.3" stroke-linejoin="round"/>')
    b.append('</g>')
    # foil edges and speculars
    edges = [(T, C), (SL, C), (SR, C), (GL, C), (GR, C), (LL, C), (LR, C), (B, C)]
    for (x0, y0), (x1, y1) in edges:
        b.append(f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y1}" stroke="#ECEEFF" stroke-width="1" opacity=".38"/>')
    b.append(f'<polygon points="{P(T, SR, GR, LR, B, LL, GL, SL)}" fill="none" stroke="url(#foil)" stroke-width="2" stroke-linejoin="round"/>')
    b.append(f'<path d="M{T[0]} {T[1]+4} L{SL[0]+4} {SL[1]} L{GL[0]+5} {GL[1]}" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>')
    b.append('<path d="M104 36 L84 70" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".55"/>')
    b.append('<polygon points="120,14 111,34 129,34" fill="#ffffff" opacity=".8"/>')
    # orbit ring, front half
    b.append('<path d="M16.6 173.2 A104 24 -14 0 0 223.4 126.8" fill="none" stroke="#c9b6ff" stroke-width="2" opacity=".8" transform="rotate(0)"/>')
    b.append(f'<circle cx="52" cy="176" r="3.5" fill="{LIME}"/>')
    # sparkles
    b.append(spark(36, 58, 9, LIME))
    b.append(spark(206, 44, 6, CLOUD, ' opacity=".9"'))
    b.append(spark(214, 196, 7, '#c9b6ff'))
    b.append(spark(24, 212, 5, CLOUD, ' opacity=".7"'))
    write('vault-charge-hero.svg', f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300" fill="none" role="img" aria-label="Lobby Vault Charge: faceted Tari crystal with a lime energy core">
<defs>{''.join(defs)}</defs>
{chr(10).join(b)}
</svg>''')


os.makedirs(OUT, exist_ok=True)
face(); rim(); pointer(); badge(); hero()
print('written', sorted(os.listdir(OUT)))
