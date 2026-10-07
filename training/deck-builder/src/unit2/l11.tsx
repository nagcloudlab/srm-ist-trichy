import './l11.css';
import { Answer, Bridge, Cards, Code, Divider, Equation, FormulaSteps, FormulaTerms, LabDemo, Mapping, Predict, Quiz, Recap, Split, Steps, T, Table, Takeaway, Versus } from '../components/kit';
import { digitGrid } from '../components/art';
import { InterpLab, TruncLab } from '../labs/D2L11Labs';
import type { Part } from '../types';

/** A 14×14 intensity grid drawn like PixelDigit. */
function Glyph({ values, px = 76, label }: { values: number[]; px?: number; label: string }) {
  return (
    <svg className="pixel-digit" viewBox="0 0 14 14" width={px} height={px} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width="14" height="14" fill="#111827" />
      {values.map((v, i) => v > 0.02 && <rect key={i} x={i % 14} y={Math.floor(i / 14)} width="1" height="1" fill="#f7f4ed" opacity={v} />)}
    </svg>
  );
}

const blend = (a: string, b: string, t: number) => {
  const ga = digitGrid(a, 14, 0, 0, 3);
  const gb = digitGrid(b, 14, 0, 0, 4);
  return ga.map((v, i) => (1 - t) * v + t * gb[i]);
};

