import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import {
  polytope,
  section,
  ballSection,
  orient,
  planes,
  type Plane,
  type V4,
  type V3,
  type Shape,
} from "./geometry";
import { roomBalls, stepBalls, GRAVITY_ROOM, type Ball, ROOM } from "./physics";
import { GrabMotion } from "./grab";
import { defaults, parseSettings, KEY, type SceneId } from "./settings";
import "./style.css";
const scenes = {
  study: {
    title: "The shape study",
    eyebrow: "01 / SOLIDS & SECTIONS",
    description:
      "A solid from somewhere else. Turn it through a plane you cannot see.",
    tip: "Try XW = 45° at w = 0. The cube section widens to √2 along x. Switch to the 16-cell: its central slice is an octahedron.",
  },
  orchard: {
    title: "The sphere orchard",
    eyebrow: "02 / HIDDEN NEIGHBORS",
    description:
      "Three fruits at different fourth-coordinate depths. Find where each one lives.",
    tip: "Sweep w from −2 to +2. Each fruit grows, then shrinks to a point. Projection shows every fruit at once, even when their slices are absent.",
  },
  room: {
    title: "The ball room",
    eyebrow: "03 / MOTION IN FOUR DIMENSIONS",
    description:
      "Set four little worlds in motion. Some collisions happen beyond your view.",
    tip: "Press Play, then sweep w. Balls can share the same xyz view without touching, because distance also includes w. Grab while playing to push and throw. Gravity play falls along y; Inertia lab keeps the elastic zero-gravity experiment.",
  },
};
let state = parseSettings(readSave()),
  paused = true,
  sweeping = false,
  selected = 0,
  balls: Ball[] = [],
  dragging = false,
  gravityRoom = true;
const grab = new GrabMotion();
let dragPointer = -1, liveDrag = false;
function readSave() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<header><a class="brand" href="./"><span class="brand-mark">✳</span> elsewhere<span class="brand-tail">atelier</span></a><span class="header-note">A PLAYGROUND IN FOUR SPATIAL DIMENSIONS</span><button id="save">Save settings</button></header>
<main><aside class="scene-rail"><span class="kicker">THE COLLECTION</span>${Object.entries(
  scenes,
)
  .map(
    ([id, s]) =>
      `<button class="scene-card" data-scene="${id}"><span class="scene-number">${s.eyebrow.split(" / ")[0]}</span><strong>${s.title}</strong><span>${id === "study" ? "Turn a solid inside your world" : id === "orchard" ? "Discover what hides between slices" : "Give the fourth dimension a nudge"}</span><span class="card-art ${id}" aria-hidden="true">${id === "study" ? "◇" : id === "orchard" ? "◌ ◯ ◌" : "○ ↗"}</span></button>`,
  )
  .join(
    "",
  )}<div class="rail-foot"><span class="tiny-dot"></span> No finish line. Just a new way to see.</div></aside>
