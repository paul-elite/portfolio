"""Generates the placeholder device mockups in public/mockups.

Original, generic devices and abstract UI: safe to ship, swap for real
screenshots any time by adding images to a project.
Run: python3 scripts/generate-mockups.py
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "mockups"
OUT.mkdir(parents=True, exist_ok=True)

INK = "#15171c"
VARIANTS = [
    {"name": "blue", "a": "#2388e8", "b": "#7cc4ff", "soft": "#e8f3ff"},
    {"name": "orange", "a": "#f97316", "b": "#fdba74", "soft": "#fff1e6"},
    {"name": "violet", "a": "#8b5cf6", "b": "#c4b5fd", "soft": "#f1ecff"},
    {"name": "green", "a": "#16a34a", "b": "#86efac", "soft": "#e8f8ee"},
]


def bar(x, y, w, h=10, fill="#e6e8ee", r=None):
    r = h / 2 if r is None else r
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"/>'


def phone_screen(v, layout, w=266, h=560, ox=0, oy=0, clip=None):
    """App UI drawn into a w×h screen at (ox, oy)."""
    a, b, soft = v["a"], v["b"], v["soft"]
    g = f"g{v['name']}{layout}{ox}"
    s = [f'<defs><linearGradient id="{g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient></defs>']
    s.append(f'<g transform="translate({ox} {oy})"' + (f' clip-path="url(#{clip})"' if clip else "") + ">")
    s.append(f'<rect width="{w}" height="{h}" fill="#f7f8fa"/>')
    # status bar
    s.append(f'<text x="26" y="30" font-family="-apple-system, Inter, Helvetica, Arial, sans-serif" font-size="13" font-weight="600" fill="{INK}">9:41</text>')
    s.append(f'<g fill="{INK}"><rect x="{w-70}" y="20" width="3" height="8" rx="1"/><rect x="{w-65}" y="18" width="3" height="10" rx="1"/><rect x="{w-60}" y="16" width="3" height="12" rx="1"/><rect x="{w-46}" y="17" width="22" height="11" rx="3.5" fill="none" stroke="{INK}" stroke-width="1.2"/><rect x="{w-44}" y="19" width="15" height="7" rx="2"/></g>')
    if layout == 0:  # dashboard: big gradient card + list
        s.append(bar(22, 58, 90, 9, "#c9ccd6"))
        s.append(f'<text x="22" y="98" font-family="-apple-system, Inter, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" fill="{INK}">Overview</text>')
        s.append(f'<rect x="18" y="118" width="{w-36}" height="150" rx="22" fill="url(#{g})"/>')
        s.append(bar(38, 140, 70, 9, "rgba(255,255,255,.7)"))
        s.append(f'<text x="38" y="186" font-family="-apple-system, Inter, Helvetica, Arial, sans-serif" font-size="34" font-weight="600" fill="#fff">84%</text>')
        pts = " ".join(f"{38+i*((w-76)/7):.0f},{248-[8,22,14,30,26,40,34,48][i]}" for i in range(8))
        s.append(f'<polyline points="{pts}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>')
        for i in range(4):
            y = 290 + i * 62
            s.append(f'<rect x="18" y="{y}" width="{w-36}" height="52" rx="16" fill="#fff"/>')
            s.append(f'<rect x="30" y="{y+10}" width="32" height="32" rx="10" fill="{soft}"/>')
            s.append(f'<circle cx="46" cy="{y+26}" r="6" fill="{a}" opacity="{1 - i*0.18:.2f}"/>')
            s.append(bar(74, y + 15, 90 - i * 8, 9, "#d5d8e0"))
            s.append(bar(74, y + 30, 56, 7, "#e8eaef"))
            s.append(bar(w - 66, y + 21, 30, 9, soft))
    elif layout == 1:  # media grid
        s.append(f'<text x="22" y="82" font-family="-apple-system, Inter, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" fill="{INK}">Discover</text>')
        s.append(f'<rect x="18" y="98" width="{w-36}" height="38" rx="12" fill="#eceef2"/>')
        s.append(f'<circle cx="38" cy="117" r="6" fill="none" stroke="#9aa1ad" stroke-width="2"/>')
        s.append(bar(52, 113, 80, 8, "#c9ccd6"))
        cw = (w - 48) / 2
        for i in range(4):
            x = 18 + (i % 2) * (cw + 12)
            y = 152 + (i // 2) * 168
            op = [1, .55, .75, .4][i]
            s.append(f'<rect x="{x:.0f}" y="{y}" width="{cw:.0f}" height="124" rx="18" fill="url(#{g})" opacity="{op}"/>')
            s.append(f'<circle cx="{x+cw-24:.0f}" cy="{y+22}" r="9" fill="#fff" opacity=".85"/>')
            s.append(bar(x + 4, y + 136, cw * .7, 9, "#d5d8e0"))
            s.append(bar(x + 4, y + 151, cw * .4, 7, "#e8eaef"))
    else:  # profile / detail
        s.append(f'<rect x="0" y="0" width="{w}" height="200" fill="url(#{g})"/>')
        s.append(f'<text x="26" y="30" font-family="-apple-system, Inter, Helvetica, Arial, sans-serif" font-size="13" font-weight="600" fill="#fff">9:41</text>')
        s.append(f'<circle cx="{w/2}" cy="200" r="44" fill="#fff"/><circle cx="{w/2}" cy="200" r="38" fill="{soft}"/><circle cx="{w/2}" cy="190" r="13" fill="{a}" opacity=".8"/><path d="M{w/2-22} 226 q22 -26 44 0" fill="{a}" opacity=".8"/>')
        s.append(bar(w / 2 - 60, 258, 120, 12, "#c9ccd6"))
        s.append(bar(w / 2 - 40, 278, 80, 8, "#e1e3e9"))
        for i, lab in enumerate(["#d5d8e0"] * 3):
            x = 28 + i * ((w - 56) / 3)
            s.append(bar(x + 10, 310, 44, 14, INK if i == 0 else "#c9ccd6", 4))
            s.append(bar(x + 10, 330, 30, 7, "#e1e3e9"))
        s.append(f'<rect x="18" y="362" width="{w-36}" height="44" rx="22" fill="{a}"/>')
        s.append(bar(w / 2 - 34, 380, 68, 9, "rgba(255,255,255,.85)"))
        for i in range(3):
            y = 424 + i * 38
            s.append(bar(22, y, w - 44 - i * 30, 9, "#d5d8e0"))
            s.append(bar(22, y + 15, w - 90 - i * 10, 7, "#e8eaef"))
    # home indicator
    s.append(f'<rect x="{w/2-50}" y="{h-12}" width="100" height="4" rx="2" fill="{INK}" opacity=".85"/>')
    s.append("</g>")
    return "".join(s)


def write(name, body, vw, vh):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw} {vh}" width="{vw}" height="{vh}">{body}</svg>'
    (OUT / name).write_text(svg)


def phone(v, layout):
    W, H = 420, 760
    pw, ph = 300, 620
    px, py = (W - pw) / 2, (H - ph) / 2 - 10
    sw, sh = pw - 24, ph - 24
    cid = f"c{v['name']}{layout}"
    s = [f'<defs><filter id="sh" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="24" stdDeviation="22" flood-color="#0f121a" flood-opacity=".22"/></filter>'
         f'<linearGradient id="rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a3c43"/><stop offset=".5" stop-color="#1b1c21"/><stop offset="1" stop-color="#3a3c43"/></linearGradient>'
         f'<clipPath id="{cid}"><rect width="{sw}" height="{sh}" rx="40"/></clipPath></defs>']
    # side buttons
    s.append(f'<rect x="{px-3}" y="{py+130}" width="4" height="36" rx="2" fill="#2a2b31"/><rect x="{px-3}" y="{py+180}" width="4" height="60" rx="2" fill="#2a2b31"/><rect x="{px+pw-1}" y="{py+160}" width="4" height="84" rx="2" fill="#2a2b31"/>')
    s.append(f'<rect x="{px}" y="{py}" width="{pw}" height="{ph}" rx="52" fill="url(#rim)" filter="url(#sh)"/>')
    s.append(f'<rect x="{px+4}" y="{py+4}" width="{pw-8}" height="{ph-8}" rx="48" fill="#0d0e11"/>')
    s.append(phone_screen(v, layout, sw, sh, px + 12, py + 12, cid))
    s.append(f'<rect x="{px+pw/2-42}" y="{py+24}" width="84" height="24" rx="12" fill="#0d0e11"/>')
    write(f"phone-{v['name']}-{layout}.svg", "".join(s), W, H)


def screen(v, layout):
    cid = f"s{v['name']}{layout}"
    body = f'<defs><clipPath id="{cid}"><rect width="266" height="560"/></clipPath></defs>' + phone_screen(v, layout, 266, 560, 0, 0, cid)
    write(f"screen-{v['name']}-{layout}.svg", body, 266, 560)


def laptop_ui(v, g, sx, sy, sw, sh):
    a, b, soft = v["a"], v["b"], v["soft"]
    s = []
    s.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="#f7f8fa"/>')
    # browser chrome
    s.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="40" fill="#eceef2"/>')
    for i, c in enumerate(["#ff5f57", "#febc2e", "#28c840"]):
        s.append(f'<circle cx="{sx+22+i*18}" cy="{sy+20}" r="6" fill="{c}"/>')
    s.append(f'<rect x="{sx+sw/2-160}" y="{sy+10}" width="320" height="20" rx="10" fill="#fff"/>')
    s.append(bar(sx + sw / 2 - 50, sy + 16, 100, 8, "#d5d8e0"))
    # sidebar
    s.append(f'<rect x="{sx}" y="{sy+40}" width="190" height="{sh-40}" fill="#fff"/>')
    s.append(f'<rect x="{sx+20}" y="{sy+62}" width="28" height="28" rx="8" fill="url(#{g})"/>')
    s.append(bar(sx + 58, sy + 71, 80, 10, "#c9ccd6"))
    for i in range(6):
        y = sy + 120 + i * 40
        if i == 0:
            s.append(f'<rect x="{sx+12}" y="{y-10}" width="166" height="32" rx="9" fill="{soft}"/>')
        s.append(f'<rect x="{sx+24}" y="{y}" width="12" height="12" rx="3" fill="{a if i == 0 else "#c9ccd6"}"/>')
        s.append(bar(sx + 46, y + 1, 90 - (i % 3) * 14, 10, a if i == 0 else "#dfe2e8"))
    # main
    mx = sx + 220
    mw = sw - 250
    s.append(f'<text x="{mx}" y="{sy+92}" font-family="-apple-system, Inter, Helvetica, Arial, sans-serif" font-size="26" font-weight="600" fill="{INK}">Dashboard</text>')
    s.append(f'<rect x="{mx+mw-120}" y="{sy+66}" width="120" height="36" rx="18" fill="{INK}"/>')
    s.append(bar(mx + mw - 92, sy + 80, 64, 9, "rgba(255,255,255,.8)"))
    cw = (mw - 32) / 3
    for i in range(3):
        x = mx + i * (cw + 16)
        s.append(f'<rect x="{x:.0f}" y="{sy+124}" width="{cw:.0f}" height="104" rx="16" fill="{"url(#" + g + ")" if i == 0 else "#fff"}"/>')
        fill = "rgba(255,255,255,.75)" if i == 0 else "#d5d8e0"
        s.append(bar(x + 20, sy + 146, 70, 9, fill))
        s.append(f'<text x="{x+20:.0f}" y="{sy+200}" font-family="-apple-system, Inter, Helvetica, Arial, sans-serif" font-size="30" font-weight="600" fill="{"#fff" if i == 0 else INK}">{["2.4k", "318", "92%"][i]}</text>')
    # chart card
    s.append(f'<rect x="{mx}" y="{sy+246}" width="{mw*0.62:.0f}" height="230" rx="16" fill="#fff"/>')
    s.append(bar(mx + 20, sy + 268, 110, 10, "#c9ccd6"))
    bw = (mw * 0.62 - 60) / 10
    for i, hgt in enumerate([60, 90, 74, 120, 98, 140, 112, 150, 128, 170]):
        s.append(f'<rect x="{mx+24+i*(bw+2):.0f}" y="{sy+460-hgt}" width="{bw-8:.0f}" height="{hgt}" rx="5" fill="{a}" opacity="{0.35 + i*0.065:.2f}"/>')
    # list card
    lx2 = mx + mw * 0.62 + 16
    lw2 = mw * 0.38 - 16
    s.append(f'<rect x="{lx2:.0f}" y="{sy+246}" width="{lw2:.0f}" height="230" rx="16" fill="#fff"/>')
    for i in range(4):
        y = sy + 270 + i * 50
        s.append(f'<circle cx="{lx2+32:.0f}" cy="{y+12}" r="14" fill="{soft}"/><circle cx="{lx2+32:.0f}" cy="{y+12}" r="5" fill="{a}"/>')
        s.append(bar(lx2 + 56, y + 3, lw2 * .5, 9, "#d5d8e0"))
        s.append(bar(lx2 + 56, y + 17, lw2 * .3, 7, "#e8eaef"))
    return "".join(s)


def laptop(v):
    a, b, soft = v["a"], v["b"], v["soft"]
    W, H = 1200, 760
    lx, ly, lw, lh = 150, 60, 900, 570
    sx, sy, sw, sh = lx + 24, ly + 24, lw - 48, lh - 44
    g = f"lg{v['name']}"
    s = [f'<defs><filter id="lsh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="30" stdDeviation="28" flood-color="#0f121a" flood-opacity=".2"/></filter>'
         f'<linearGradient id="{g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>'
         f'<linearGradient id="base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4e6eb"/><stop offset="1" stop-color="#b9bcc4"/></linearGradient>'
         f'<clipPath id="lc{v["name"]}"><rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" rx="6"/></clipPath></defs>']
    s.append(f'<rect x="{lx}" y="{ly}" width="{lw}" height="{lh}" rx="26" fill="#17181c" filter="url(#lsh)"/>')
    s.append(f'<circle cx="{lx+lw/2}" cy="{ly+12}" r="3.5" fill="#2c2e34"/>')
    s.append(f'<g clip-path="url(#lc{v["name"]})">')
    s.append(laptop_ui(v, g, sx, sy, sw, sh))
    s.append("</g>")
    # base
    s.append(f'<path d="M{lx-70} {ly+lh+2} h{lw+140} l-14 22 q-6 10 -20 10 h{-(lw+84)} q-14 0 -20 -10 z" fill="url(#base)"/>')
    s.append(f'<rect x="{lx+lw/2-70}" y="{ly+lh+2}" width="140" height="8" rx="4" fill="#a7aab3"/>')
    write(f"laptop-{v['name']}.svg", "".join(s), W, H)


def laptop_screen(v):
    W, H = 1000, 680
    g = f"ls{v['name']}"
    defs = (f'<defs><linearGradient id="{g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{v["a"]}"/>'
            f'<stop offset="1" stop-color="{v["b"]}"/></linearGradient></defs>')
    write(f"laptop-screen-{v['name']}.svg", defs + laptop_ui(v, g, 0, 0, W, H), W, H)


for v in VARIANTS:
    laptop(v)
    laptop_screen(v)
    for layout in range(3):
        phone(v, layout)
        screen(v, layout)
print(sorted(p.name for p in OUT.iterdir()))
