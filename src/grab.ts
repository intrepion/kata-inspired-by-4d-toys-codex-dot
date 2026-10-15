import type { V4 } from "./geometry";
import { stepBalls, type Ball, type Dynamics } from "./physics";
/** Recent pointer-world samples, never DOM or event-clock dependent. */
export class GrabMotion {
  private samples: { p: V4; time: number }[] = [];
  begin(p: V4, time: number) { this.samples = [{ p: [...p], time }]; }
  move(balls: Ball[], held: number, p: V4, time: number, dynamics: Dynamics) {
    const ball = balls[held], from = [...ball.p];
    this.samples.push({ p: [...p], time });
    this.samples = this.samples.filter(s => time - s.time <= 120).slice(-16);
    ball.v = this.velocity(time);
    // Sweep a drag in small increments so a fast pointer cannot jump through a neighbor.
    const steps = Math.min(128, Math.max(1, Math.ceil(Math.hypot(...p.map((x, k) => x - from[k])) / (ball.r * 0.25))));
    for (let i = 1; i <= steps; i++) {
      ball.p = p.map((x, k) => from[k] + (x - from[k]) * i / steps) as V4;
      stepBalls(balls, 0, held, dynamics);
    }
  }
  velocity(now: number): V4 {
    const last = this.samples.at(-1), first = this.samples[0];
    if (!last || !first || now - last.time > 120 || last.time <= first.time) return [0, 0, 0, 0];
    const v = last.p.map((x, k) => (x - first.p[k]) / ((last.time - first.time) / 1000));
    const scale = Math.min(1, 8 / Math.max(0.0001, Math.hypot(...v)));
    return v.map(x => x * scale) as V4;
  }
  release(now: number, cancelled = false): V4 {
    const v = cancelled ? [0, 0, 0, 0] as V4 : this.velocity(now);
    this.samples = [];
    return v;
  }
}
