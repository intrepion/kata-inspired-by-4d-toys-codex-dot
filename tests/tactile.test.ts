import { it, expect } from "vitest";
import { stepBalls, GRAVITY_ROOM, type Ball } from "../src/physics";
import { GrabMotion } from "../src/grab";
it("gravity falls, bounces and settles on the visible y floor", () => {
  const b: Ball[] = [{p:[0,1,0,0],v:[0,0,0,0],r:.5}]; let bounced = false;
  for (let i=0;i<1200;i++) { stepBalls(b,1/120,-1,GRAVITY_ROOM); if(b[0].v[1]>.5)bounced=true; }
  expect(bounced).toBe(true); expect(b[0].p[1]).toBeCloseTo(-2,2); expect(Math.abs(b[0].v[1])).toBeLessThan(.2);
});
it("a live held sphere stays fixed while pushing and imparting motion to a neighbor", () => {
  const b: Ball[] = [{p:[-1,0,0,0],v:[0,0,0,0],r:.4},{p:[0,0,0,0],v:[0,0,0,0],r:.4}];
  const g=new GrabMotion();g.begin(b[0].p,0);g.move(b,0,[-.2,0,0,0],100,{});
  expect(b[0].p[0]).toBeCloseTo(-.2);expect(b[1].p[0]).toBeGreaterThan(.5);expect(b[1].v[0]).toBeGreaterThan(0);
  const y=b[1].p[1];stepBalls(b,.05,0,GRAVITY_ROOM);expect(b[0].p[1]).toBe(0);expect(b[1].p[1]).toBeLessThan(y);
});
it("release uses capped recent velocity, while idle release and cancellation cannot throw", () => {
  const b: Ball[]=[{p:[-1,0,0,0],v:[0,0,0,0],r:.4}];const g=new GrabMotion();
  g.begin(b[0].p,0);g.move(b,0,[1,0,0,0],10,{});expect(g.release(11)[0]).toBe(8);
  g.begin(b[0].p,20);g.move(b,0,[0,0,0,0],30,{});expect(g.release(31,true)).toEqual([0,0,0,0]);
  g.begin(b[0].p,40);g.move(b,0,[1,0,0,0],90,{});expect(g.release(300)).toEqual([0,0,0,0]);
});
it("dragging across a projected neighbor separated in w never pushes it", () => {
  const b: Ball[]=[{p:[-1,0,0,-1],v:[0,0,0,0],r:.4},{p:[0,0,0,1],v:[0,0,0,0],r:.4}];
  const g=new GrabMotion();g.begin(b[0].p,0);g.move(b,0,[1,0,0,-1],100,{});expect(b[1].p).toEqual([0,0,0,1]);
});
