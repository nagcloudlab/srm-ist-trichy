"""Generate training/index.html and training/unit-*/index.html (topic × advanced / simple / labs / docs). Run: python3 scripts/make-index.py"""
import os, html
import pathlib
T = str(pathlib.Path(__file__).resolve().parents[2])  # training/

CSS = """
:root{--ink:#111827;--paper:#f7f4ed;--line:rgba(17,24,39,.13);--muted:#68707c;--blue:#3157d5;--blue-soft:#e8edff;--coral:#eb5a46;--coral-soft:#fff0ed;--mint:#277a59;--mint-soft:#e3f5ed;--violet:#7353bd;--violet-soft:#f0ebff;
--display:"Segoe UI Variable Display","Aptos Display","Segoe UI",sans-serif;--body:"Segoe UI Variable Text","Aptos","Segoe UI",sans-serif;--mono:"Cascadia Code","SFMono-Regular",Consolas,monospace}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--body);-webkit-font-smoothing:antialiased}
body:before{content:"";position:fixed;inset:0;background-image:radial-gradient(rgba(49,87,213,.12) .65px,transparent .65px);background-size:22px 22px;opacity:.34;pointer-events:none}
main{position:relative;max-width:1240px;margin:0 auto;padding:clamp(24px,4vw,56px) clamp(16px,4vw,48px) 64px}
.top{display:flex;align-items:center;gap:14px;margin-bottom:clamp(28px,5vh,56px)}
.mark{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--ink);color:#fff;font:850 12px var(--display);text-decoration:none}
.crumbs{font-size:10px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:#6d7176}.crumbs a{color:var(--blue);text-decoration:none}
.kicker{margin:0 0 14px;color:var(--blue);font:800 13px var(--mono);letter-spacing:.16em;text-transform:uppercase}
h1{margin:0;font-family:var(--display);font-size:clamp(40px,6vw,84px);font-weight:740;line-height:.97;letter-spacing:-.055em}
.lede{max-width:760px;margin:20px 0 0;color:#525b6a;font-size:clamp(17px,1.5vw,22px);line-height:1.45}
.legend{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0 8px}
.tag{display:inline-flex;align-items:center;gap:8px;padding:6px 11px;border:1px solid var(--line);border-radius:10px;background:rgba(255,255,255,.72);font:800 10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:#525b6a}
.tag i{width:10px;height:10px;border-radius:3px;background:var(--c)}
h2{margin:48px 0 16px;font-family:var(--display);font-size:clamp(24px,2.6vw,36px);letter-spacing:-.035em}
.topic{display:grid;grid-template-columns:minmax(200px,.85fr) repeat(4,minmax(0,1fr));gap:10px;margin:0 0 12px;padding:12px;border:1px solid var(--line);border-radius:22px;background:rgba(255,255,255,.55)}
.topic-head{padding:10px 12px}.topic-head small{display:block;color:var(--muted);font:850 9px var(--mono);letter-spacing:.16em;text-transform:uppercase}
.topic-head strong{display:block;margin-top:6px;font:740 clamp(18px,1.6vw,24px)/1.15 var(--display);letter-spacing:-.025em}
.topic-head p{margin:8px 0 0;color:#5c6470;font-size:13px;line-height:1.4}
.col{display:flex;flex-direction:column;gap:6px;padding:12px;border-radius:16px;background:var(--soft);min-width:0}
.col>small{color:var(--c);font:850 9px var(--mono);letter-spacing:.14em;text-transform:uppercase;margin-bottom:2px}
.col a{display:block;padding:8px 10px;border-radius:10px;background:#fff;border:1px solid var(--line);color:var(--ink);text-decoration:none;font-size:13px;font-weight:650;line-height:1.3;overflow-wrap:anywhere}
.col a span{display:block;margin-top:2px;color:var(--muted);font:600 11px var(--mono)}
.col a:hover{border-color:var(--c);transform:translateY(-1px)}
.col .none{color:var(--muted);font-size:12px;font-style:italic;padding:6px 2px}
.adv{--c:var(--blue);--soft:var(--blue-soft)}.simple{--c:var(--ink);--soft:#efeadf}.labs{--c:var(--coral);--soft:var(--coral-soft)}.docs{--c:var(--mint);--soft:var(--mint-soft)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:28px}
.card{display:flex;flex-direction:column;gap:10px;padding:26px;border:1px solid var(--line);border-radius:22px;background:#fff;color:var(--ink);text-decoration:none;box-shadow:0 20px 60px rgba(17,24,39,.06)}
.card:hover{border-color:var(--blue);transform:translateY(-2px)}
.card small{color:var(--blue);font:850 10px var(--mono);letter-spacing:.16em;text-transform:uppercase}
.card strong{font:740 clamp(24px,2.4vw,34px)/1.05 var(--display);letter-spacing:-.04em}
.card p{margin:0;color:#5c6470;font-size:14px;line-height:1.45}
.card ul{margin:4px 0 0;padding-left:18px;color:#525b6a;font-size:13px;line-height:1.5}
.card.planned{opacity:.5;pointer-events:none;box-shadow:none}
.foot{margin-top:40px;color:var(--muted);font-size:12px;line-height:1.6}.foot code{font-family:var(--mono)}
@media(max-width:980px){.topic{grid-template-columns:1fr 1fr}.topic-head{grid-column:1/-1}}
@media(max-width:560px){.topic{grid-template-columns:1fr}}
"""

