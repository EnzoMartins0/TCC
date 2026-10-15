"""Original Brasa menu illustrations. Python standard library only; deterministic.
Run from any directory: python scripts/generate-product-art.py
Recipes and accessible labels are checked against the actual menu, never invented.
"""
from pathlib import Path
import re
import math
import hashlib
import xml.etree.ElementTree as ET
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'products'
MENU = (ROOT / 'data' / 'menu.js').read_text(encoding='utf-8')
PRODUCTS = [dict(zip(('id', 'name', 'desc'), m)) for m in re.findall(r"\{ id: '(p\d+)',[^\n]*?\bname:\s+'([^']+)',\s+desc:\s+'([^']+)'", MENU)]
assert len(PRODUCTS) == 19 and len({p['id'] for p in PRODUCTS}) == 19

DEFS = '''<defs>
<linearGradient id="bun" x2="0.2" y2="1"><stop stop-color="#ffe1a0"/><stop offset=".4" stop-color="#f7ba57"/><stop offset=".82" stop-color="#d58227"/><stop offset="1" stop-color="#ad541c"/></linearGradient>
<linearGradient id="bread" x2="0" y2="1"><stop stop-color="#ffdc8d"/><stop offset="1" stop-color="#d78a35"/></linearGradient>
<linearGradient id="meat" x2="0" y2="1"><stop stop-color="#8b4b2d"/><stop offset=".45" stop-color="#60321f"/><stop offset="1" stop-color="#3c231a"/></linearGradient>
<linearGradient id="gold" x2=".3" y2="1"><stop stop-color="#ffe59a"/><stop offset=".5" stop-color="#f7bd45"/><stop offset="1" stop-color="#cf7a21"/></linearGradient>
<linearGradient id="cheese" x2="0" y2="1"><stop stop-color="#ffcf52"/><stop offset="1" stop-color="#ed8f13"/></linearGradient>
<linearGradient id="red" x2="1" y2=".2"><stop stop-color="#a93824"/><stop offset=".35" stop-color="#e5633d"/><stop offset="1" stop-color="#a43123"/></linearGradient>
<linearGradient id="metal" x2="1" y2="0"><stop stop-color="#a1aaa6"/><stop offset=".35" stop-color="#edf0e6"/><stop offset=".7" stop-color="#c7d0c7"/><stop offset="1" stop-color="#89978f"/></linearGradient>
<linearGradient id="glass" x2="1" y2=".15"><stop stop-color="#b1d7cf" stop-opacity=".65"/><stop offset=".33" stop-color="#f5ffef" stop-opacity=".9"/><stop offset=".65" stop-color="#cce8dc" stop-opacity=".5"/><stop offset="1" stop-color="#80b8af" stop-opacity=".85"/></linearGradient>
<linearGradient id="choc" x2=".5" y2="1"><stop stop-color="#865135"/><stop offset=".4" stop-color="#623523"/><stop offset="1" stop-color="#321c18"/></linearGradient>
<radialGradient id="cream" cx=".35" cy=".2" r=".8"><stop stop-color="#fff9df"/><stop offset=".65" stop-color="#f1dfb2"/><stop offset="1" stop-color="#cba777"/></radialGradient>
<linearGradient id="amber" x2="1" y2=".1"><stop stop-color="#65401c"/><stop offset=".35" stop-color="#bd7a24"/><stop offset=".6" stop-color="#95581d"/><stop offset="1" stop-color="#492d17"/></linearGradient>
</defs>'''

def path(d, fill, extra=''):
    return f'<path d="{d}" fill="{fill}" {extra}/>'

def ellipse(cx, cy, rx, ry, fill, extra=''):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" {extra}/>'

def group(content, transform='', extra=''):
    return f'<g transform="{transform}" {extra}>{content}</g>'

def shadow(cx=160, cy=277, rx=111, ry=12):
    return ellipse(cx, cy, rx, ry, '#582d18', 'opacity=".12"') + ellipse(cx, cy-1, rx*.72, ry*.5, '#582d18', 'opacity=".08"')