export const l11Part: Part = {
  id: 'l11',
  code: 'L11',
  label: 'Control',
  title: 'Controllable generation: steer the latent space, not just the label',
  when: '',
  minutes: 0,
  slides: [
    {
      id: 'l11-divider',
      section: 'Open',
      kicker: 'Lesson 11',
      title: 'Controllable generation',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'The final lesson of Unit 2. L10 gave control over WHAT to generate. Now we control HOW it looks — thickness, tilt, style — by moving through the latent space.',
        ask: 'If you could change one visual feature of a generated digit, what would it be?',
      },
      render: () => (
        <Divider
          code="L11"
          title="Controllable generation"
          promise="Beyond class labels — steer thickness, tilt and style by moving through z."
          items={['Latent structure', 'Interpolation · lerp vs slerp', 'Latent arithmetic', 'Finding directions', 'Truncation trick']}
        />
      ),
    },
    {
      id: 'l11-where',
      section: 'Open',
      kicker: 'Where we are',
      title: 'Labels pick WHAT to draw — the latent space decides HOW it looks',
      notes: {
        time: '2 min',
        say: 'L10 gave class control: pick a digit. But a thick 7 or a tilted 3 is not a label. That is what this lesson solves.',
        ask: 'Can a cGAN generate a thick 7 vs a thin 7 on demand?',
      },
      render: () => (
        <Versus
          left={{ tag: 'L10 · Conditional GAN', title: 'Class-level control', body: <ul><li>“Generate a 7”</li><li>“Generate a 3”</li><li>Pick <b>what</b> digit</li></ul>, tone: 'mint' }}
          right={{ tag: 'L11 · Controllable generation', title: 'Feature-level control', body: <ul><li>“A <b>thick</b> 7”</li><li>“Make it <b>lean right</b>”</li><li>Pick <b>how</b> it looks</li></ul>, tone: 'yellow' }}
        />
      ),
    },
    {
      id: 'l11-structure',
      section: 'Latent space',
      kicker: 'The big idea',
      title: 'A trained GAN puts similar images near each other in z-space',
      notes: {
        time: '3 min',
        say: 'The latent space is the space of all noise vectors z. Each z maps to an image. A well-trained GAN organizes this space: similar images cluster together, so nearby z’s give similar images.',
        ask: 'If two z vectors are very close together, what would you expect about their images?',
      },
      render: () => (
        <>
          <Mapping leftLabel="Noise vector z (64 numbers)" rightLabel="Image G(z)" rows={[
            [<code>[0.3, −1.2, 0.7, …]</code>, 'thin, straight 7'],
            [<code>[1.1, 0.5, −0.3, …]</code>, 'thick, tilted 3'],
            [<code>[−0.8, 2.1, 0.1, …]</code>, 'round, small 0'],
          ]} />
          <Takeaway>Not random scatter: nearby z → similar images. That structure is what we steer.</Takeaway>
        </>
      ),
    },
    {
      id: 'l11-directions',
      section: 'Latent space',
      kicker: 'Controllable directions',
      title: 'Moving z along one direction changes one feature',
      notes: {
        time: '2 min',
        say: 'These organized directions are what give control. Move along one direction and one feature changes. The GAN learns them on its own during training; our job is to find them.',
        ask: 'What other features might have directions in latent space for MNIST?',
      },
      render: () => (
        <>
          <Cards cols={3} items={[
            { tag: 'Direction A', title: 'Thicker strokes', body: 'More ink, same digit', tone: 'blue' },
            { tag: 'Direction B', title: 'More tilt', body: 'Leans further right', tone: 'violet' },
            { tag: 'Direction C', title: 'Taller', body: 'Stretches vertically', tone: 'mint' },
          ]} />
          <Takeaway>G discovers these directions during training — we only need to find them.</Takeaway>
        </>
      ),
    },
    {
      id: 'l11-predict-mid',
      section: 'Interpolation',
      kicker: 'Predict',
      title: 'Is the halfway point between two noise vectors a typical noise vector?',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'Let everyone commit before revealing. Most people assume the average of two samples looks like a sample. In 64 dimensions it does not.',
        ask: 'Which property of z does averaging change?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="Is the straight-line midpoint a normal z for G?"
          facts={['z₁, z₂ ∼ N(0, I) with 64 entries', 'Every training z has length ≈ 8', 'Midpoint = ½ z₁ + ½ z₂']}
          answer={<Answer verdict="No — it is too short" points={[<>‖midpoint‖ ≈ <b>5.7</b>, not 8</>, 'G never saw such short z in training', <>Slerp walks the arc and keeps ‖z‖ ≈ <b>8</b></>]} />}
        />
      ),
    },
    {
      id: 'l11-lerp-terms',
      section: 'Interpolation',
      kicker: 'Formula · term by term',
      title: 'Slerp walks the arc between two noise vectors instead of the straight chord',
      notes: {
        time: '3 min',
        say: 'Lerp is a weighted average. Slerp replaces the straight line with an arc. Random high-dimensional z vectors are almost perpendicular and almost the same length — that is why the arc matters.',
        ask: 'Why would a shorter-than-usual z be a problem for the generator?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="8rem"
          smallSymbols
          cols={2}
          reading="slerp = [ sin((1 − t)Ω) · z₁ + sin(tΩ) · z₂ ] ÷ sin Ω, where Ω is the angle between z₁ and z₂"
          formula={<><span>slerp</span><span className="op">=</span>[ sin((1−<T tone="yellow">t</T>)<T tone="violet">Ω</T>)·<T tone="blue">z₁</T><span className="op">+</span>sin(<T tone="yellow">t</T><T tone="violet">Ω</T>)·<T tone="blue">z₂</T> ] / sin <T tone="violet">Ω</T></>}
          terms={[
            { symbol: 'z₁, z₂', name: 'Endpoint noise vectors', meaning: 'The two images to blend', range: '64 numbers', tone: 'blue' },
            { symbol: 't', name: 'Position', meaning: '0 = z₁ · 1 = z₂', range: '0 … 1', tone: 'yellow' },
            { symbol: 'lerp', name: 'Lerp: (1 − t)·z₁ + t·z₂', meaning: 'Straight line — cuts through the middle', range: 'shrinks', tone: 'coral' },
            { symbol: 'Ω', name: 'Angle between them', meaning: 'arccos of the normalized dot product', range: '≈ 90°', tone: 'violet' },
            { symbol: 'sin / sin Ω', name: 'Slerp weights', meaning: 'Sum to more than 1 mid-way — keeps the length', range: '0.707 at t = ½', tone: 'mint' },
            { symbol: '√d', name: 'Typical length ‖z‖', meaning: 'Where Gaussian z lives in d dims', range: '8 for d = 64', tone: 'plain' },
          ]}
        />
      ),
    },
    {
      id: 'l11-lerp-steps',
      section: 'Interpolation',
      kicker: 'Formula · worked',
      title: 'The lerp midpoint shrinks to 5.7 — slerp stays at 8',
      notes: {
        time: '3 min',
        say: 'Pythagoras: two perpendicular vectors of length 8 add to length 11.3; halving gives 5.66. Slerp’s larger weights keep it at 8. The simulated values come from 100,000 random pairs.',
        ask: 'At t = 0 and t = 1, do lerp and slerp differ?',
      },
      render: () => (
        <FormulaSteps
          given={['d = 64', 'z₁, z₂ ∼ N(0, I), independent', 't = 0.5']}
          steps={[
            { math: <>‖z₁‖ ≈ ‖z₂‖ ≈ √64 = 8</>, note: 'simulated mean 7.97' },
            { math: <>z₁ · z₂ ≈ 0 → Ω ≈ 90°</>, note: 'simulated 90.0° ± 7.2°' },
            { math: <>lerp: ½ · √(8² + 8²) = 5.66</>, note: 'simulated 5.63' },
            { math: <>slerp weight: sin 45° / sin 90° = 0.707</>, note: 'larger than ½' },
            { math: <>slerp: 0.707 · √(8² + 8²) = 8.0</>, note: 'simulated 7.98' },
          ]}
          result={<>lerp midpoint ≈ 5.7 (rare) · slerp ≈ 8 (typical)</>}
        />
      ),
    },
    {
      id: 'l11-interp-lab',
      section: 'Interpolation',
      kicker: 'Try it · lerp vs slerp',
      title: 'Slide along the path and watch the lerp midpoint fall off the shell',
      lab: true,
      notes: {
        time: '4 min',
        say: 'The curves are exact for two seeded 64-D Gaussian vectors. Switch between lerp and slerp, drag t to 0.5, then draw a new pair. The images come from a toy generator that washes out when ‖z‖ is atypical — the same symptom the knowledge check asks about.',
        ask: 'Where on the path is the lerp length smallest, and by what factor?',
      },
      render: () => <InterpLab />,
    },
    {
      id: 'l11-interp-code',
      section: 'Interpolation',
      kicker: 'Interpolation in code',
      title: 'Eight blended z’s give a smooth morph from image A to image B',
      notes: {
        time: '2 min',
        say: 'Two random noise vectors, blended in steps, each fed to the generator. Every frame should look like a real digit. Dividing by steps − 1 makes the last alpha exactly 1.',
        ask: 'Why do we divide by (steps − 1) instead of steps?',
      },
      render: () => (
        <Split ratio="1.4fr 1fr" left={
          <Code title="lerp walk · cGAN generator" code={`z1 = torch.randn(1, z_dim)     # noise for image A
z2 = torch.randn(1, z_dim)     # noise for image B
steps = 8

for i in range(steps):
    alpha = i / (steps - 1)    # 0.0 … 1.0
    z_interp = (1 - alpha) * z1 + alpha * z2
    image = gen(z_interp, label)`} marks={{ 6: 'yellow', 7: 'blue' }} notes={{ 6: 'last step lands exactly on 1.0', 7: 'swap in slerp here' }} />
        } right={
          <Steps items={[
            { title: 'Sharp in-between frames', body: 'The latent space is smooth', tone: 'mint' },
            { title: 'Washed-out middle', body: 'Try slerp before blaming G', tone: 'yellow' },
            { title: 'Blurry even with slerp', body: 'The latent space has holes', tone: 'coral' },
          ]} />
        } />
      ),
    },
    {
      id: 'l11-arith',
      section: 'Arithmetic',
      kicker: 'Latent arithmetic',
      title: 'Thick 7 − thin 7 leaves only “thickness” — add it to any digit',
      notes: {
        time: '3 min',
        say: 'Word embeddings: king − man + woman ≈ queen. GANs can do the same with images. Thick 7 minus thin 7 isolates a thickness direction; add it to a thin 3. DCGAN showed this with faces using the average z of three samples per concept.',
        ask: 'What happens if you subtract a smiling face from a neutral face in latent space?',
      },
      render: () => (
        <>
          <Equation size="md" reading="word2vec: king − man + woman ≈ queen · DCGAN (Radford et al. 2015): smiling woman − neutral woman + neutral man ≈ smiling man">
            <span>thick 7</span><span className="op">−</span><span>thin 7</span><span className="op">+</span><span>thin 3</span><span className="op">=</span><T tone="mint">thick 3</T>
          </Equation>
          <Cards cols={2} items={[
            { tag: 'Why it works', title: 'Shared parts cancel', body: 'Both 7s share “sevenness” — subtracting leaves only the difference', tone: 'blue' },
            { tag: 'In practice', title: 'Average several z per concept', body: 'Radford et al. used the mean of 3 samples — single z’s are too noisy', tone: 'yellow' },
          ]} />
        </>
      ),
    },
    {
      id: 'l11-arith-terms',
      section: 'Arithmetic',
      kicker: 'Formula · term by term',
      title: 'Latent arithmetic is a base vector plus a direction',
      notes: {
        time: '3 min',
        say: 'Read it as base plus direction. The averages remove each sample’s quirks; the 7 cancels in the difference; the thin 3 is the new base.',
        ask: 'Why does subtracting thin 7 from thick 7 remove “sevenness” but keep “thickness”?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="9rem"
          reading="z_new = average thick-7 z − average thin-7 z + average thin-3 z"
          formula={<><T tone="mint">z_new</T><span className="op">=</span><T tone="blue">z̄_thick7</T><span className="op">−</span><T tone="blue">z̄_thin7</T><span className="op">+</span><T tone="violet">z̄_thin3</T></>}
          terms={[
            { symbol: 'z̄_A', name: 'Averaged z', meaning: 'Mean of several z’s that produced attribute A', range: 'cancels noise', tone: 'blue' },
            { symbol: 'z̄_thick7 − z̄_thin7', name: 'Direction', meaning: 'The “thickness” step — the 7 cancels out', range: 'a vector', tone: 'yellow' },
            { symbol: '+ z̄_thin3', name: 'New base', meaning: 'Apply the direction to a different digit', range: 'a vector', tone: 'violet' },
            { symbol: 'z_new', name: 'Result', meaning: 'Feed to G — hopefully a thick 3', range: '64 numbers', tone: 'mint' },
          ]}
        />
      ),
    },
    {
      id: 'l11-arith-code',
      section: 'Arithmetic',
      kicker: 'Arithmetic in code',
      title: 'Scale the direction to choose how strong the feature is',
      notes: {
        time: '2 min',
        say: 'Subtract to get the direction, then add or subtract it from any new z. The 0.5 sets the strength: bigger means more effect, too big leaves the typical region and looks unrealistic.',
        ask: 'What happens if you use a scaling factor of 5.0 instead of 0.5?',
      },
      render: () => (
        <Split ratio="1.4fr 1fr" left={
          <Code title="apply a thickness direction" code={`thickness_dir = z_thick - z_thin

z_new = torch.randn(1, z_dim)
z_thicker = z_new + 0.5 * thickness_dir
z_thinner = z_new - 0.5 * thickness_dir

img_normal  = gen(z_new, label)
img_thicker = gen(z_thicker, label)
img_thinner = gen(z_thinner, label)`} marks={{ 1: 'yellow', 4: 'mint', 5: 'coral' }} notes={{ 1: 'the direction', 4: '0.5 = strength', 5: 'opposite way' }} />
        } right={
          <Cards cols={1} items={[
            { tag: '× 0.5', title: 'Visible, still realistic', tone: 'mint' },
            { tag: '× 5.0', title: 'Leaves the typical region', body: 'Images break down', tone: 'coral' },
          ]} />
        } />
      ),
    },
    {
      id: 'l11-so-far',
      section: 'Arithmetic',
      kicker: 'So far',
      title: 'Three ways to use the latent space — next, how to find directions',
      notes: {
        time: '2 min',
        say: 'Quick recap before going deeper. Structure, interpolation and arithmetic. The open question: where do the directions come from?',
        ask: 'Which of these three techniques gives you the most creative control?',
      },
      render: () => (
        <Table
          headers={['Technique', 'What it does', 'Key formula']}
          rows={[
            ['Latent structure', 'Similar images cluster in z-space', 'nearby z → similar images'],
            ['Interpolation', 'Walk smoothly between two images', '(1 − t)·z₁ + t·z₂ · or slerp'],
            ['Arithmetic', 'Add or remove a feature', 'z + α · direction'],
          ]}
        />
      ),
    },
    {
      id: 'l11-averaged',
      section: 'Finding directions',
      kicker: 'Averaged method',
      title: 'Average many z’s per group — individual quirks cancel out',
      notes: {
        time: '3 min',
        say: 'You do not know in advance which z gives a thick digit. Generate many, sort by the feature, average the z vectors in each group, subtract. Like an opinion poll: one person is noisy, a thousand reveal the trend.',
        ask: 'Why is averaging 100 z vectors better than using just one pair?',
      },
      render: () => (
        <Split ratio="1fr 1fr" align="start" left={
          <Steps items={[
            { title: 'Generate lots of images', body: 'Keep each z', tone: 'blue' },
            { title: 'Sort by the feature', body: 'Thick vs thin', tone: 'violet' },
            { title: 'Average z per group', body: 'z̄_thick, z̄_thin', tone: 'mint' },
            { title: 'Subtract', body: 'direction = z̄_thick − z̄_thin', tone: 'yellow' },
          ]} />
        } right={
          <Cards cols={1} items={[
            { tag: 'Single pair', title: 'Noisy', body: 'Captures thickness plus stroke style and random quirks', tone: 'coral' },
            { tag: 'Averaged', title: 'Clean', body: 'Quirks cancel — mostly the thickness direction remains', tone: 'mint' },
          ]} />
        } />
      ),
    },
    {
      id: 'l11-classifier',
      section: 'Finding directions',
      kicker: 'Classifier method',
      title: 'A small classifier can do the sorting for you',
      notes: {
        time: '2 min',
        say: 'Instead of sorting by hand, train a simple classifier to label the feature, then average z per group. With a cGAN you can find directions within one class — 500 different 7s sorted by thickness.',
        ask: 'What kind of classifier would you train to detect tilt in MNIST digits?',
      },
      render: () => (
        <>
          <Steps items={[
            { title: 'Generate 1,000 images with their z', tone: 'blue' },
            { title: 'Classify each image', body: 'thick / thin · tilted / straight', tone: 'violet' },
            { title: 'Average z per predicted group', tone: 'mint' },
            { title: 'Subtract → direction', tone: 'yellow' },
          ]} />
          <Takeaway tone="mint">With a cGAN, fix the label and search within one class — a thickness direction for 7s.</Takeaway>
        </>
      ),
    },
    {
      id: 'l11-single-dim',
      section: 'Finding directions',
      kicker: 'Single-dimension exploration',
      title: 'Sweeping one z dimension rarely changes just one feature',
      notes: {
        time: '2 min',
        say: 'The simplest probe: fix z, change one dimension from −3 to +3, look. Some dims change something visible, many change several things at once — they are entangled. The table is illustrative, not a measured result.',
        ask: 'If z has 64 dimensions, how many do you expect to control a nameable feature?',
      },
      render: () => (
        <Split ratio="1.3fr 1fr" left={
          <Code title="sweep one dimension" code={`z_base = torch.randn(1, z_dim)
for dim in range(z_dim):
    for value in [-3, -2, -1, 0, 1, 2, 3]:
        z_mod = z_base.clone()
        z_mod[0, dim] = value
        img = gen(z_mod, label)`} marks={{ 5: 'yellow' }} notes={{ 5: 'only one entry changes' }} />
        } right={
          <Table compact headers={['Dim', 'What changes (illustrative)']} rows={[
            ['0', 'thin → thick'],
            ['1', 'straight → tilted'],
            ['2', 'short → tall'],
            ['3', 'several things at once'],
          ]} />
        } />
      ),
    },
    {
      id: 'l11-cond-interp',
      section: 'Conditional & truncation',
      kicker: 'Conditional interpolation',
      title: 'Fix the noise, blend the label embedding — the digit morphs, the style stays',
      notes: {
        time: '3 min',
        say: 'With a cGAN, keep z fixed and interpolate the label embedding instead. Same noise means same style; only the class changes. Blending embeddings is the same as blending one-hots, because the embedding is linear.',
        ask: 'If you interpolate from label 3 to label 7, what might appear at α = 0.5?',
      },
      render: () => (
        <Split ratio="1.25fr 1fr" left={
          <Code title="morph 3 → 7 with fixed noise" code={`embed_3 = gen.label_embed(torch.tensor([3]))
embed_7 = gen.label_embed(torch.tensor([7]))
z_fixed = torch.randn(1, z_dim)

for alpha in [0.0, 0.25, 0.5, 0.75, 1.0]:
    mix = (1 - alpha) * embed_3 + alpha * embed_7
    x = torch.cat([z_fixed, mix], dim=1)
    img = gen.model(x)`} marks={{ 3: 'blue', 6: 'yellow' }} notes={{ 3: 'same style throughout', 6: 'blend the label only' }} />
        } right={
          <div className="l11-morph">
            {[0, 0.25, 0.5, 0.75, 1].map((a) => <figure key={a}><Glyph values={blend('3', '7', a)} px={84} label={`α = ${a}`} /><figcaption>α {a}</figcaption></figure>)}
            <p className="l11-caption">Illustrative pixel blend · a real G gives in-between shapes, not overlays</p>
          </div>
        } />
      ),
    },
    {
      id: 'l11-trunc',
      section: 'Conditional & truncation',
      kicker: 'Truncation trick',
      title: 'Resample extreme z entries to trade variety for typical, cleaner samples',
      notes: {
        time: '3 min',
        say: 'BigGAN (Brock et al. 2018) samples z from a truncated normal: any entry with |z_i| > t is resampled until it falls inside. Smaller t means more typical samples and less variety. Clamping is not the same: at t = 1 it pins about 32% of entries to exactly ±1. StyleGAN truncates in W space: w′ = w̄ + ψ(w − w̄).',
        ask: 'When would you want more variety, and when more quality?',
      },
      render: () => (
        <Split ratio="1.25fr 1fr" left={
          <Code title="truncated normal · resample |z_i| > t" code={`z = torch.randn(n, z_dim)
bad = z.abs() > t
while bad.any():
    z[bad] = torch.randn(int(bad.sum()))
    bad = z.abs() > t`} marks={{ 4: 'yellow' }} notes={{ 4: 'redraw only the extreme entries' }} />
        } right={
          <Cards cols={1} items={[
            { tag: 'BigGAN · 2018', title: 'Truncated normal z', body: 'Resample entries outside ±t', tone: 'mint' },
            { tag: 'StyleGAN', title: 'w′ = w̄ + ψ(w − w̄)', body: 'Pull toward the average in W space', tone: 'violet' },
            { tag: 'Not the same', title: 'Clamp ≠ truncate', body: 'At t = 1, ~32% of entries pinned to ±1', tone: 'coral' },
          ]} />
        } />
      ),
    },
    {
      id: 'l11-trunc-steps',
      section: 'Conditional & truncation',
      kicker: 'Formula · worked',
      title: 'Lower t resamples more entries and shrinks the spread of z',
      notes: {
        time: '3 min',
        say: 'The percentages are P(|z| > t) for a standard normal; the std is that of the truncated normal. Lower t looks cleaner but samples start to look alike.',
        ask: 'Which threshold would you choose for a demo, and which for a dataset generator?',
      },
      render: () => (
        <FormulaSteps
          given={['z_i ∼ N(0, 1)', 'resample while |z_i| > t']}
          steps={[
            { math: <>t = 2 → 4.6% resampled · std 0.88</>, note: 'almost no change' },
            { math: <>t = 1 → 31.7% resampled · std 0.54</>, note: 'samples hug the mean' },
            { math: <>t = 0.5 → 61.7% resampled · std 0.28</>, note: 'very typical, little variety' },
            { math: <>smaller std → G sees only typical z</>, note: 'quality ↑ · diversity ↓' },
          ]}
          result={<>lower t: cleaner images, less variety</>}
        />
      ),
    },
    {
      id: 'l11-trunc-lab',
      section: 'Conditional & truncation',
      kicker: 'Try it · truncation',
      title: 'Lower the threshold and watch the samples converge',
      lab: true,
      notes: {
        time: '4 min',
        say: 'The z statistics are exact for this draw of 8 × 64 entries; compare them with the theory metric and the worked slide. Switch to clamp at t = 1 and point at the pinned percentage. The 7s come from a toy generator: wider z spread, more varied strokes.',
        ask: 'At which t does the variety score drop fastest?',
      },
      render: () => <TruncLab />,
    },
    {
      id: 'l11-lab-demo',
      section: 'Conditional & truncation',
      kicker: 'Lab demo',
      title: 'Run lab-11: morph, sweep, add a direction, truncate',
      notes: {
        time: '3 min',
        say: 'If lab-10 saved cgan_generator.pt in this folder, section 0 loads it and skips training; otherwise start training first and talk while it runs. Then go section by section. The notebook’s truncation cell uses clamp — point out it is the shortcut, not the resampling version on the slides.',
        ask: 'Before the truncation grid: which row will look most alike — t = 0.3 or t = 3.0?',
      },
      render: () => (
        <LabDemo
          notebook="lab-11-controllable-generation.ipynb"
          goal="Steer a trained cGAN through its latent space — morph, sweep, add directions, truncate."
          steps={[
            <>Section 0: load <code>cgan_generator.pt</code> from lab-10, or train the cGAN</>,
            <>Sections 1–2: interpolation (two 7s, two 3s) and single-dimension sweeps (dims 0–7, −3 … +3)</>,
            <>Section 3: thickness direction from the average z of the thickest vs thinnest 20% of 500 sevens</>,
            <>Sections 4–5: the 3 → 7 morph, then the truncation grid (t = 0.3 … 3.0)</>,
          ]}
          watch={[
            'Printed thin vs thick average intensity — the proxy behind the direction',
            'Same dim on a 7 and a 4: not always the same feature (entangled)',
            <>Truncation grid uses <code>clamp</code>: t = 0.3 rows near-identical, t = 3.0 diverse</>,
          ]}
          yourTurn="Swap lerp for slerp in the interpolation helper. Do the middle frames change?"
        />
      ),
    },
    {
      id: 'l11-recap',
      section: 'Check',
      kicker: 'Lesson 11 summary',
      title: 'Seven ways to turn a noise machine into a controllable tool',
      notes: {
        time: '2 min',
        say: 'Seven concepts, each a different angle on control. Together they turn random noise into a creative tool.',
        ask: 'Which technique would you use first in your own project?',
      },
      render: () => (
        <Recap items={[
          <><b>Latent structure</b> — similar images sit near each other in z-space</>,
          <><b>Interpolation</b> — walk between z’s; slerp keeps ‖z‖ typical</>,
          <><b>Arithmetic</b> — z̄_thick − z̄_thin is a thickness direction</>,
          <><b>Averaged directions</b> — many z’s per group cancel quirks</>,
          <><b>Classifier method</b> — let a small CNN do the sorting</>,
          <><b>Conditional interpolation</b> — fix z, blend label embeddings</>,
          <><b>Truncation</b> — resample |z_i| &gt; t: variety ↔ typical quality</>,
        ]} />
      ),
    },
    {
      id: 'l11-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Can you explain these control results?',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'Eye-opener questions. Q3 surprises almost everyone: blending embeddings and blending one-hots are the same operation.',
        ask: 'Try to answer all four before revealing any.',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} cols={2} items={[
          { q: 'Lerp endpoints look great but the middle looks washed out. Is the GAN broken?', a: 'Not necessarily: training z have ‖z‖ ≈ 8, the lerp midpoint ≈ 5.7. Try slerp first.' },
          { q: 'z.clamp(−1, 1): how many of 64 entries change, and why is it not BigGAN’s trick?', a: '≈ 32% → about 20 entries pinned at ±1. BigGAN resamples, keeping a smooth truncated Gaussian.' },
          { q: 'Blend label embeddings 3 → 7, or blend one-hots then embed. Which is smoother?', a: 'Identical: embed(y) = one_hot(y)·W is linear. Smoothness depends on G, not the blend.' },
          { q: 'Scale a direction by 5.0 instead of 0.5 — why do images break?', a: 'z leaves the typical region G was trained on; the feature overshoots into unrealistic territory.' },
        ]} />
      ),
    },
    {
      id: 'l11-bridge',
      section: 'Check',
      kicker: 'Next',
      title: 'You can steer a GAN — but how do you measure if it is any good?',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'Unit 2 ends here: stable losses and control. Unit 3 asks how to measure GAN quality — Inception Score, FID, precision and recall, bias — and meets StyleGAN.',
        ask: 'How would you prove your generator got better, not just say it?',
      },
      render: () => <Bridge done="Lesson 11 · complete" question="You can steer a GAN — but how do you measure if it is any good?" next="Unit 3 · Evaluate and scale (FID, bias, StyleGAN)" />,
    },
  ],
};
