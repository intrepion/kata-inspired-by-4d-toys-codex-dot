import type { V4 } from "./geometry";
export type Ball = { p: V4; v: V4; r: number };
export const ROOM = 2.5;
export interface Dynamics { gravity?: number; restitution?: number; drag?: number }
/** Translational 4D spheres. A held body is kinematic, with zero inverse mass. */
export function stepBalls(balls: Ball[], elapsed: number, held = -1, dynamics: Dynamics = {}): void {
  const dt = Number.isFinite(elapsed) ? Math.max(0, Math.min(elapsed, 0.05)) : 0;
  const n = Math.max(1, Math.ceil(dt / 0.004));
  const h = dt / n, gravity = dynamics.gravity ?? 0, restitution = dynamics.restitution ?? 1;
  const walls = () => {
    balls.forEach((b, i) => {
      for (let k = 0; k < 4; k++) {
        const limit = ROOM - b.r;
        if (Math.abs(b.p[k]) > limit) {
          const side = Math.sign(b.p[k]); b.p[k] = side * limit;
          if (i !== held && b.v[k] * side > 0) {
            b.v[k] *= -restitution;
            if (restitution < 1 && Math.abs(b.v[k]) < 0.18) b.v[k] = 0;
          }
        }
      }
    });
  };
  for (let sub = 0; sub < n; sub++) {
    balls.forEach((b, i) => {
      if (i === held) return;
      b.v[1] -= gravity * h;
      for (let k = 0; k < 4; k++) {
        b.v[k] *= Math.exp(-(dynamics.drag ?? 0) * h);
        b.p[k] += b.v[k] * h;
      }
    });
    walls();
    for (let iteration = 0; iteration < 12; iteration++) {
      for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], b = balls[j], delta = a.p.map((x, k) => b.p[k] - x);
        const d = Math.hypot(...delta), sum = a.r + b.r;
        if (d >= sum) continue;
        const normal = d > 1e-9 ? delta.map(x => x / d) : [1, 0, 0, 0];
        const wa = i === held ? 0 : 1, wb = j === held ? 0 : 1, weight = wa + wb;
        const approach = a.v.reduce((s, x, k) => s + (x - b.v[k]) * normal[k], 0);
        const impulse = approach > 0 ? (1 + restitution) * approach / weight : 0;
        for (let k = 0; k < 4; k++) {
          a.p[k] -= normal[k] * (sum - d) * wa / weight;
          b.p[k] += normal[k] * (sum - d) * wb / weight;
          a.v[k] -= impulse * normal[k] * wa;
          b.v[k] += impulse * normal[k] * wb;
        }
      }
      walls();
    }
  }
}
export const GRAVITY_ROOM: Dynamics = { gravity: 6, restitution: 0.64, drag: 0.12 };
export function roomBalls(): Ball[] {
  return [
    { p: [-1.2, 0, 0, -0.8], v: [0.65, 0.22, 0.18, 0.6], r: 0.55 },
    { p: [1.2, 0.1, 0, 0.8], v: [-0.65, -0.22, -0.18, -0.6], r: 0.55 },
    { p: [0, 1.2, 0.3, 0], v: [0.3, -0.65, 0.35, 0.5], r: 0.5 },
    { p: [0, -1.2, -0.3, 0], v: [-0.3, 0.65, -0.35, -0.5], r: 0.5 },
  ];
}