def seeds():
    s = ''
    for x,y,a in [(75,-21,-30),(105,-39,20),(143,-47,-22),(181,-43,30),(219,-31,-25),(242,-15,28),(123,-19,35),(166,-26,-15),(201,-14,25)]:
        s += ellipse(x,y,4.2,1.8,'#fff0bd',f'transform="rotate({a} {x} {y})"')
    return s

def bun_top():
    return path('M43 0C42-36 86-67 153-69C222-72 274-39 278-2Q276 10 259 11L62 11Q44 11 43 0Z','url(#bun)', 'stroke="#ad6127" stroke-width="2"') + path('M60-15C83-52 143-64 197-46','none','stroke="#fff0b7" stroke-width="5" stroke-linecap="round" opacity=".43"') + path('M48 0Q159 13 273 0','none','stroke="#994319" stroke-width="3" opacity=".4"') + seeds()

def patty(veggie=False):
    s = path('M43-8Q58-19 80-14L112-17L142-13L179-17L213-13Q249-19 274-6L278 7L269 17L239 19L205 17L173 21L135 17L105 20L75 16Q42 19 39 6Z', '#9a6b31' if veggie else 'url(#meat)', 'stroke="#4e301e" stroke-width="2"')
    for x,y in [(59,0),(87,7),(114,-5),(142,6),(171,-3),(202,8),(233,0),(258,7)]:
        s += path(f'M{x} {y}l13 -3','none',f'stroke="{"#e5b55e" if veggie else "#be7c4b"}" stroke-width="3" stroke-linecap="round" opacity=".65"')
    if veggie:
        for x,y in [(70,-5),(103,8),(133,-2),(185,9),(220,-5),(250,9)]:
            s += ellipse(x,y,2.5,2,'#526037')
    return s

def cheese():
    return path('M39-8Q87-11 130-8L199-9L278-6L264 6L233 5L219 21Q214 28 208 19L193 5L151 7L126 15L107 5L51 8Z','url(#cheese)', 'stroke="#d5801a" stroke-width="1.2"') + path('M56-4L135-3M159-3L227-3','none','stroke="#ffe990" stroke-width="3" stroke-linecap="round" opacity=".7"')

def lettuce():
    return path('M38-4Q47-18 62-9Q72-23 91-11Q107-24 123-10Q142-22 158-10Q179-24 196-10Q212-22 230-9Q250-21 263-8Q286-12 280 2L261 10L242 4L220 13L198 5L178 14L153 4L133 13L110 5L87 12L67 4L48 11Z','#65973d','stroke="#426b2c" stroke-width="2"') + path('M53-3Q83 5 111-2T171-2T231-2L267-2','none','stroke="#a9c267" stroke-width="3"')

def tomato():
    return ellipse(108,0,65,10,'#a93623') + ellipse(108,-4,63,8,'#e56742') + ellipse(215,1,58,10,'#a93623') + ellipse(215,-3,57,8,'#e56742') + path('M70-5L91-2M112-7L125-2M188-4L204-1M227-5L239-1','none','stroke="#ffbd73" stroke-width="3" stroke-linecap="round"')

def bacon():
    s = ''
    for x,y,a in [(63,-3,-5),(148,1,5)]:
        s += group(path('M0 0L24-7L45-2L66-9L99-2L105 10L79 7L58 15L35 8L12 15Z','#a84529','stroke="#78341f" stroke-width="2"') + path('M8 5L26 0L44 4L67-2L94 4','none','stroke="#f6b37a" stroke-width="5" stroke-linejoin="round"'),f'translate({x} {y}) rotate({a})')
    return s

def egg():
    return path('M61 0C46-12 69-24 94-20C110-34 137-26 155-25C184-36 197-18 222-17C259-19 280 1 261 14C244 24 216 13 199 20C174 29 153 16 129 23C101 28 98 16 76 17C58 16 49 9 61 0Z','#fff7df','stroke="#e3d3a9" stroke-width="2"') + ellipse(166,-3,28,19,'#eda726') + ellipse(159,-9,12,6,'#ffce4f')

def ham():
    return path('M45-7L113-11L149-4L192-10L272-5L259 10L206 5L177 13L135 5L93 13L51 6Z','#d68879','stroke="#a95953" stroke-width="2"') + path('M60-2L104 1L141-2L180 3L216-2L255 1','none','stroke="#f0b3a0" stroke-width="3"')

