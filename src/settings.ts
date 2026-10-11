import type { Plane, Shape } from "./geometry";
export type SceneId = "study" | "orchard" | "room";
export type Settings = {
  version: 1;
  scene: SceneId;
  shape: Shape;
  mode: "slice" | "projection";
  slice: number;
  angles: Record<Plane, number>;
  offset: number;
};
export const defaults = (): Settings => ({
  version: 1,
  scene: "study",
  shape: "cube",
  mode: "slice",
  slice: 0,
  angles: { XW: 0, YW: 0, ZW: 0, XY: 0, XZ: 0, YZ: 0 },
  offset: 0,
});
export const KEY = "elsewhere-atelier-v1";
export function parseSettings(raw: string | null): Settings {
  const d = defaults();
  try {
    const s = JSON.parse(raw ?? "null");
    if (!s || s.version !== 1) return d;
    if (["study", "orchard", "room"].includes(s.scene)) d.scene = s.scene;
    if (["cube", "simplex", "cross"].includes(s.shape)) d.shape = s.shape;
    if (["slice", "projection"].includes(s.mode)) d.mode = s.mode;
    if (Number.isFinite(s.slice)) d.slice = Math.max(-3, Math.min(3, s.slice));
    if (Number.isFinite(s.offset))
      d.offset = Math.max(-2, Math.min(2, s.offset));
    for (const p of Object.keys(d.angles) as Plane[])
      if (Number.isFinite(s.angles?.[p]))
        d.angles[p] = Math.max(-Math.PI, Math.min(Math.PI, s.angles[p]));
  } catch {
    /* Untrusted local storage is optional. */
  }
  return d;
}
