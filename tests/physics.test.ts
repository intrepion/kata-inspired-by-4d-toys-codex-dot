import { it, expect } from "vitest";
import { stepBalls, type Ball } from "../src/physics";
it("equal-mass head-on collision exchanges fourth-coordinate velocities", () => {
  const balls: Ball[] = [
    { p: [0, 0, 0, -0.5], v: [0, 0, 0, 1], r: 0.5 },
    { p: [0, 0, 0, 0.5], v: [0, 0, 0, -1], r: 0.5 },
  ];
  stepBalls(balls, 0.001);
  expect(balls[0].v[3]).toBeCloseTo(-1);
  expect(balls[1].v[3]).toBeCloseTo(1);
});
it("separated fourth-coordinate balls do not collide despite identical xyz", () => {
  const b: Ball[] = [
    { p: [0, 0, 0, -1], v: [1, 0, 0, 0], r: 0.3 },
    { p: [0, 0, 0, 1], v: [-1, 0, 0, 0], r: 0.3 },
  ];
  stepBalls(b, 0.01);
  expect(b[0].v[0]).toBe(1);
});
it("reflection works on all four boundaries", () => {
  for (let k = 0; k < 4; k++) {
    const p: [number, number, number, number] = [0, 0, 0, 0],
      v: [number, number, number, number] = [0, 0, 0, 0];
    p[k] = 2;
    v[k] = 1;
    const b = [{ p, v, r: 0.5 }];
    stepBalls(b, 0.01);
    expect(b[0].p[k]).toBeLessThanOrEqual(2);
    expect(b[0].v[k]).toBe(-1);
  }
});
it("coincident and interrupted states stay finite; zero-time pause does not move separated balls", () => {
  const b: Ball[] = [
    { p: [0, 0, 0, 0], v: [1, 0, 0, 0], r: 0.5 },
    { p: [0, 0, 0, 0], v: [-1, 0, 0, 0], r: 0.5 },
  ];
  stepBalls(b, 0.01);
  expect(b.flatMap((x) => [...x.p, ...x.v]).every(Number.isFinite)).toBe(true);
  const before = JSON.stringify(b);
  stepBalls(b, 0);
  expect(JSON.stringify(b)).toBe(before);
});
it("isolated oblique collision conserves total momentum and kinetic energy", () => {
  const b: Ball[] = [
    { p: [-0.3, -0.3, 0, 0], v: [1, 1, 0.3, 0.2], r: 0.5 },
    { p: [0.3, 0.3, 0, 0], v: [-1, -1, -0.1, -0.2], r: 0.5 },
  ];
  const energy = b.reduce((s, x) => s + x.v.reduce((n, y) => n + y * y, 0), 0);
  stepBalls(b, 0.001);
  expect(
    b.reduce((s, x) => s + x.v.reduce((n, y) => n + y * y, 0), 0),
  ).toBeCloseTo(energy);
  expect(b[0].v[2] + b[1].v[2]).toBeCloseTo(0.2);
});
it("overlap correction at a wall keeps every center inside its radius-dependent boundary", () => {
  const b: Ball[] = [
    { p: [1.94, 0, 0, 0], v: [0, 0, 0, 0], r: 0.55 },
    { p: [1.6, 0, 0, 0], v: [0, 0, 0, 0], r: 0.55 },
  ];
  stepBalls(b, 0.001);
  expect(
    b.every((x) => x.p.every((v) => Math.abs(v) <= 2.5 - x.r + 1e-9)),
  ).toBe(true);
});