def straw():
    s = ''
    for i in range(17):
        x=55+i*12
        y=(i*7)%14-10
        s += path(f'M{x} {y}l{8+(i%3)*3} {-8+i%4*4}','none','stroke="#e6ab3d" stroke-width="4" stroke-linecap="round"')
    for i in range(8):
        s += ellipse(74+i*23,-3+i%3*4,5,3.5,'#ffd560')
    return s

def rocket():
    s = ''
    for x,a in [(65,-20),(111,12),(157,-10),(202,18),(244,-12)]:
        s += group(path('M0 11Q-20 3-17-6L-6-4Q-17-20-5-27L2-15Q9-31 18-23L11-10Q26-10 23-1L9 3L4 15Z','#467540','stroke="#315936" stroke-width="1.5"')+path('M2 11L4-17','none','stroke="#a3b75d" stroke-width="2"'),f'translate({x} 0) rotate({a})')
    return s

def dried_tomato():
    return ''.join(group(path('M-20 1Q-12-16 7-11L24-6L17 7Q2 15-20 1Z','#a8462a','stroke="#773823" stroke-width="2"')+path('M-10 0L13-5','none','stroke="#df7b41" stroke-width="3"'),f'translate({x} 0) rotate({a})') for x,a in [(76,-10),(143,8),(219,-7)])

LAYER = {'meat':(patty,22), 'veggie':(lambda:patty(True),25), 'cheese':(cheese,10), 'lettuce':(lettuce,11), 'tomato':(tomato,12), 'bacon':(bacon,14), 'egg':(egg,23), 'ham':(ham,11), 'straw':(straw,16), 'rocket':(rocket,17), 'dried':(dried_tomato,11)}
RECIPES = {
'p1':['meat','cheese','meat','cheese','bacon'],
'p2':['lettuce','tomato','meat','cheese','ham','bacon','egg','straw'],
'p3':['meat','cheese','meat','cheese','bacon'],
'p4':['meat','cheese','tomato','lettuce'],
'p5':['meat','cheese','bacon'],
'p6':['lettuce','tomato','meat','cheese','egg'],
'p7':['veggie','cheese','dried','rocket'],
'p8':['meat','cheese','meat','cheese','bacon','cheese']}

def burger(pid):
    s=shadow(cy=284,rx=115)
    s+=path('M45 246Q158 233 275 246L269 268Q260 283 157 282Q57 284 49 268Z','url(#bread)','stroke="#b36a2c" stroke-width="2"')
    s+=ellipse(160,247,114,13,'#f8ce7c')
    s+=path('M62 265Q159 277 256 263','none','stroke="#ffdfa1" stroke-width="4" opacity=".65" stroke-linecap="round"')
    y=239
    for layer in RECIPES[pid]:
        fn,h=LAYER[layer]
        s+=group(fn(),f'translate(0 {y})')
        y-=h
    if pid in ('p1','p4','p5'):
        s+=group(path('M51 0Q89-9 132-1T212-1L267 0L263 8L227 7L212 15Q205 21 199 9L158 8L137 14L117 8L54 8Z','#f5ddab'),f'translate(0 {y+1})')
        y-=6
    s+=group(bun_top(),f'translate(0 {y-3})')
    return s

def can(x=0,y=0,scale=1):
    s=path('M-33-68Q0-77 33-68L36 57Q34 72 0 74Q-33 72-36 58Z','url(#red)','stroke="#903a2b" stroke-width="2"')
    s+=ellipse(0,-67,33,8,'url(#metal)')+ellipse(0,-68,23,4,'#9ca79d')+ellipse(2,-69,10,3,'#d9dfd3','stroke="#76877e" stroke-width="2"')
    s+=path('M-33 49Q0 59 35 48L35 58Q0 71-35 59Z','#d8d7bd')
    s+=path('M-28-46Q-24-51-21-46L-20 35','none','stroke="#ffb395" stroke-width="5" stroke-linecap="round" opacity=".65"')
    s+=path('M-30 12Q-10-23 34-27L35-1Q4-4-29 35Z','#f9e7bb')
    s+=path('M-13 10Q0-9 17-10Q14 12-7 20Q-2 9 7 2','none','stroke="#a6432d" stroke-width="3" stroke-linecap="round"')
    for cx,cy in [(23,-42),(17,31),(-12,-30),(28,20),(-24,42)]:
        s+=ellipse(cx,cy,2,3.5,'#fff6dc','opacity=".65"')
    return group(s,f'translate({x} {y}) scale({scale})')

