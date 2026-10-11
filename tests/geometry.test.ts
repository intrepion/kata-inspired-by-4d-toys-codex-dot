import { describe, it, expect } from "vitest";
import { rotate, polytope, section, ballSection } from "../src/geometry";
describe("4D geometry public boundary", () => {
  it("a central unrotated tesseract section has eight cube corners", () => {
    const p = polytope("cube");
    const s = section(p.vertices, p.edges, 0);
    expect(s).toHaveLength(8);
    expect(s.every((v) => v.every((c) => Math.abs(c) === 1))).toBe(true);
  });
});
it("a quarter-turn in XW sends x into the fourth coordinate", () => {
  const r = rotate([1, 2, 3, 0], "XW", Math.PI / 2);
  expect(r[0]).toBeCloseTo(0);
  expect(r.slice(1)).toEqual([2, 3, 1]);
});
it("every plane preserves norm and reverses correctly", () => {
  for (const p of ["XW", "YW", "ZW", "XY", "XZ", "YZ"] as const) {
    const r = rotate([1, 2, 3, 4], p, 0.723);
    expect(r.reduce((s, x) => s + x * x, 0)).toBeCloseTo(30);
    rotate(r, p, -0.723).forEach((x, k) => expect(x).toBeCloseTo(k + 1));
  }
});
it("handles empty and coincident boundary cube sections", () => {
  const p = polytope("cube");
  expect(section(p.vertices, p.edges, 1)).toHaveLength(8);
  expect(section(p.vertices, p.edges, 1.01)).toEqual([]);
});
it("a 45 degree XW cube section is a wider rectangular box", () => {
  const p = polytope("cube");
  const s = section(
    p.vertices.map((v) => rotate(v, "XW", Math.PI / 4)),
    p.edges,
    0,
  );
  expect(s).toHaveLength(8);
  expect(Math.max(...s.map((v) => v[0]))).toBeCloseTo(Math.sqrt(2));
});
it("regular 5-cell has ten equal-length edges and a tetrahedral base slice", () => {
  const p = polytope("simplex");
  expect(p.edges).toHaveLength(10);
  for (const [i, j] of p.edges)
    expect(
      p.vertices[i].reduce((s, x, k) => s + (x - p.vertices[j][k]) ** 2, 0),
    ).toBeCloseTo(8);
  expect(section(p.vertices, p.edges, -1 / Math.sqrt(5))).toHaveLength(4);
});
it("16-cell central section is a six-vertex octahedron; tip is a point", () => {
  const p = polytope("cross");
  expect(p.edges).toHaveLength(24);
  expect(section(p.vertices, p.edges, 0)).toHaveLength(6);
  expect(section(p.vertices, p.edges, 1.7)).toHaveLength(1);
});
it("radius five ball at w=3 has radius four; tangent and beyond are explicit", () => {
  expect(ballSection([0, 0, 0, 0], 5, 3)?.radius).toBe(4);
  expect(ballSection([0, 0, 0, 0], 5, 5)?.radius).toBe(0);
  expect(ballSection([0, 0, 0, 0], 5, 5.01)).toBeNull();
});