def page(title, body):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)}</title>
<style>{CSS}</style>
</head>
<body><main>
{body}
</main></body>
</html>
"""

def link(href, label, meta=''):
    return f'<a href="{href}">{html.escape(label)}{f"<span>{html.escape(meta)}</span>" if meta else ""}</a>'

def col(kind, label, items, empty='—'):
    inner = ''.join(items) if items else f'<div class="none">{empty}</div>'
    return f'<div class="col {kind}"><small>{label}</small>{inner}</div>'

def topic(n, name, blurb, adv, simple, labs, docs):
    return f"""<section class="topic">
  <div class="topic-head"><small>Topic {n}</small><strong>{html.escape(name)}</strong><p>{html.escape(blurb)}</p></div>
  {col('adv','v2 deck',adv,'Planned — use the v1 lesson pages')}{col('simple','v1 lesson pages',simple)}{col('labs','Labs',labs)}{col('docs','Docs',docs)}
</section>"""

LEGEND = """<div class="legend">
  <span class="tag" style="--c:var(--blue)"><i></i>v2 deck · full teaching deck, live labs, formula walkthroughs</span>
  <span class="tag" style="--c:var(--ink)"><i></i>v1 lesson pages · one short deck per lesson</span>
  <span class="tag" style="--c:var(--coral)"><i></i>Labs · Jupyter notebooks</span>
  <span class="tag" style="--c:var(--mint)"><i></i>Docs · lesson notes (Markdown)</span>