def fry(x,y,a,length=85,width=13):
    return group(path(f'M0 0L{width} -3L{width+2} {length-6}L3 {length}Z','url(#gold)','stroke="#c88b32" stroke-width="1"')+path(f'M3 3L6 {length-9}','none','stroke="#fff0ad" stroke-width="2" opacity=".8"'),f'translate({x} {y}) rotate({a})')

def fries(carton=False):
    s=shadow(cy=281)
    if not carton:
        s+=ellipse(160,260,126,31,'#be9d72')+ellipse(160,255,125,28,'#fff0cf')
    for i in range(23 if not carton else 13):
        if carton:
            x=66+(i*31)%168
            y=102+(i*23)%65
            s+=fry(x,y,(-20+i*17%41),80+(i%4)*8,12+(i%3)*2)
        else:
            # Low crossed heap, not an upright fence; every stick stays on the tray.
            x=57+(i*29)%115
            angle=-49-(i*17)%61
            length=66+(i%4)*10
            y=min(215+(i*19)%42, 267-length*max(0,math.cos(math.radians(angle))))
            s+=fry(x,round(y,2),angle,length,12+(i%3)*2)
    if carton:
        s+=path('M68 180Q160 207 252 180L234 267Q160 294 85 267Z','url(#red)','stroke="#963d28" stroke-width="2"')
        s+=path('M80 192L96 258M240 192L225 258','none','stroke="#ec8b53" stroke-width="3"')
        s+=path('M139 251Q120 230 143 215Q141 231 151 233Q149 215 166 206Q183 229 177 243Q165 261 150 256Q161 246 155 236Q153 248 139 251Z','#ffdf92')
    else:
        s+=path('M37 257Q157 293 283 257L263 284Q160 308 56 283Z','#efe0bc','stroke="#c3aa80" stroke-width="2"')
    return s

def tray():
    return shadow(cy=285,rx=124)+ellipse(160,258,131,35,'#c5ae8a')+ellipse(160,252,131,33,'#fff0d2')+ellipse(160,252,111,23,'#ead8b2')

def ring(x,y,rx,ry,a=0):
    s=ellipse(0,0,rx,ry,'url(#gold)','stroke="#ad6724" stroke-width="3"')
    s+=ellipse(0,-2,rx*.52,ry*.45,'#e8d2a5','stroke="#bd7b2e" stroke-width="3"')
    s+=path(f'M{-rx*.79:.1f} -3Q{-rx*.6:.1f} {-ry*.85:.1f} 0 {-ry*.83:.1f}','none','stroke="#ffe6a1" stroke-width="4" stroke-linecap="round"')
    for i in range(9):
        a1=i*2.4
        s+=ellipse(round(math.cos(a1)*rx*.78,1),round(math.sin(a1)*ry*.73,1),1.8,1.4,'#a86b2c')
    return group(s,f'translate({x} {y}) rotate({a})')

def onion():
    s=tray()
    for spec in [(99,166,48,29,-20),(196,146,50,33,13),(232,205,48,31,25),(72,225,45,29,-21),(145,228,53,32,5),(155,181,49,33,-12)]:
        s+=ring(*spec)
    return s

def chicken_piece(x,y,a,scale=1):
    s=path('M-8-29Q14-43 30-26Q52-22 47-3Q53 13 31 22Q20 41-2 29Q-26 36-34 17Q-48 4-29-13Q-27-32-8-29Z','url(#gold)','stroke="#a65d25" stroke-width="3"')
    s+=path('M-22-9Q-13-24 1-20M4 21Q17 28 28 13M17-16L29-10','none','stroke="#ffe2a0" stroke-width="5" stroke-linecap="round"')
    for i in range(15):
        cx=-24+(i*17)%61; cy=-18+(i*13)%40
        s+=path(f'M{cx} {cy}l4 -2l2 4','none','stroke="#ad6729" stroke-width="2.5" stroke-linecap="round"')
    return group(s,f'translate({x} {y}) rotate({a}) scale({scale})')