<section class="play"><div class="intro"><span id="eyebrow" class="kicker"></span><h1 id="title"></h1><p id="description"></p></div><div id="viewport"><div class="view-label"><span class="tiny-dot"></span><span id="view-name"></span></div><div class="axis-legend">x <span>y</span> z <b>+ w</b></div><div id="empty" hidden><strong>Just beyond your world.</strong><p>This slice is empty. Move w back toward the object.</p></div><div class="canvas-hint">Drag a toy to move it · Drag empty space to orbit · Scroll to zoom</div></div><div class="stage-footer"><span id="stats"></span><div><button id="capture">Download view</button><button id="home">Recenter camera</button></div></div><div class="discovery"><span>✧</span><div><strong>A small discovery</strong><p id="tip"></p></div></div></section>
<aside class="tools"><span class="kicker">YOUR WINDOW INTO 4D</span><div class="segmented"><button id="slice-mode">3D slice</button><button id="projection-mode">Projection</button></div><p id="mode-explainer" class="explain"></p>
<label class="control-label" for="slice">Fourth-coordinate slice <output id="slice-value"></output></label><input id="slice" type="range" min="-3" max="3" step="0.01"><div class="range-ends"><span>−3 / elsewhere</span><span>+3 / elsewhere</span></div><button class="wide" id="sweep">Sweep through w</button>
<div class="divider"></div><div id="shape-wrap"><label for="shape">Choose a solid</label><select id="shape"><option value="cube">Tesseract · 8 cubical cells</option><option value="simplex">5-cell · 5 tetrahedral cells</option><option value="cross">16-cell · 16 tetrahedral cells</option></select></div><div id="ball-wrap"><label for="toy">Selected toy</label><select id="toy"></select></div>
<div id="rotation-wrap"><div class="control-label">Plane rotations <span class="unit">degrees</span></div>${Object.keys(
  planes,
)
  .map(
    (p) =>
      `<label class="rotation" for="angle-${p}"><span>${p}</span><input id="angle-${p}" type="range" min="-180" max="180" step="1"><output id="value-${p}">0°</output></label>`,
  )
  .join("")}</div>
