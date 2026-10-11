import { it, expect } from "vitest";
import { parseSettings } from "../src/settings";
it("malformed settings safely restore defaults", () => {
  expect(parseSettings("{bad").scene).toBe("study");
  expect(
    parseSettings('{"version":1,"slice":1e999,"scene":"evil"}').slice,
  ).toBe(0);
});
it("restores supported settings while clamping numerical controls", () => {
  const s = parseSettings(
    JSON.stringify({
      version: 1,
      scene: "orchard",
      mode: "projection",
      shape: "cross",
      slice: 99,
      offset: -99,
      angles: { XW: 0.5, YW: "bad" },
    }),
  );
  expect(s.scene).toBe("orchard");
  expect(s.slice).toBe(3);
  expect(s.offset).toBe(-2);
  expect(s.angles.XW).toBe(0.5);
  expect(s.angles.YW).toBe(0);
});
it("unknown versions restore defaults", () =>
  expect(parseSettings('{"version":2,"scene":"room"}').scene).toBe("study"));