def lemon(x,y,scale=1):
    return group(path('M-34 4A35 35 0 0 1 35 4Z','#e9c64b','stroke="#7b923f" stroke-width="4"')+path('M-26 0A27 27 0 0 1 27 0Z','#f9eaa0')+path('M0 0L-18-16M0 0L0-26M0 0L18-17','none','stroke="#e1cd6b" stroke-width="2"'),f'translate({x} {y}) rotate(-20) scale({scale})')

def chicken():
    s=tray()
    for v in [(98,163,-25,.9),(187,154,18,1.05),(234,216,27,.85),(78,228,-10,.85),(149,224,10,1.1)]:
        s+=chicken_piece(*v)
    s+=lemon(251,141,.9)
    for x,y in [(99,143),(177,211),(228,221),(69,233),(149,236),(194,159)]:
        s+=path(f'M{x} {y}l8 -4l-2 8l-7 -1Z','#65833f')
    return s

def sauce(x,y):
    return group(ellipse(0,10,30,14,'#b7a586')+path('M-29-4L-25 13Q0 29 25 13L29-4Z','#f3e3c3','stroke="#b9a17b" stroke-width="2"')+ellipse(0,-4,30,14,'#fff2d6')+ellipse(0,-4,24,10,'#b44f30')+path('M-13-6Q0-14 15-4','none','stroke="#eb9c67" stroke-width="3" stroke-linecap="round"'),f'translate({x} {y})')

def polenta():
    s=tray()
    for x,y,a in [(60,210,-46),(117,189,-32),(174,199,-39),(63,254,-72),(114,241,-59),(161,247,-80),(99,210,-63)]:
        q=path('M0 0L27-8L50 70L23 81Z','url(#gold)','stroke="#bd7c25" stroke-width="2"')+path('M0 0L8 6L29 75L23 81Z','#da9a2c')+path('M11 5L34 64','none','stroke="#ffe6a0" stroke-width="4" stroke-linecap="round"')
        for j in range(7):
            q+=ellipse(11+j%3*7,13+j*7,1.2,1.5,'#a8792f','opacity=".7"')
        s+=group(q,f'translate({x} {y}) rotate({a})')
    return s+sauce(250,244)

def orange(x,y,r=35):
    s=ellipse(x,y,r,r,'#df8d26','stroke="#b86c1f" stroke-width="2"')+ellipse(x,y,r-4,r-4,'#ffe4a0')
    for i in range(8):
        a=i*math.pi/4+.06;b=(i+1)*math.pi/4-.06
        d=f'M{x} {y}L{x+math.cos(a)*(r-7):.1f} {y+math.sin(a)*(r-7):.1f}A{r-7} {r-7} 0 0 1 {x+math.cos(b)*(r-7):.1f} {y+math.sin(b)*(r-7):.1f}Z'
        s+=path(d,'#f7ae39')
    return s

def juice():
    s=shadow(cy=286,rx=87)
    s+=path('M105 79L121 266Q159 281 199 266L216 79Z','url(#glass)','stroke="#79a59b" stroke-width="2"')
    s+=path('M112 119L126 260Q159 273 194 260L207 119Z','url(#gold)')
    s+=ellipse(159,120,47,12,'#f9cd64')
    s+=path('M180 135L192 51L217 33','none','stroke="#8c5131" stroke-width="9" stroke-linecap="round"')+path('M180 135L192 51L217 33','none','stroke="#fff0ca" stroke-width="4"')
    s+=path('M119 128L129 242','none','stroke="#fff7d1" stroke-width="7" stroke-linecap="round" opacity=".7"')
    s+=ellipse(160,79,55,12,'none','stroke="#adc8b1" stroke-width="3"')
    s+=orange(223,232,38)+path('M214 190Q221 167 244 179Q239 196 214 190Z','#547c3d')
    for x,y in [(142,166),(174,211),(151,242),(187,151)]:
        s+=ellipse(x,y,2,3,'#ffeaa2')
    return s