<label class="control-label" for="offset">Move selected toy in w <output id="offset-value"></output></label><input id="offset" type="range" min="-2" max="2" step="0.01"><div class="button-pair"><button id="minus">w − 0.2</button><button id="plus">w + 0.2</button></div><div class="nudge-controls" aria-label="Move selected toy in x and y"><button id="x-minus">x −</button><button id="x-plus">x +</button><button id="y-minus">y −</button><button id="y-plus">y +</button></div><div id="dynamics-wrap"><label for="dynamics">Ball-room dynamics</label><select id="dynamics"><option value="gravity">Gravity play</option><option value="inertia">Inertia lab</option></select></div><div class="button-pair actions"><button id="pause">Play motion</button><button id="reset">Reset scene</button></div><p id="physics-note" class="explain"></p><p id="status" role="status" aria-live="polite">Saved view settings loaded (or defaults). Motion starts paused.</p></aside></main><footer><span>ELSEWHERE ATELIER</span><span>The fourth dimension is space, just like x, y and z.</span><a href="https://4dtoys.com/" target="_blank" rel="noreferrer">Inspired by the curiosity of 4D Toys ↗</a></footer>`;
function el<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T;
}
function status(s: string) {
  el("status").textContent = s;
}
const viewport = el("viewport");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x0b171d, 0);
viewport.prepend(renderer.domElement);
renderer.domElement.setAttribute(
  "aria-label",
  "Interactive 3D view of four-dimensional objects",
);
const world = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(6, 4.5, 7.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 4;
controls.maxDistance = 22;
controls.target.set(0, 0, 0);
world.add(new THREE.HemisphereLight(0xd9fff1, 0x213348, 2.5));
const light = new THREE.DirectionalLight(0xffd39d, 3);
light.position.set(3, 6, 4);
world.add(light);
const floor = new THREE.GridHelper(12, 24, 0x47615c, 0x1c3338);
floor.position.y = -2.7;
world.add(floor);
const roomOutline = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(5, 5, 5)),
  new THREE.LineBasicMaterial({
    color: 0x51736f,
    transparent: true,
    opacity: 0.45,
  }),
);
world.add(roomOutline);
const toys = new THREE.Group();
world.add(toys);
const colors = [0x75e2c0, 0xffc078, 0xa5a6ff, 0xff879e];
function resize() {
  const r = viewport.getBoundingClientRect();
  renderer.setSize(r.width, r.height);
  camera.aspect = r.width / r.height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport);
function clearToys() {
  for (const c of [...toys.children]) {
    c.traverse((o) => {
      if (
        !o.userData.shared &&
        (o instanceof THREE.Mesh ||
          o instanceof THREE.LineSegments ||
          o instanceof THREE.Points)
      ) {
        o.geometry.dispose();
        const m = o.material;
        (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
      }
    });
    toys.remove(c);
  }
}
function material(color: number) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.12,
    transparent: true,
    opacity: state.mode === "projection" ? 0.35 : 0.72,
    side: THREE.DoubleSide,
  });
}
// Convex hull only for full-dimensional sections; tangent points/edges/faces use primitives.
function fullRank(points: THREE.Vector3[]) {
  if (points.length < 4) return false;
  const a = points[0];
  for (let i = 1; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++)
      for (let k = j + 1; k < points.length; k++)
        if (
          Math.abs(
            new THREE.Vector3()
              .subVectors(points[i], a)
              .cross(new THREE.Vector3().subVectors(points[j], a))
              .dot(new THREE.Vector3().subVectors(points[k], a)),
          ) > 1e-8
        )
          return true;
  return false;
}
function polyMesh(points: V3[], color: number) {
  const vectors = points.map((p) => new THREE.Vector3(...p));
  const group = new THREE.Group();
  if (fullRank(vectors)) {
    const geo = new ConvexGeometry(vectors);
    group.add(new THREE.Mesh(geo, material(color)));
    group.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(geo, 10),
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.95,
        }),
      ),
    );
  } else if (points.length > 1) {
    const lines: number[] = [];
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++)
        lines.push(...points[i], ...points[j]);
    group.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry().setAttribute(
          "position",
          new THREE.Float32BufferAttribute(lines, 3),
        ),
        new THREE.LineBasicMaterial({ color }),
      ),
    );
  }
  for (const p of points) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 8, 6),
      new THREE.MeshBasicMaterial({ color }),
    );
    dot.position.set(...p);
    group.add(dot);
  }
  return group;
}
function ballWire(radius: number) {
  const source = new THREE.SphereGeometry(radius, 12, 8);
  const wire = new THREE.WireframeGeometry(source);
  source.dispose();
  return wire;
}
function orchardBalls(): Ball[] {
  return [
    { p: [-1.25, 0.2, 0, -1.1], v: [0, 0, 0, 0], r: 0.85 },
    { p: [0, 0.1, 0.2, 0], v: [0, 0, 0, 0], r: 1 },
    { p: [1.35, 0.3, -0.2, 1.1], v: [0, 0, 0, 0], r: 0.85 },
  ];
}
function setupScene() {
  endDrag(true);
  balls = state.scene === "room" ? roomBalls() : orchardBalls();
  selected = 0;
  paused = true;
  sweeping = false;
  dragging = false;
  controls.enabled = true;
  state.offset = state.scene === "study" ? state.offset : 0;
  sync();
  renderToys();
}
function sync() {
  roomOutline.visible = state.scene === "room";
  const s = scenes[state.scene];
  el("title").textContent = s.title;
  el("eyebrow").textContent = s.eyebrow;
  el("description").textContent = s.description;
  el("tip").textContent = s.tip;
  document.querySelectorAll<HTMLButtonElement>("[data-scene]").forEach((b) => {
    const on = b.dataset.scene === state.scene;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
  const projection = state.mode === "projection";
  el("view-name").textContent = projection
    ? "ORTHOGRAPHIC 4D → 3D PROJECTION"
    : `3D CROSS-SECTION · w = ${state.slice.toFixed(2)}`;
  el("mode-explainer").textContent = projection
    ? "The whole object, with w dropped. Overlap here does not imply a 4D collision. The 3D camera still has perspective."
    : "Only the part crossing w = s. Like cutting a fruit, a different depth reveals a different solid.";
  for (const mode of ["slice", "projection"]) {
    const b = el<HTMLButtonElement>(mode + "-mode");
    b.classList.toggle("active", mode === state.mode);
    b.setAttribute("aria-pressed", String(mode === state.mode));
  }
  el<HTMLInputElement>("slice").value = String(state.slice);
  el<HTMLInputElement>("slice").disabled = projection;
  el("slice-value").textContent = state.slice.toFixed(2);
  el<HTMLButtonElement>("sweep").disabled = projection;
  el("sweep").textContent = sweeping ? "Stop sweep" : "Sweep through w";
  el("shape-wrap").hidden = state.scene !== "study";
  el("rotation-wrap").hidden = state.scene !== "study";
  el("ball-wrap").hidden = state.scene === "study";
  el<HTMLSelectElement>("shape").value = state.shape;
  const toy = el<HTMLSelectElement>("toy");
  if (toy.options.length !== balls.length)
    toy.innerHTML = balls
      .map((_, i) => `<option value="${i}">Toy ${i + 1}</option>`)
      .join("");
  toy.value = String(selected);
  for (const p of Object.keys(planes) as Plane[]) {
    const a = Math.round((state.angles[p] * 180) / Math.PI);
    el<HTMLInputElement>("angle-" + p).value = String(a);
    el("value-" + p).textContent = a + "°";
  }
  const offset =
    state.scene === "study" ? state.offset : (balls[selected]?.p[3] ?? 0);
  el<HTMLInputElement>("offset").max = String(
    state.scene === "room" ? Math.min(2, ROOM - balls[selected].r) : 2,
  );
  el<HTMLInputElement>("offset").min = String(
    state.scene === "room" ? -Math.min(2, ROOM - balls[selected].r) : -2,
  );
  el<HTMLInputElement>("offset").value = String(offset);
  el("offset-value").textContent = offset.toFixed(2);
  el("dynamics-wrap").hidden = state.scene !== "room";
  el<HTMLSelectElement>("dynamics").value = gravityRoom ? "gravity" : "inertia";
  el<HTMLButtonElement>("pause").disabled = state.scene !== "room";
  el("pause").textContent = paused ? "Play motion" : "Pause motion";
  el("physics-note").textContent =
    state.scene === "room"
      ? gravityRoom
        ? "Gravity along y, damped 4D sphere contacts. Grab during play to push; release while moving to throw. Other balls keep moving. No angular or polytope solver."
        : "Elastic zero-gravity 4D spheres. Live grab/push/throw also works here. Shapes in the study remain kinematic."
      : "Object movement is kinematic. Rotation sliders change the solid in 4D; orbiting changes only your 3D view.";
}
function renderToys() {
  clearToys();
  let count = 0,
    detail = "";
  if (state.scene === "study") {
    const p = polytope(state.shape),
      v = p.vertices.map((v) => {
        const r = orient(v, state.angles);
        r[3] += state.offset;
        return r;
      });
    const points =
      state.mode === "slice"
        ? section(v, p.edges, state.slice)
        : v.map((p) => p.slice(0, 3) as V3);
    if (points.length) {
      const g = polyMesh(points, colors[0]);
      g.userData.toy = 0;
      g.position.copy(studyXY);
      toys.add(g);
      count = 1;
    }
    detail = `${points.length} ${state.mode === "slice" ? "section" : "projected"} vertices${points.length === 1 ? " · tangent point" : ""}`;
  } else {
    let tangents = 0;
    balls.forEach((b, i) => {
      const slice =
        state.mode === "slice"
          ? ballSection(b.p, b.r, state.slice)
          : { center: b.p.slice(0, 3) as V3, radius: b.r };
      if (!slice) return;
      const visual = ballVisuals[i];
      visual.group.position.set(...slice.center);
      visual.group.userData.toy = i;
      visual.mesh.visible = slice.radius > 0;
      visual.wire.visible = slice.radius > 0;
      visual.marker.visible = slice.radius === 0;
      visual.mesh.scale.setScalar(slice.radius);
      visual.wire.scale.setScalar(slice.radius);
      visual.material.opacity = state.mode === "projection" ? 0.35 : 0.72;
      visual.wireMaterial.opacity = i === selected ? 0.2 : 0.05;
      if (slice.radius === 0) tangents++;
      toys.add(visual.group);
      count++;
    });
    detail = `${count} of ${balls.length} toys visible · selected w = ${balls[selected].p[3].toFixed(2)}${tangents ? " · " + tangents + " tangent point marker(s)" : ""}`;
    const w = balls[selected].p[3];
    el("offset-value").textContent = w.toFixed(2);
    el<HTMLInputElement>("offset").value = String(w);
  }

  el("empty").hidden = count !== 0;
  el("stats").textContent = detail;
  el("view-name").textContent =
    state.mode === "slice"
      ? `3D CROSS-SECTION · w = ${state.slice.toFixed(2)}`
      : "ORTHOGRAPHIC 4D → 3D PROJECTION";
  el("slice-value").textContent = state.slice.toFixed(2);
}
const studyXY = new THREE.Vector3();
const unitSphere = new THREE.SphereGeometry(1, 32, 24),
  unitWire = ballWire(1),
  pointGeometry = new THREE.OctahedronGeometry(0.035);
const ballVisuals = colors.map((color) => {
  const group = new THREE.Group(),
    mat = material(color),
    wireMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.2,
    });
  const mesh = new THREE.Mesh(unitSphere, mat),
    wire = new THREE.LineSegments(unitWire, wireMat),
    marker = new THREE.Mesh(
      pointGeometry,
      new THREE.MeshBasicMaterial({ color }),
    );
  for (const o of [mesh, wire, marker]) o.userData.shared = true;
  group.add(mesh, wire, marker);
  return { group, mesh, wire, marker, material: mat, wireMaterial: wireMat };
});
function nudge(axis: 0 | 1, amount: number) {
  endDrag(true);
  paused = true;
  if (state.scene === "study") {
    if (axis === 0)
      studyXY.x = THREE.MathUtils.clamp(studyXY.x + amount, -3, 3);
    else studyXY.y = THREE.MathUtils.clamp(studyXY.y + amount, -3, 3);
  } else {
    const b = balls[selected],
      limit = state.scene === "room" ? ROOM - b.r : 3;
    b.p[axis] = THREE.MathUtils.clamp(b.p[axis] + amount, -limit, limit);
    b.v = [0, 0, 0, 0];
  }
  sync();
  renderToys();
  status(
    "Moved selected toy in " + (axis === 0 ? "x" : "y") + ". Motion paused.",
  );
}
for (const axis of ["x", "y"] as const)
  for (const direction of ["minus", "plus"] as const)
    el(axis + "-" + direction).onclick = () =>
      nudge(axis === "x" ? 0 : 1, direction === "minus" ? -0.2 : 0.2);

for (const b of document.querySelectorAll<HTMLButtonElement>("[data-scene]"))
  b.onclick = () => {
    state.scene = b.dataset.scene as SceneId;
    state.slice = 0;
    state.offset = 0;
    studyXY.set(0, 0, 0);
    setupScene();
    status("Scene opened. Motion is paused.");
  };
for (const mode of ["slice", "projection"] as const)
  el(mode + "-mode").onclick = () => {
    state.mode = mode;
    sweeping = false;
    sync();
    renderToys();
  };
el<HTMLInputElement>("slice").oninput = (e) => {
  state.slice = Number((e.target as HTMLInputElement).value);
  sweeping = false;
  sync();
  renderToys();
};
el("sweep").onclick = () => {
  sweeping = !sweeping;
  sync();
};
el<HTMLSelectElement>("shape").onchange = (e) => {
  state.shape = (e.target as HTMLSelectElement).value as Shape;
  renderToys();
};
for (const p of Object.keys(planes) as Plane[])
  el<HTMLInputElement>("angle-" + p).oninput = (e) => {
    state.angles[p] =
      (Number((e.target as HTMLInputElement).value) * Math.PI) / 180;
    sync();
    renderToys();
  };
el<HTMLSelectElement>("toy").onchange = (e) => {
  endDrag(true);
  selected = Number((e.target as HTMLSelectElement).value);
  sync();
  renderToys();
};
function moveW(w: number) {
  endDrag(true);
  const limit =
    state.scene === "room" ? Math.min(2, ROOM - balls[selected].r) : 2;
  w = Math.max(-limit, Math.min(limit, w));
  if (state.scene === "study") state.offset = w;
  else {
    paused = true;
    balls[selected].p[3] = w;
    balls[selected].v = [0, 0, 0, 0];
  }
  sync();
  renderToys();
}
el<HTMLInputElement>("offset").oninput = (e) =>
  moveW(Number((e.target as HTMLInputElement).value));
el("minus").onclick = () =>
  moveW((state.scene === "study" ? state.offset : balls[selected].p[3]) - 0.2);
el("plus").onclick = () =>
  moveW((state.scene === "study" ? state.offset : balls[selected].p[3]) + 0.2);
el<HTMLSelectElement>("dynamics").onchange = (e) => {
  endDrag(true);
  gravityRoom = (e.target as HTMLSelectElement).value === "gravity";
  setupScene();
  status("Dynamics changed. Press Play, then grab and release a ball. Study settings are unchanged.");
};
el("pause").onclick = () => {
  endDrag(true);
  paused = !paused;
  sync();
  status(
    paused
      ? "Motion paused. Grab a ball or move through w."
      : "Motion playing in four spatial dimensions.",
  );
};
el("reset").onclick = () => {
  state = { ...defaults(), scene: state.scene };
  studyXY.set(0, 0, 0);
  setupScene();
  status("Scene reset. Save to replace your stored settings.");
};
el("home").onclick = () => {
  camera.position.set(6, 4.5, 7.5);
  controls.target.set(0, 0, 0);
  controls.update();
};
el("capture").onclick = () => {
  renderer.render(world, camera);
  const source = renderer.domElement,
    canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height + 150;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#0b141b";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 100);
  context.fillStyle = "#def2e6";
  context.font = "32px Georgia";
  context.fillText("Elsewhere Atelier · " + scenes[state.scene].title, 30, 45);
  context.fillStyle = "#8ddcbe";
  context.font = "16px sans-serif";
  context.fillText(el("view-name").textContent ?? "", 30, 77);
  context.fillStyle = "#a7c2b6";
  context.font = "14px sans-serif";
  context.fillText(el("stats").textContent ?? "", 30, canvas.height - 20);
  const a = document.createElement("a");
  a.download = "elsewhere-" + state.scene + ".png";
  a.href = canvas.toDataURL("image/png");
  a.click();
  status("View downloaded as a PNG.");
};
el("save").onclick = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    status(
      "Settings saved. Reload restores this scene and controls, paused. Toy positions are not saved.",
    );
  } catch {
    status(
      "Storage unavailable. Your session still works; settings could not be saved.",
    );
  }
};
const ray = new THREE.Raycaster(),
  pointer = new THREE.Vector2(),
  dragPlane = new THREE.Plane(),
  grabOffset = new THREE.Vector3();
function point(e: PointerEvent) {
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    (-(e.clientY - r.top) / r.height) * 2 + 1,
  );
  ray.setFromCamera(pointer, camera);
}
renderer.domElement.addEventListener(
  "pointerdown",
  (e) => {
    if (e.button !== 0 || dragging) return;
    point(e);
    const hits = ray.intersectObjects(toys.children, true);
    let target: THREE.Object3D | undefined = hits[0]?.object;
    while (target && target.userData.toy === undefined)
      target = target.parent ?? undefined;
    if (!target) return;
    selected = target.userData.toy;
    liveDrag = state.scene === "room" && !paused;
    if (state.scene !== "room") paused = true;
    dragging = true;
    dragPointer = e.pointerId;
    if (state.scene !== "study") {
      balls[selected].v = [0, 0, 0, 0];
      grab.begin(balls[selected].p, performance.now());
    }
    controls.enabled = false;
    renderer.domElement.setPointerCapture(e.pointerId);
    const pos =
      state.scene === "study"
        ? studyXY
        : new THREE.Vector3(...(balls[selected].p.slice(0, 3) as V3));
    dragPlane.set(new THREE.Vector3(0, 0, 1), -pos.z);
    const hit = ray.ray.intersectPlane(dragPlane, new THREE.Vector3());
    if (hit) grabOffset.copy(pos).sub(hit);
    sync();
  },
  true,
);
renderer.domElement.addEventListener("pointermove", (e) => {
  if (!dragging || e.pointerId !== dragPointer) return;
  point(e);
  const hit = ray.ray.intersectPlane(dragPlane, new THREE.Vector3());
  if (!hit) return;
  hit.add(grabOffset);
  const limit = state.scene === "room" ? ROOM - balls[selected].r : 3;
  hit.x = THREE.MathUtils.clamp(hit.x, -limit, limit);
  hit.y = THREE.MathUtils.clamp(hit.y, -limit, limit);
  if (state.scene === "study") studyXY.set(hit.x, hit.y, 0);
  else {
    if (state.scene === "room") {
      const b = balls[selected];
      grab.move(balls, selected, [hit.x, hit.y, b.p[2], b.p[3]], performance.now(), gravityRoom ? GRAVITY_ROOM : {});
    } else {
      balls[selected].p[0] = hit.x;
      balls[selected].p[1] = hit.y;
      balls[selected].v = [0, 0, 0, 0];
    }
  }
  renderToys();
});
function endDrag(cancelled = false) {
  if (dragging && state.scene === "room") {
    balls[selected].v = grab.release(performance.now(), cancelled || !liveDrag);
    status(cancelled ? "Grab cancelled. No throw." : liveDrag ? "Released into live 4D motion." : "Released. Press Play to move the room.");
  }
  dragging = false;
  liveDrag = false;
  dragPointer = -1;
  controls.enabled = true;
}
renderer.domElement.addEventListener("pointerup", (e) => { if (e.pointerId === dragPointer) endDrag(); });
renderer.domElement.addEventListener("pointercancel", () => endDrag(true));
renderer.domElement.addEventListener("lostpointercapture", () => endDrag(true));
window.addEventListener("blur", () => {
  paused = true;
  sweeping = false;
  endDrag(true);
  sync();
  status("Motion and sweep paused after leaving the playground.");
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    paused = true;
    sweeping = false;
    endDrag(true);
    sync();
    status("Motion and sweep paused while this tab is hidden.");
  }
});
window.addEventListener("keydown", (e) => {
  if ((e.target as HTMLElement).matches("input,select,button")) return;
  if (e.code === "Space" && state.scene === "room") {
    e.preventDefault();
    endDrag(true);
    paused = !paused;
    sync();
    status(paused ? "Motion paused." : "Motion playing in four spatial dimensions.");
  }
  if (e.key === "[") el("minus").click();
  if (e.key === "]") el("plus").click();
});
setupScene();
resize();
let last = performance.now(),
  sweepDirection = 1;
function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  let dirty = false;
  if (sweeping) {
    state.slice += dt * 0.65 * sweepDirection;
    if (Math.abs(state.slice) >= 3) {
      state.slice = Math.sign(state.slice) * 3;
      sweepDirection *= -1;
    }
    el<HTMLInputElement>("slice").value = String(state.slice);
    dirty = true;
  }
  if (state.scene === "room" && !paused) {
    if (dragging) balls[selected].v = grab.velocity(now);
    stepBalls(balls, dt, dragging ? selected : -1, gravityRoom ? GRAVITY_ROOM : {});
    dirty = true;
  }
  if (dirty) renderToys();
  controls.update();
  renderer.render(world, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
