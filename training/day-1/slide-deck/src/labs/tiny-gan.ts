/**
 * A real, tiny GAN that runs in the browser — the exact Session 4 setup:
 *   G: Linear(1,16) → ReLU → Linear(16,1)
 *   D: Linear(1,16) → ReLU → Linear(16,1) → Sigmoid
 *   BCE loss, two Adam optimizers, D step (fake detached) then G step (target = real).
 * Gradients are written out by hand so nothing is faked.
 */

export type Rng = () => number;

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randn(rng: Rng) {
  const u = Math.max(rng(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

const sigmoid = (a: number) => (a >= 0 ? 1 / (1 + Math.exp(-a)) : Math.exp(a) / (1 + Math.exp(a)));
const EPS = 1e-7;
const bce = (p: number, y: number) => -(y * Math.log(Math.max(p, EPS)) + (1 - y) * Math.log(Math.max(1 - p, EPS)));

/** Linear(1,H) → ReLU → Linear(H,1). Parameters flattened: w1[H], b1[H], w2[H], b2. */
class Mlp {
  readonly h: number;
  p: Float64Array;
  constructor(hidden: number, rng: Rng) {
    this.h = hidden;
    this.p = new Float64Array(3 * hidden + 1);
    // PyTorch default init: U(-1/sqrt(fan_in), 1/sqrt(fan_in)).
    const u = (bound: number) => (rng() * 2 - 1) * bound;
    for (let i = 0; i < hidden; i++) {
      this.p[i] = u(1);
      this.p[hidden + i] = u(1);
      this.p[2 * hidden + i] = u(1 / Math.sqrt(hidden));
    }
    this.p[3 * hidden] = u(1 / Math.sqrt(hidden));
  }

  forward(x: number) {
    const { h, p } = this;
    const z = new Float64Array(h);
    let out = p[3 * h];
    for (let i = 0; i < h; i++) {
      z[i] = p[i] * x + p[h + i];
      if (z[i] > 0) out += p[2 * h + i] * z[i];
    }
    return { out, z };
  }

  /** Accumulates dL/dparams into `grad`; returns dL/dx. */
  backward(x: number, z: Float64Array, dOut: number, grad: Float64Array) {
    const { h, p } = this;
    let dx = 0;
    grad[3 * h] += dOut;
    for (let i = 0; i < h; i++) {
      if (z[i] <= 0) continue; // closed ReLU gate blocks blame
      grad[2 * h + i] += dOut * z[i];
      const dz = dOut * p[2 * h + i];
      grad[i] += dz * x;
      grad[h + i] += dz;
      dx += dz * p[i];
    }
    return dx;
  }
}

class Adam {
  private m: Float64Array;
  private v: Float64Array;
  private t = 0;
  private lr: number;
  private b1: number;
  private b2: number;
  constructor(size: number, lr: number, b1 = 0.9, b2 = 0.999) {
    this.lr = lr;
    this.b1 = b1;
    this.b2 = b2;
    this.m = new Float64Array(size);
    this.v = new Float64Array(size);
  }
  step(params: Float64Array, grad: Float64Array) {
    this.t++;
    const c1 = 1 - this.b1 ** this.t, c2 = 1 - this.b2 ** this.t;
    for (let i = 0; i < params.length; i++) {
      this.m[i] = this.b1 * this.m[i] + (1 - this.b1) * grad[i];
      this.v[i] = this.b2 * this.v[i] + (1 - this.b2) * grad[i] * grad[i];
      params[i] -= (this.lr * (this.m[i] / c1)) / (Math.sqrt(this.v[i] / c2) + 1e-8);
    }
  }
}

export type GanSnapshot = {
  epoch: number;
  dLoss: number;
  gLoss: number;
  dReal: number;
  dFake: number;
  sample: number;
};

export type GanOptions = { seed?: number; target?: number; lr?: number; hidden?: number };

export class TinyGan {
  readonly target: number;
  epoch = 0;
  private G: Mlp;
  private D: Mlp;
  private optG: Adam;
  private optD: Adam;
  private rng: Rng;
  private sampleRng: Rng;

  constructor({ seed = 11, target = 7, lr = 0.001, hidden = 16 }: GanOptions = {}) {
    this.rng = makeRng(seed);
    this.sampleRng = makeRng(seed * 31 + 1);
    this.target = target;
    this.G = new Mlp(hidden, this.rng);
    this.D = new Mlp(hidden, this.rng);
    this.optG = new Adam(this.G.p.length, lr);
    this.optD = new Adam(this.D.p.length, lr);
  }

  generate(noise: number) {
    return this.G.forward(noise).out;
  }

  judge(x: number) {
    return sigmoid(this.D.forward(x).out);
  }

  /** One epoch = Step A (train D) then Step B (train G). */
  step(): GanSnapshot {
    this.epoch++;
    const { G, D } = this;

    // ---- Step A: train the Discriminator ----
    const gradD = new Float64Array(D.p.length);
    const real = D.forward(this.target);
    const pReal = sigmoid(real.out);
    D.backward(this.target, real.z, pReal - 1, gradD); // d BCE(p,1) / d logit = p − 1

    const noiseA = randn(this.rng);
    const gA = G.forward(noiseA);
    const fake = D.forward(gA.out);
    const pFake = sigmoid(fake.out);
    D.backward(gA.out, fake.z, pFake, gradD); // d BCE(p,0) / d logit = p · fake is detached: G gets nothing
    this.optD.step(D.p, gradD);
    const dLoss = bce(pReal, 1) + bce(pFake, 0);

    // ---- Step B: train the Generator (target = real label) ----
    const noiseB = randn(this.rng);
    const gB = G.forward(noiseB);
    const judged = D.forward(gB.out);
    const p = sigmoid(judged.out);
    const scratch = new Float64Array(D.p.length); // D's grads are computed but discarded
    const dx = D.backward(gB.out, judged.z, p - 1, scratch);
    const gradG = new Float64Array(G.p.length);
    G.backward(noiseB, gB.z, dx, gradG);
    this.optG.step(G.p, gradG);
    const gLoss = bce(p, 1);

    return { epoch: this.epoch, dLoss, gLoss, dReal: pReal, dFake: pFake, sample: G.forward(randn(this.sampleRng)).out };
  }
}