def water():
    s=shadow(cy=285,rx=71)
    s+=path('M139 61L138 91Q132 108 120 120Q108 130 107 150L108 259Q110 278 159 278Q207 278 210 259L211 150Q210 132 198 121Q184 108 181 91L181 61Z','url(#glass)','stroke="#699f99" stroke-width="2.5"')
    s+=path('M112 163Q140 153 165 163T206 163L204 257Q161 276 114 257Z','#a9d7ca','opacity=".7"')
    for y in (137,151,244,257):
        s+=path(f'M113 {y}Q160 {y+11} 205 {y}','none','stroke="#83b7ab" stroke-width="3" opacity=".65"')
    s+=path('M108 171Q159 186 209 171L208 228Q158 241 109 227Z','#fff0ce','stroke="#bec5a7" stroke-width="1.5"')
    s+=path('M159 184Q138 204 144 214Q158 229 173 214Q179 205 159 184Z','#669f94')+path('M152 208Q148 214 157 216','none','stroke="#d7f0d5" stroke-width="3" stroke-linecap="round"')
    s+=path('M137 59L137 75Q159 82 184 75L183 59Z','#5d8f80','stroke="#426c5f" stroke-width="2"')+ellipse(160,59,23,6,'#88af96')
    s+=path('M121 133L122 162M119 240L120 256','none','stroke="#f7fff0" stroke-width="6" stroke-linecap="round"')
    return s

def beer():
    s=shadow(cy=284,rx=66)
    s+=path('M141 49L140 112Q136 133 121 151Q112 162 112 186L113 265Q115 280 160 280Q204 280 207 265L208 185Q207 162 196 149Q182 131 180 111L179 49Z','url(#amber)','stroke="#4f351b" stroke-width="2.5"')
    s+=path('M138 48L139 66L181 66L182 48Z','#d1b272','stroke="#87662d" stroke-width="2"')+ellipse(160,48,22,5,'#edd296')
    s+=path('M142 85L140 115Q159 122 180 115L178 85Z','#f1dfab')
    s+=path('M115 190Q160 178 205 190L204 243Q161 259 116 243Z','#f6e6b9','stroke="#c7aa6e" stroke-width="2"')
    s+=ellipse(160,214,22,22,'#a65f2c')+path('M152 227L155 200M164 226L166 201M149 208L158 212M161 217L172 209','none','stroke="#f4d991" stroke-width="3" stroke-linecap="round"')
    s+=path('M128 163Q122 179 124 188M124 252L124 264M149 72L147 106','none','stroke="#f3c57d" stroke-width="5" stroke-linecap="round" opacity=".6"')
    for x,y in [(192,168),(187,263),(134,146),(173,132)]:
        s+=ellipse(x,y,2.5,4,'#ecdca8','opacity=".65"')
    return s

def scoop(x,y,scale=1):
    s=path('M-48 16Q-58 7-50-4Q-53-30-34-41Q-18-57 4-50Q33-54 43-32Q60-18 49 5Q63 18 43 25Q28 31 15 23Q0 34-15 25Q-33 34-48 16Z','url(#cream)','stroke="#caab7a" stroke-width="1.5"')
    s+=path('M-34-15Q-29-36-7-37M7-28Q26-34 35-15M-26 7Q-14-1-5 5M12 11Q25 1 37 10','none','stroke="#fff9e4" stroke-width="5" stroke-linecap="round" opacity=".85"')
    return group(s,f'translate({x} {y}) scale({scale})')

def plate():
    return shadow(cy=276,rx=127)+ellipse(160,253,133,34,'#c4ac88')+ellipse(160,248,133,33,'#fff1d6')+ellipse(160,248,110,23,'#f1dfba')