</div>"""

def top(crumbs):
    return f'<div class="top"><a class="mark" href="{crumbs[0][0]}">GM</a><div class="crumbs">' + ' · '.join(f'<a href="{h}">{html.escape(t)}</a>' if h else html.escape(t) for h, t in crumbs) + '</div></div>'

# ---------------- counts (computed, never hand-typed) ----------------
import re, glob
SRC = os.path.join(T, 'deck-builder', 'src')

def simple_count(rel):
    """Slides in a simple HTML deck (path relative to training/)."""
    return len(re.findall(r'class="slide[ "]', open(os.path.join(T, rel), encoding='utf-8').read()))

def adv_stats(deck_id):
    """(slides, live labs) of an advanced deck, from its source parts listed in src/decks/<id>.ts."""
    spec = open(os.path.join(SRC, 'decks', f'{deck_id}.ts'), encoding='utf-8').read()
    slides = labs = 0
    for mod in re.findall(r"from '\.\./((?:unit1|unit2|deep)/[a-z0-9]+)'", spec):
        s = open(os.path.join(SRC, mod + '.tsx'), encoding='utf-8').read()
        slides += len(re.findall(r'\bnotes: \{', s)); labs += len(re.findall(r'\blab: true', s))
    return slides, labs

V1, V2 = 'slide-decks/v1', 'slide-decks/v2'   # simple decks / advanced decks (relative to training/)

def deck_path(unit, rel):
    """Map a unit-relative deck name (decks-simple/… or decks-advanced/…) to its home under slide-decks/."""
    if rel.startswith('decks-simple/'): return f'{V1}/unit-{unit}/' + rel[len('decks-simple/'):]
    if rel.startswith('decks-advanced/'): return f'{V2}/unit-{unit}/' + rel[len('decks-advanced/'):]
    return f'unit-{unit}/{rel}'

def adv(unit, file, deck_id, label):
    n, l = adv_stats(deck_id)
    return link(f'../{V2}/unit-{unit}/{file}', label, f'{n} slides · {l} live labs')

def simple(unit, rel, label):
    path = deck_path(unit, rel)
    return link(f'../{path}', label, f'{simple_count(path)} slides')

def lab(rel, label): return link(f'labs/{rel}', label)
def doc(rel, label): return link(f'docs/{rel}', label)

# topic: (name, blurb, needs, adv[], simple[], labs[], docs[])
def topic2(n, name, blurb, needs, adv_, simple_, labs_, docs_):
    t = topic(n, name, blurb, adv_, simple_, labs_, docs_)
    if needs:
        t = t.replace(f'<p>{html.escape(blurb)}</p></div>', f'<p>{html.escape(blurb)}</p><p class="needs"><b>Needs</b> {html.escape(needs)}</p></div>', 1)
    return t

PATH = [(1, 'GenAI · GANs · NN · DCGAN', 'noise → image'), (2, 'WGAN · cGAN · control', 'noise → specific image'),
        (3, 'IS · FID · bias · StyleGAN', 'noise → measured image'), (4, 'Pix2Pix · augmentation · privacy', 'image → image (paired)'),
        (5, 'CycleGAN · capstone', 'image → image (unpaired)')]

def path_strip(current=None, prefix=''):
    items = []
    for n, what, arrow in PATH:
        cls = ' class="here"' if n == current else ''
        items.append(f'<a{cls} href="{prefix}#unit-{n}"><small>Unit {n} · {html.escape(arrow)}</small><strong>{html.escape(what)}</strong></a>')
    return '<nav class="path" aria-label="Learning path">' + '<b>→</b>'.join(items) + '</nav>'

def outcomes(needs, able):
    return f'<div class="outcomes"><div><small>You need</small><p>{html.escape(needs)}</p></div><div><small>You will be able to</small><p>{html.escape(able)}</p></div></div>'

CSS += """
.path{display:flex;flex-wrap:wrap;align-items:stretch;gap:6px;margin:28px 0 4px}
.path a{flex:1 1 150px;display:block;padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.72);color:var(--ink);text-decoration:none}
.path a small{display:block;color:var(--blue);font:850 9px var(--mono);letter-spacing:.12em;text-transform:uppercase}
.path a strong{display:block;margin-top:4px;font-size:13px;line-height:1.3}
.path a.here{background:var(--ink);color:#fff;border-color:var(--ink)}.path a.here small{color:#9ce1c4}
.path b{align-self:center;color:var(--muted);font-weight:700}
.outcomes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:22px 0 0;max-width:980px}
.outcomes div{padding:14px 16px;border:1px solid var(--line);border-radius:16px;background:#fff}
.outcomes small{color:var(--mint);font:850 9px var(--mono);letter-spacing:.14em;text-transform:uppercase}
.outcomes p{margin:6px 0 0;font-size:14px;line-height:1.45;color:#3f4652}
.needs{font-size:12px!important;color:#68707c!important}.needs b{color:var(--coral);font:850 9px var(--mono);letter-spacing:.12em;text-transform:uppercase;margin-right:4px}
.naming{margin-top:28px;padding:14px 16px;border:1px dashed var(--line);border-radius:14px;color:var(--muted);font-size:12px;line-height:1.6;max-width:980px}
@media(max-width:700px){.outcomes{grid-template-columns:1fr}.path b{display:none}}
"""

UNIT_SECTIONS = {}

def rebase(fragment, n):
    """Links in a unit section are written relative to unit-N/; rebase them onto training/ for the hub."""
    def fix(m):
        ref = m.group(2)
        if re.match(r'^(https?:|mailto:|#|/)', ref): return m.group(0)
        return m.group(1) + os.path.normpath(os.path.join(f'unit-{n}', ref)) + '"'
    return re.sub(r'(href=")([^"]+)"', fix, fragment)

def unit_page(n, title, lede, needs, able, topics, refs=''):
    """Render Unit n as a section of the hub (unit folders hold only docs/ and labs/)."""
    prev = f'<a href="#unit-{n-1}">← Unit {n-1}</a>' if n > 1 else ''
    nxt = f'<a href="#unit-{n+1}">Unit {n+1} →</a>' if n < 5 else '<a href="#top">Back to top ↑</a>'
    body = f"""<section class="unit" id="unit-{n}">
<p class="kicker">Unit {n}</p>
<h2 class="unit-title">{html.escape(title)}</h2>
<p class="lede">{html.escape(lede)}</p>
{outcomes(needs, able)}
{''.join(topics)}
{refs}
<p class="foot">{prev}{' · ' if prev else ''}{nxt}</p>
</section>"""
    UNIT_SECTIONS[n] = rebase(body, n)

CSS += """
.unit{margin-top:64px;padding-top:28px;border-top:2px solid var(--ink)}
.unit-title{margin:0;font-family:var(--display);font-size:clamp(30px,4vw,54px);font-weight:740;line-height:1;letter-spacing:-.045em}
.jump{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0}
"""

# ---------------- Unit 1 ----------------
nn = [('01','What is a neuron?'),('02','How wrong is the prediction?'),('03','Which direction should the weight move?'),('04','How far should the weight move?'),('05','Make the neuron learn repeatedly'),('06','Calculate the gradient directly'),('07','Learn both weight and bias'),('08','A neuron with multiple inputs'),('09','Why one neuron is not enough'),('10','Your first hidden layer'),('11','Backpropagation'),('12','Sigmoid and binary cross-entropy'),('13','Build a classifier'),('14','Introduction to PyTorch')]
nn_docs = {'01':'what-is-a-neuron','02':'how-wrong-is-the-prediction','03':'which-direction-should-the-weight-move','04':'how-far-should-the-weight-move','05':'make-the-neuron-learn-repeatedly','06':'calculate-the-gradient-directly','07':'learn-both-weight-and-bias','08':'a-neuron-with-multiple-inputs','09':'why-one-neuron-is-not-enough','10':'your-first-hidden-layer','11':'backpropagation','12':'sigmoid-and-bce','13':'build-a-classifier','14':'introduction-to-pytorch'}

unit_page(1, 'Generative AI, GANs, PyTorch and DCGAN',
  'From the generative-AI landscape to a DCGAN that draws digits: the GAN idea, everything inside G and D, then building and debugging real GANs.',
  'Python and basic algebra. No prior neural-network or PyTorch experience.',
  'Explain the adversarial game, build a neural network from first principles and in PyTorch, train an MNIST GAN and a DCGAN, and diagnose mode collapse.',
  [
  topic2(1, 'Generative AI and the GAN idea', 'The landscape (VAE, GAN, Transformer, Diffusion) and the forger-vs-detective game.', '',
    [adv(1, '1-generative-ai-and-gans.html', 'u1-genai-gans', 'Generative AI and the GAN idea')],
    [simple(1, 'decks-simple/S1-generative-ai.html', 'S1 · The world of generative AI'), simple(1, 'decks-simple/S2-what-is-a-gan.html', 'S2 · What is a GAN?'), simple(1, 'decks-simple/nn-lessons/NN-L00.html', 'NN-L00 · Overview of generative AI')],
    [],
    [doc('session-1-generative-ai.md', 'Generative AI notes'), doc('session-2-what-is-a-gan.md', 'The GAN idea notes'), doc('gan-lessons/L00-the-world-of-generative-ai.md', 'L00 · The world of generative AI'), doc('gan-lessons/L01-what-is-a-gan.md', 'L01 · What is a GAN?')]),
  topic2(2, 'Neural networks: neuron to PyTorch', 'Everything inside G and D: neuron, loss, gradients, backprop, Sigmoid + BCE, PyTorch.', 'Topic 1 (what G and D must do).',
    [adv(1, '2-neural-networks.html', 'u1-neural-networks', 'Neural networks: from one neuron to PyTorch'), link('../slide-decks/v2/nn-course-app/README.md', 'Neural networks course app', '14 lessons · run locally with npm')],
    [simple(1, f'decks-simple/nn-lessons/NN-L{n}.html', f'NN-L{n} · {t}') for n, t in nn],
    [lab('lab-p1-the-learning-neuron.ipynb', 'P1 · The learning neuron'), lab('lab-p2-hidden-layers-and-backprop.ipynb', 'P2 · Hidden layers and backprop'), lab('lab-p3-build-a-classifier.ipynb', 'P3 · Build a classifier'), lab('lab-00-intro-to-pytorch.ipynb', 'Lab 0 · Introduction to PyTorch')],
    [doc('session-3-neural-networks.md', 'Neural networks notes')] + [doc(f'nn-lessons/lesson-{n}-{nn_docs[n]}.md', f'Lesson {n} · {t}') for n, t in nn]),
  topic2(3, 'Build GANs: the number 7 to DCGAN', 'First GAN, MNIST, convolutions, DCGAN — and how GANs break.', 'Topics 1–2 (GAN loop; Linear, ReLU, Sigmoid, BCE, PyTorch training loop).',
    [adv(1, '3-build-gans.html', 'u1-build-gans', 'Build GANs: from the number 7 to DCGAN')],
    [simple(1, 'decks-simple/gan-lessons/L02.html', 'L02 · Build your first GAN'), simple(1, 'decks-simple/gan-lessons/L03.html', 'L03 · GAN for images (MNIST)'), simple(1, 'decks-simple/gan-lessons/L04.html', 'L04 · Convolutions crash course'), simple(1, 'decks-simple/gan-lessons/L05.html', 'L05 · DCGAN'), simple(1, 'decks-simple/gan-lessons/L06.html', 'L06 · When GANs break')],
    [lab('lab-01-simple-gan.ipynb', 'Lab 1 · Build your first GAN'), lab('lab-02-mnist-gan.ipynb', 'Lab 2 · GAN for images (MNIST)'), lab('lab-03-dcgan.ipynb', 'Lab 3 · DCGAN'), lab('lab-04-training-tricks.ipynb', 'Lab 4 · Break it, then fix it')],
    [doc('session-4-build-first-gan.md', 'Build GANs notes'), doc('gan-lessons/L02-build-your-first-gan.md', 'L02 · Build your first GAN'), doc('gan-lessons/L03-gan-for-images.md', 'L03 · GAN for images'), doc('gan-lessons/L04-convolutions-crash-course.md', 'L04 · Convolutions'), doc('gan-lessons/L05-dcgan.md', 'L05 · DCGAN'), doc('gan-lessons/L06-when-gans-break.md', 'L06 · When GANs break')]),
  topic2(4, 'Activation and loss functions', 'Which activation goes where in G and D, why — and how losses score them.', 'Topic 3 (MNIST GAN and DCGAN).',
    [adv(1, '4-activations-in-gans.html', 'u1-activations', 'Activation functions in GANs'), simple(1, 'decks-advanced/activation-functions-deep-dive.html', 'Activation functions — deep dive'), simple(1, 'decks-advanced/loss-functions-deep-dive.html', 'Loss functions — deep dive')],
    [], [], []),
  ],
  refs=f"""<h2>Whole-unit references</h2>
<section class="topic" style="grid-template-columns:repeat(4,minmax(0,1fr))">
  {col('docs','Unit notes',[doc('unit-1-complete-notes.md','Unit 1 — complete notes')])}
  {col('labs','Lab guide',[lab('README.md','Labs README · setup and lab map')])}
  {col('simple','Course summary',[doc('nn-lessons/COURSE-SUMMARY.md','Neural-networks course summary')])}
  {col('adv','Go deeper',[link(f'../{V2}/deep-dive/index.html','Deep dive · How neural networks learn','{0} slides · {1} live labs'.format(*adv_stats('deep-dive')))])}
</section>""")

# ---------------- Unit 2 ----------------
unit_page(2, 'Better loss, stable training, control',
  'Fix the loss itself (WGAN, WGAN-GP), then take control of what the generator makes (conditional and controllable GANs).',
  'Unit 1 — especially BCE, the GAN training loop, DCGAN and the band-aid fixes from “When GANs break”.',
  'Explain why BCE fails, train a WGAN-GP, generate a chosen digit with a conditional GAN, and steer outputs with interpolation, latent arithmetic and truncation.',
  [
  topic2(1, 'Better loss: from BCE to WGAN-GP', 'Why BCE fails, the Wasserstein distance and critic, and the gradient penalty.', 'Unit 1: BCE, non-saturating G loss, mode collapse.',
    [adv(2, '1-better-loss-wgan.html', 'u2-better-loss', 'Better loss: from BCE to WGAN-GP')],
    [simple(2, 'decks-simple/L07.html', 'L07 · Why BCE loss fails'), simple(2, 'decks-simple/L08.html', 'L08 · WGAN: Wasserstein distance'), simple(2, 'decks-simple/L09.html', 'L09 · WGAN-GP: gradient penalty')],
    [lab('lab-08-wgan.ipynb', 'Lab 08 · WGAN on MNIST'), lab('lab-09-wgan-gp.ipynb', 'Lab 09 · WGAN-GP on MNIST')],
    [doc('lessons/L07-why-bce-loss-fails.md', 'L07 · Why BCE loss fails'), doc('lessons/L08-wgan-wasserstein-distance.md', 'L08 · WGAN'), doc('lessons/L09-wgan-gp-gradient-penalty.md', 'L09 · WGAN-GP')]),
  topic2(2, 'Control: conditional and controllable GANs', 'Generate a chosen digit, then steer style with latent interpolation, arithmetic and truncation.', 'Unit 1 MNIST GAN and DCGAN; topic 1 for the cGAN + WGAN-GP variant.',
    [adv(2, '2-control.html', 'u2-control', 'Control: conditional and controllable GANs')],
    [simple(2, 'decks-simple/L10.html', 'L10 · Conditional GAN'), simple(2, 'decks-simple/L11.html', 'L11 · Controllable generation')],
    [lab('lab-10-conditional-gan.ipynb', 'Lab 10 · Conditional GAN on MNIST'), lab('lab-11-controllable-generation.ipynb', 'Lab 11 · Controllable generation (run lab 10 first)')],
    [doc('lessons/L10-conditional-gan.md', 'L10 · Conditional GAN'), doc('lessons/L11-controllable-generation.md', 'L11 · Controllable generation')]),
  ],
  refs=f"""<h2>Whole-unit references</h2>
<section class="topic" style="grid-template-columns:repeat(4,minmax(0,1fr))">
  {col('labs','Lab guide',[lab('README.md','Labs README · lab map and setup')])}
  {col('adv','Go deeper',[link(f'../{V2}/deep-dive/index.html','Deep dive · losses and optimizers','{0} slides · {1} live labs'.format(*adv_stats('deep-dive')))])}
</section>""")

# ---------------- Units 3–5 ----------------
L = lambda u, f, t: simple(u, f'decks-simple/{f}.html', t)
D = lambda f, t: doc(f'lessons/{f}.md', t)
B = lambda f, t: lab(f'{f}.ipynb', t)

unit_page(3, 'Evaluate and scale',
  'Measure GAN quality properly, check generators for bias, and meet StyleGAN.',
  'Units 1–2 — especially mode collapse, the conditional GAN and truncation (L11).',
  'Compute and interpret IS and FID, audit a generator for bias, and explain StyleGAN’s mapping network, AdaIN and style mixing.',
  [
  topic2(1, 'Evaluating GANs: IS and FID', 'Why “looks good” is not enough; Inception Score; FID from features to formula.', 'Unit 1 mode collapse (diversity) and DCGAN samples.', [],
    [L(3, 'L12', 'L12 · Evaluating GANs'), L(3, 'L13', 'L13 · FID deep dive')], [B('lab-13-fid-score', 'Lab 13 · FID score')],
    [D('L12-evaluating-gans', 'L12 · Evaluating GANs'), D('L13-fid-deep-dive', 'L13 · FID deep dive')]),
  topic2(2, 'Bias and fairness', 'Data, model and evaluation bias in generators — and how to mitigate them.', 'Topic 1 (FID, per-group metrics).', [],
    [L(3, 'L14', 'L14 · GAN bias and fairness')], [], [D('L14-gan-bias-and-fairness', 'L14 · GAN bias and fairness')]),
  topic2(3, 'StyleGAN', 'Mapping network, AdaIN, style mixing, noise injection, truncation in w.', 'Unit 2 L11 (latent space, truncation); Unit 1 DCGAN.', [],
    [L(3, 'L15', 'L15 · StyleGAN')], [B('lab-15-stylegan', 'Lab 15 · Mini-StyleGAN on MNIST')], [D('L15-stylegan', 'L15 · StyleGAN')]),
  ])

unit_page(4, 'Image translation, augmentation and privacy',
  'Turn one image into another with paired data, and use GANs for augmentation and private synthetic data.',
  'Units 1–3 — conditional GANs (L10), DCGAN layers, FID for evaluation.',
  'Build a Pix2Pix model (U-Net + PatchGAN, L1 + GAN loss) and explain when GAN augmentation and DP training help.',
  [
  topic2(1, 'Image-to-image translation and Pix2Pix', 'Encoder–decoder, U-Net skip connections, PatchGAN, L1 + GAN loss.', 'Unit 2 L10 (conditioning G and D on an input); Unit 1 convolutions.', [],
    [L(4, 'L16', 'L16 · Image-to-image translation'), L(4, 'L17', 'L17 · Pix2Pix: U-Net + PatchGAN')], [B('lab-17-pix2pix', 'Lab 17 · Pix2Pix: edges to digits')],
    [D('L16-image-to-image-framework', 'L16 · Image-to-image framework'), D('L17-pix2pix', 'L17 · Pix2Pix')]),
  topic2(2, 'Data augmentation and privacy', 'GANs for small datasets, conditional augmentation, DP-SGD, PATE-GAN.', 'Topic 1; Unit 3 evaluation (FID) and bias.', [],
    [L(4, 'L18', 'L18 · Data augmentation and privacy')], [], [D('L18-data-augmentation-and-privacy', 'L18 · Data augmentation and privacy')]),
  ])

unit_page(5, 'CycleGAN and the satellite-to-map capstone',
  'Translate without paired data, then apply everything to real satellite imagery.',
  'Unit 4 Pix2Pix (U-Net, PatchGAN, L1 + GAN loss).',
  'Train a CycleGAN with cycle-consistency and identity losses, and complete an end-to-end satellite → map project.',
  [
  topic2(1, 'CycleGAN: unpaired translation', 'Cycle-consistency and identity losses, ResNet generator, LSGAN loss, replay buffer.', 'Unit 4 Pix2Pix.', [],
    [L(5, 'L19', 'L19 · CycleGAN: unpaired translation')], [B('lab-19-cyclegan', 'Lab 19 · CycleGAN')], [D('L19-cyclegan', 'L19 · CycleGAN')]),
  topic2(2, 'Capstone: satellite to map', 'Pix2Pix on real satellite imagery, the CycleGAN alternative, and the full course recap.', 'Topic 1 and Unit 4.', [],
    [L(5, 'L20', 'L20 · Satellite to map + course wrap-up')], [B('lab-20-satellite-to-map', 'Lab 20 · Satellite to map')], [D('L20-satellite-to-map-and-wrapup', 'L20 · Satellite to map and wrap-up')]),
  ])

# ---------------- Hub ----------------
def unit_stats(n):
    simple_decks = sorted(glob.glob(f'{T}/{V1}/unit-{n}/**/*.html', recursive=True))
    labs = glob.glob(f'{T}/unit-{n}/labs/*.ipynb')
    advs = [f for f in glob.glob(f'{T}/{V2}/unit-{n}/*.html') if re.match(r'\d-', os.path.basename(f))]
    return len(advs), len(simple_decks), len(labs)

def card(n, title, blurb, extra=''):
    a, s, l = unit_stats(n)
    pl = lambda k, w: f'{k} {w}' + ('' if k == 1 else 's')
    parts = ([pl(a, 'advanced deck')] if a else []) + [pl(s, 'simple deck'), pl(l, 'lab'), 'lesson notes']
    return f'<a class="card" href="#unit-{n}"><small>Unit {n}</small><strong>{html.escape(title)}</strong><ul><li>{" · ".join(parts)}{extra}</li></ul><p>{html.escape(blurb)}</p></a>'

dd = adv_stats('deep-dive')
hub = f"""<div class="top" id="top"><span class="mark">GM</span><div class="crumbs">GAN Mastery · Training materials</div></div>
<p class="kicker">GAN Mastery</p>
<h1>Training materials, by unit</h1>
<p class="lede">Five units that build on each other — each grouped the same way: advanced decks, simple decks, labs and docs, organised by topic so you can teach at your own pace.</p>
{path_strip(None, '')}
<div class="cards">
  {card(1, 'Generative AI, GANs, PyTorch and DCGAN', 'Generative AI landscape → the GAN idea → neural networks → build GANs up to DCGAN.', ' · NN course app')}
  {card(2, 'Better loss, stable training, control', 'Why BCE fails → WGAN → WGAN-GP → conditional GANs → latent control.')}
  {card(3, 'Evaluate and scale', 'IS and FID, bias and fairness, StyleGAN.')}
  {card(4, 'Image translation, augmentation and privacy', 'Image-to-image, Pix2Pix, GANs for augmentation and private data.')}
  {card(5, 'CycleGAN and capstone', 'Unpaired translation, then satellite → map on real data.')}
  <a class="card" href="slide-decks/v2/deep-dive/index.html"><small>Deep dive · any time</small><strong>How neural networks learn</strong><ul><li>{dd[0]} slides · {dd[1]} live labs</li></ul><p>Gradient descent, optimizers, activations, loss functions and the training toolkit.</p></a>
</div>
<h2>Units</h2>
<p class="lede">Each unit: what you need, what you will be able to do, and per topic its v2 deck, v1 lesson pages, labs and docs.</p>
{LEGEND}
{''.join(UNIT_SECTIONS[k] for k in sorted(UNIT_SECTIONS))}
<p class="naming"><b>Numbering.</b> Lesson and lab numbers are historical and stable: NN-L00–L14 are the neural-network lessons; S1/S2 replace the old L00/L01; GAN lessons run L02–L20. Unit 1’s notebooks are lab-p1–p3, lab-00 and lab-01–04; from Unit 2 a lab shares its lesson’s number (lab-08 ↔ L08), and lessons without a notebook leave gaps (L07, L12, L14, L16, L18).</p>
<h2>Slide decks</h2>
<div class="cards">
  <a class="card" href="slide-decks/v1/index.html"><small>Slide decks · v1</small><strong>Lesson pages</strong><p>One short HTML deck per lesson, Units 1–5.</p></a>
  <a class="card" href="slide-decks/v2/index.html"><small>Slide decks · v2</small><strong>Everything else</strong><p>Advanced topic decks with live labs, the deep dives and the neural-networks course app.</p></a>
</div>
<p class="foot">Plan: <a href="TRAINING-PLAN.md">TRAINING-PLAN.md</a> · Advanced decks are built from <code>training/deck-builder</code> (<code>npm run build</code>); these pages are generated by <code>deck-builder/scripts/make-index.py</code>.</p>
"""

# ---------------- slide-decks/v1 and v2 overview pages ----------------
UNIT_TITLES = {1: 'Generative AI, GANs, PyTorch and DCGAN', 2: 'Better loss, stable training, control', 3: 'Evaluate and scale',
               4: 'Image translation, augmentation and privacy', 5: 'CycleGAN and the satellite-to-map capstone'}
ADV_IDS = {('1', 1): 'u1-genai-gans', ('2', 1): 'u1-neural-networks', ('3', 1): 'u1-build-gans', ('4', 1): 'u1-activations',
           ('1', 2): 'u2-better-loss', ('2', 2): 'u2-control'}

def deck_title(path):
    t = re.search(r'<title>(.*?)</title>', open(path, encoding='utf-8').read(), re.S)
    return html.unescape(t.group(1).strip()) if t else os.path.basename(path)

def v_page(version):
    rows = []
    for u in range(1, 6):
        folder = f'{T}/slide-decks/{version}/unit-{u}'
        if not os.path.isdir(folder): continue
        items = []
        for f in sorted(glob.glob(f'{folder}/**/*.html', recursive=True)):
            rel = os.path.relpath(f, f'{T}/slide-decks/{version}')
            m = re.match(r'(\d)-', os.path.basename(f))
            if version == 'v2' and m:
                n, l = adv_stats(ADV_IDS[(m.group(1), u)])
                items.append(link(rel, deck_title(f).replace('GAN Mastery · ', ''), f'{n} slides · {l} live labs'))
            else:
                items.append(link(rel, deck_title(f), f'{simple_count(os.path.relpath(f, T))} slides'))
        kind = 'adv' if version == 'v2' else 'simple'
        rows.append(f'<section class="topic" style="grid-template-columns:minmax(200px,.85fr) minmax(0,3fr)"><div class="topic-head"><small>Unit {u}</small><strong>{html.escape(UNIT_TITLES[u])}</strong><p><a href="../../index.html#unit-{u}">Unit {u} · topics, labs and docs →</a></p></div>'
                    + col(kind, 'v2 decks' if version == 'v2' else 'v1 lesson pages', items) + '</section>')
    if version == 'v2':
        n, l = adv_stats('deep-dive')
        rows.append('<section class="topic" style="grid-template-columns:minmax(200px,.85fr) minmax(0,3fr)"><div class="topic-head"><small>Unit 1 · app</small><strong>Neural-networks course app</strong><p>Next.js · run locally with npm.</p></div>'
                    + col('adv', 'App', [link('nn-course-app/README.md', 'Neural networks course app', '14 lessons · npm install && npm run dev')]) + '</section>')
        rows.append('<section class="topic" style="grid-template-columns:minmax(200px,.85fr) minmax(0,3fr)"><div class="topic-head"><small>Any unit</small><strong>Deep dive</strong><p>Background for every unit.</p></div>'
                    + col('adv', 'Advanced deck', [link('deep-dive/index.html', 'How neural networks learn', f'{n} slides · {l} live labs')]) + '</section>')
        title, lede = 'Slide decks v2 · decks, deep dives and app', 'Full teaching decks with live labs, worked formula slides, lab demos and presenter notes. Built from training/deck-builder.'
    else:
        title, lede = 'Slide decks v1 · lesson pages', 'One short HTML deck per lesson — quick to present, easy to edit. Units 1–5.'
    other = 'v2' if version == 'v1' else 'v1'
    body = top([('../../index.html', 'GAN Mastery'), ('', f'Slide decks {version}')]) + f"""
<p class="kicker">GAN Mastery · slide decks {version}</p>
<h1>{html.escape(title)}</h1>
<p class="lede">{html.escape(lede)}</p>
<h2>By unit</h2>
{''.join(rows)}
<p class="foot">Other set: <a href="../{other}/index.html">slide decks {other}</a> · <a href="../../index.html">All units</a></p>
"""
    open(f'{T}/slide-decks/{version}/index.html', 'w').write(page(title, body))

v_page('v1'); v_page('v2')

open(f'{T}/index.html', 'w').write(page('GAN Mastery · Training materials', hub))
print('written')
