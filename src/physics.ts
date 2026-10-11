import type { V4 } from "./geometry";
export type Ball = { p: V4; v: V4; r: number };
export const ROOM = 2.5;
/** Discrete equal-mass, frictionless translation in four dimensions. No angular solver. */
export function stepBalls(balls: Ball[], elapsed: number, held = -1): void {
  const dt = Math.max(0, Math.min(elapsed, 0.05));
  const n = Math.max(1, Math.ceil(dt / 0.004));
  for (let sub = 0; sub < n; sub++) {
    for (let i = 0; i < balls.length; i++)
      for (let k = 0; k < 4; k++) {
        const b = balls[i];
        if (i !== held) b.p[k] += (b.v[k] * dt) / n;
        const limit = ROOM - b.r;
        if (b.p[k] > limit) {
          b.p[k] = limit;
          if (b.v[k] > 0) b.v[k] *= -1;
        }
        if (b.p[k] < -limit) {
          b.p[k] = -limit;
          if (b.v[k] < 0) b.v[k] *= -1;
        }
      }
    for (let iteration = 0; iteration < 8; iteration++) {
      for (let i = 0; i < balls.length; i++)
        for (let j = i + 1; j < balls.length; j++) {
          if (i === held || j === held) continue;
          const a = balls[i],
            b = balls[j],
            delta = a.p.map((x, k) => b.p[k] - x),
            d = Math.hypot(...delta),
            sum = a.r + b.r;
          if (d >= sum) continue;
          const normal = d > 1e-9 ? delta.map((x) => x / d) : [1, 0, 0, 0];
          const approach = a.v.reduce(
            (s, x, k) => s + (x - b.v[k]) * normal[k],
            0,
          );
          for (let k = 0; k < 4; k++) {
            a.p[k] -= (normal[k] * (sum - d)) / 2;
            b.p[k] += (normal[k] * (sum - d)) / 2;
            if (approach > 0) {
              a.v[k] -= approach * normal[k];
              b.v[k] += approach * normal[k];
            }
          }
        }
      // Pair corrections can penetrate a wall. Resolve walls after every pass.
      for (const b of balls)
        for (let k = 0; k < 4; k++) {
          const limit = ROOM - b.r;
          if (b.p[k] > limit) {
            b.p[k] = limit;
            if (b.v[k] > 0) b.v[k] *= -1;
          }
          if (b.p[k] < -limit) {
            b.p[k] = -limit;
            if (b.v[k] < 0) b.v[k] *= -1;
          }
        }
    }
  }
}
export function roomBalls(): Ball[] {
  return [
    { p: [-1.2, 0, 0, -0.8], v: [0.65, 0.22, 0.18, 0.6], r: 0.55 },
    { p: [1.2, 0.1, 0, 0.8], v: [-0.65, -0.22, -0.18, -0.6], r: 0.55 },
    { p: [0, 1.2, 0.3, 0], v: [0.3, -0.65, 0.35, 0.5], r: 0.5 },
    { p: [0, -1.2, -0.3, 0], v: [-0.3, 0.65, -0.35, -0.5], r: 0.5 },
  ];
}