def brownie():
    s=plate()
    s+=path('M55 191L154 166L241 192L142 224Z','#945634','stroke="#512e20" stroke-width="2"')
    s+=path('M55 191L142 219L241 192L237 237L141 267L58 239Z','url(#choc)','stroke="#44271e" stroke-width="2"')
    s+=path('M142 222L142 260','none','stroke="#a56b40" stroke-width="2"')
    s+=path('M64 192L86 199L99 194L123 202L143 199L170 204L197 193L220 196','none','stroke="#c78b59" stroke-width="3" stroke-linejoin="round"')
    for i in range(19):
        x=67+i*19%165;y=220+i*7%22
        s+=path(f'M{x} {y}l6 -2l3 4l-6 3Z','#c19361' if i%4==0 else '#2f1a16')
    s+=scoop(155,165,1.02)
    s+=path('M118 135Q133 126 147 132L169 145Q184 150 195 143M143 181Q158 187 169 180L177 188','none','stroke="#663722" stroke-width="5" stroke-linecap="round"')
    s+=path('M230 257Q253 250 259 260Q250 269 217 270','none','stroke="#7b4329" stroke-width="5" stroke-linecap="round"')
    return s

def strawberry(x,y,scale=1):
    return group(path('M-20-7Q0-22 20-7Q21 9 1 28Q-17 17-20-7Z','#c84c3c','stroke="#9d362c" stroke-width="2"')+path('M-17-10L-6-17L-2-9L5-19L9-10L22-13L11-3L-1-6L-12 0Z','#5b803e')+path('M-9 2L-8 5M3 1L4 4M10 9L9 12M-2 13L-1 16','none','stroke="#ffdb96" stroke-width="2" stroke-linecap="round"'),f'translate({x} {y}) rotate(-15) scale({scale})')

def shake():
    s=shadow(cy=289,rx=82)
    s+=path('M191 112L215 36','none','stroke="#a75236" stroke-width="11" stroke-linecap="round"')+path('M193 106L211 47','none','stroke="#ffe9c4" stroke-width="4"')
    s+=path('M101 134L118 271Q158 289 202 271L219 134Z','url(#glass)','stroke="#86a89a" stroke-width="2"')
    s+=path('M107 143L123 265Q160 280 197 265L212 143Z','#df9c87')
    s+=path('M111 160Q125 179 137 165T169 168T208 157L207 177Q190 190 175 180T145 187T114 181Z','#b96557')
    s+=path('M116 197Q139 207 157 197T204 199L201 217Q176 208 162 219T119 218Z','#f1c0a7')
    s+=path('M122 151L132 254','none','stroke="#ffe9cf" stroke-width="6" stroke-linecap="round" opacity=".7"')
    s+=ellipse(160,137,59,14,'#a95c48')
    s+=path('M105 127Q97 113 116 104Q108 90 130 80Q128 65 149 60Q144 47 160 40Q162 58 179 63Q198 67 195 83Q216 91 208 106Q225 118 211 130Q162 151 105 127Z','url(#cream)','stroke="#d4b686" stroke-width="2"')
    s+=path('M118 106Q164 120 200 104M132 83Q161 95 189 82M149 62Q160 70 177 66','none','stroke="#fff9e6" stroke-width="6" stroke-linecap="round"')
    s+=path('M117 121Q145 129 168 122Q185 114 202 117','none','stroke="#a9533f" stroke-width="4" stroke-linecap="round"')
    s+=strawberry(222,248,.96)
    for x,y in [(141,99),(174,111),(159,76)]:
        s+=path(f'M{x} {y}l5 -2l2 3l-5 2Z','#6d3d29')
    return s

def gateau():
    s=plate()
    s+=ellipse(116,249,63,13,'#8d4d2c')
    s+=path('M65 160Q115 137 169 160L177 230Q167 251 118 252Q73 250 61 231Z','url(#choc)','stroke="#45271d" stroke-width="2"')
    s+=ellipse(117,162,52,20,'#854b2e')
    s+=path('M81 159L94 154L101 161L117 156L132 166L151 160','none','stroke="#b77b4c" stroke-width="3"')
    s+=path('M129 172L155 172L175 230L147 240L133 215Z','#3b2019')
    s+=path('M140 177Q159 187 159 210L168 231Q188 235 198 245Q173 255 153 243L145 217Q151 199 140 177Z','#b56a32','stroke="#6b351e" stroke-width="2"')
    s+=path('M148 187Q158 205 154 217L163 237Q178 247 188 245','none','stroke="#df9b50" stroke-width="3" stroke-linecap="round"')
    s+=scoop(223,213,.79)
    s+=path('M202 181Q217 172 232 183L246 190','none','stroke="#6b3825" stroke-width="4" stroke-linecap="round"')
    s+=path('M88 149L91 151M111 146L114 148M131 152L134 154M79 163L82 165','none','stroke="#f6ddb1" stroke-width="3" stroke-linecap="round"')
    s+=path('M224 164Q204 165 199 149Q219 146 224 164Q226 147 243 145Q247 162 224 164Z','#62833d')
    return s

