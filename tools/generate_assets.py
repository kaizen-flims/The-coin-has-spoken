from pathlib import Path
import random, math
from PIL import Image, ImageDraw, ImageFont
root = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
root.mkdir(exist_ok=True)
for side, letter in [('heads','H'),('tails','T')]:
    random.seed(22 if side == 'heads' else 29)
    scratches = []
    for n in range(76):
        theta=random.uniform(0,2*math.pi); radius=random.uniform(82,225)
        x=256+math.cos(theta)*radius;y=256+math.sin(theta)*radius
        length=random.uniform(1.8,7.5)
        scratches.append(f'<path d="M{x:.1f} {y:.1f}l{length:.1f} {-length*.35:.1f}" stroke="{random.choice(["#fff1cf","#6f5032"])}" stroke-opacity="{random.uniform(.025,.105):.3f}" stroke-width=".85"/>')
    ticks = []
    for i in range(72):
        angle=2*math.pi*i/72
        ax=256+math.sin(angle)*201;ay=256-math.cos(angle)*201
        bx=256+math.sin(angle)*(207 if i%6 else 213);by=256-math.cos(angle)*(207 if i%6 else 213)
        ticks.append(f'<path d="M{ax:.2f} {ay:.2f}L{bx:.2f} {by:.2f}" stroke="#56412f" stroke-opacity=".42" stroke-width="{1.3 if i%6 else 2}"/>')
    title=side.upper()
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs>
 <radialGradient id="metal" cx="29%" cy="19%" r="82%"><stop stop-color="#fff5d8"/><stop offset=".12" stop-color="#f8df9c"/><stop offset=".34" stop-color="#b79458"/><stop offset=".56" stop-color="#e1c888"/><stop offset=".73" stop-color="#8f6e42"/><stop offset=".87" stop-color="#c7a765"/><stop offset="1" stop-color="#634d31"/></radialGradient>
 <linearGradient id="ring" x1=".12" y1=".07" x2=".9" y2=".93" objectBoundingBox="true"><stop stop-color="#ffedbd"/><stop offset=".23" stop-color="#936b36"/><stop offset=".47" stop-color="#ecd49b"/><stop offset=".72" stop-color="#82613d"/><stop offset="1" stop-color="#fbe0a4"/></linearGradient>
 <radialGradient id="inner" cx="44%" cy="35%" r="64%"><stop stop-color="#efd9a0" stop-opacity=".56"/><stop offset=".57" stop-color="#ad8957" stop-opacity=".15"/><stop offset="1" stop-color="#564027" stop-opacity=".45"/></radialGradient>
 <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".43" numOctaves="3" seed="8" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".105"/></feComponentTransfer></filter>
 <filter id="engrave" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation=".65" result="blur"/><feOffset in="blur" dx="0" dy="-2" result="shade"/><feFlood flood-color="#49331e" flood-opacity=".82" result="dark"/><feComposite in="dark" in2="shade" operator="in" result="shadow"/><feOffset in="blur" dx="0" dy="2" result="lightshift"/><feFlood flood-color="#fff1bf" flood-opacity=".86" result="light"/><feComposite in="light" in2="lightshift" operator="in" result="highlight"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="highlight"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <clipPath id="disc"><circle cx="256" cy="256" r="250"/></clipPath>
</defs>
<circle cx="256" cy="256" r="254" fill="#493923"/>
<circle cx="256" cy="256" r="249" fill="url(#ring)" stroke="#f8e3ad" stroke-width="3"/>
<circle cx="256" cy="256" r="236" fill="url(#metal)" stroke="#4c3824" stroke-width="5"/>
<circle cx="256" cy="256" r="229" fill="none" stroke="#fff0c0" stroke-opacity=".7" stroke-width="2"/>
<circle cx="256" cy="256" r="218" fill="url(#inner)" stroke="#60492c" stroke-opacity=".76" stroke-width="2"/>
<circle cx="256" cy="256" r="211" fill="none" stroke="#ffe8b0" stroke-opacity=".34" stroke-width="2"/>
<circle cx="256" cy="256" r="194" fill="none" stroke="#674b2a" stroke-opacity=".42" stroke-width="1.3"/>
{''.join(ticks)}
<g fill="#70512e" fill-opacity=".79" filter="url(#engrave)">
 <text x="256" y="153" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="20" letter-spacing="8">THE COIN</text>
 <text x="256" y="332" text-anchor="middle" font-family="Georgia,serif" font-size="{193 if letter=='H' else 190}" font-weight="normal">{letter}</text>
 <text x="256" y="379" text-anchor="middle" font-family="Georgia,serif" font-size="25" letter-spacing="7">{title}</text>
 <text x="256" y="417" text-anchor="middle" font-family="Georgia,serif" font-size="11" letter-spacing="3.7">HAS SPOKEN</text>
</g>
<path d="M133 179h246M133 399h246" stroke="#755538" stroke-opacity=".45" stroke-width="1"/>
<g>{''.join(scratches)}</g>
<g clip-path="url(#disc)"><rect x="5" y="5" width="502" height="502" filter="url(#grain)" opacity=".55"/></g>
<circle cx="256" cy="256" r="249" fill="none" stroke="#fff0c7" stroke-opacity=".63" stroke-width="2"/>
</svg>'''
    (root/f'{side}.svg').write_text(svg)
icon='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="108" fill="#111312"/><circle cx="256" cy="256" r="178" fill="#594629" stroke="#e3ca91" stroke-width="18"/><circle cx="256" cy="256" r="157" fill="#caaa70" stroke="#6d502d" stroke-width="3"/><circle cx="256" cy="256" r="139" fill="none" stroke="#f2ddb0" stroke-width="3"/><text x="256" y="334" fill="#5c4629" text-anchor="middle" font-family="Georgia,serif" font-size="219">C</text><circle cx="341" cy="342" r="12" fill="#5c4629"/></svg>'''
(root/'icon.svg').write_text(icon)
for sz in (192,512):
    im=Image.new('RGB',(sz,sz),'#111312'); d=ImageDraw.Draw(im)
    m=round(sz*.14);d.ellipse((m,m,sz-m,sz-m),fill='#755937',outline='#f3d8a3',width=max(3,round(sz*.032)))
    n=round(sz*.18);d.ellipse((n,n,sz-n,sz-n),fill='#c5a369',outline='#705437',width=max(1,round(sz*.008)))
    q=round(sz*.215);d.ellipse((q,q,sz-q,sz-q),outline='#f3ddb1',width=max(1,round(sz*.006)))
    try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',round(sz*.41))
    except OSError: font=ImageFont.load_default()
    d.text((sz*.5,sz*.48),'C',font=font,anchor='mm',fill='#594629')
    im.save(root/f'icon-{sz}.png',optimize=True)