def composition(pid):
    if pid=='p1':
        return shadow(cy=280,rx=135)+can(246,135,.77)+group(fries(True),'translate(144 92) scale(.48)')+group(burger(pid),'translate(-8 48) scale(.76)')
    if pid=='p3':
        return shadow(cy=281,rx=129)+can(251,164,1.03)+group(burger(pid),'translate(-6 48) scale(.78)')
    if pid in RECIPES:
        return burger(pid)
    return {'p9':lambda:fries(False),'p10':onion,'p11':chicken,'p12':polenta,
            'p13':lambda:shadow(cy=283,rx=74)+can(160,168,1.48),
            'p14':juice,'p15':water,'p16':beer,'p17':brownie,'p18':shake,'p19':gateau}[pid]()

NOTES = {
'p1':'Dois smash com cheddar, bacon e molho, acompanhados de batata em embalagem terracota e lata sem marca.',
'p2':'Lanche alto com carne, queijo, presunto, bacon, ovo de gema dourada, salada, milho e batata palha.',
'p3':'Smash duplo com cheddar cremoso e bacon, acompanhado somente de lata gelada sem marca.',
'p4':'Hambúrguer com queijo, rodelas de tomate, alface ondulada e maionese no pão dourado.',
'p5':'Hambúrguer com queijo, tiras crocantes de bacon e maionese no brioche.',
'p6':'Hambúrguer com queijo, salada e ovo frito com gema aparente.',
'p7':'Disco dourado de grão-de-bico, queijo, tomate seco e folhas recortadas de rúcula.',
'p8':'Dois discos espessos de carne, camadas generosas de cheddar derretido e bacon crocante.',
'p9':'Porção de palitos dourados e crocantes sobre uma bandeja creme.',
'p10':'Anéis de cebola empanados com aberturas visíveis e textura crocante, sobre prato creme.',
'p11':'Pedaços irregulares de frango dourado com ervas e uma cunha de limão.',
'p12':'Bastões grossos de polenta crocante em prato creme e potinho de molho da casa.',
'p13':'Lata gelada terracota sem marca, com faixa creme, tampa metálica e gotas de condensação. Sabor ilustrativo.',
'p14':'Copo de suco de laranja dourado com canudo, rodela de laranja e folha verde. Sabor representativo.',
'p15':'Garrafa transparente de água com tampa verde, rótulo de gota e volume de água visível.',
'p16':'Garrafa long neck âmbar sem marca, rótulo creme com desenho de espigas e gotas de condensação.',
'p17':'Brownie retangular com casquinha e miolo escuro, bola de sorvete de creme e fio de chocolate.',
'p18':'Milkshake de morango em copo alto, creme em espiral, calda, canudo e morango. Sabor representativo.',
'p19':'Bolinho cilíndrico de chocolate aberto com recheio quente escorrendo e sorvete de creme ao lado.'}

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    hashes=set()
    for p in PRODUCTS:
        pid=p['id']
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" xml:lang="pt-BR" role="img" aria-labelledby="title desc"><title id="title">{escape(p["name"])}</title><desc id="desc">Ilustração demonstrativa original. {escape(NOTES[pid])}</desc>{DEFS}{composition(pid)}</svg>\n'
        ET.fromstring(svg)
        data=svg.encode('utf-8')
        assert len(data)<30000
        hashes.add(hashlib.sha256(data).hexdigest())
        (OUT/f'{pid}.svg').write_bytes(data)
        print(f'{pid}: {len(data)} bytes | {p["name"]}')
    assert len(hashes)==19
    print(f'Validated {len(PRODUCTS)} unique SVG files with XML parser; no external dependencies.')

if __name__=='__main__':
    main()
