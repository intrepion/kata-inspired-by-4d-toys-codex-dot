# Verification evidence
2026-10-11; local production preview in the user's installed Mac Chrome at http://127.0.0.1:5192 . All gameplay actions used native buttons, selects, keyboard slider input, or pointer drag; no hidden application state was injected.

## Numerical/tool gates
17 Vitest tests cover central/boundary/empty tesseract sections, the independently known 45° XW section width √2, quarter-turn coordinates, distance preservation and reversibility of all six planes, regular simplex edge lengths, 16-cell octahedral and tangent sections, 3–4–5 ball-section radius, fourth-coordinate ball collisions and separation, reflection on each of four boundaries, zero-time/degenerate stability, isolated elastic energy/momentum, overlap correction at a wall, corrupt/versioned/clamped settings.
Type checking, production build and `git diff --check` pass. `npm audit --audit-level=moderate` reports zero vulnerabilities after upgrading the initial vulnerable Vitest tooling. The Three.js bundle is roughly 139 kB gzip; Vite emits a >500 kB uncompressed chunk advisory, not a build error.

## Actual Chrome observations
- All three scenes opened and were visibly rendered; screenshots inspected.
- Shape study: central tesseract showed 8 cube vertices; XW 45° visibly widened its section. All six sliders exercised. 16-cell central section showed 6 octahedral vertices; 5-cell central section showed a tetrahedron. Projection showed 5 projected 5-cell vertices and disabled slicing controls.
- Empty slice at w = 3 displayed explanation and zero vertices. Orchard at w = 1 displayed a labeled tangent marker plus the neighboring non-tangent ball; point marker screenshot inspected.
- Orchard projection showed all three balls; slice w = 0 showed one. Toy selection and x/y/w buttons worked. A native pointer drag moved the visible purple toy right/up at constant w and selected Toy 3. Sweep advanced w and stopped using its control.
- Save/reload preserved the orchard and slice value (0.22), paused; toy positions and selection intentionally reset. Reset restored deterministic scene settings; repeated resets and repeated play/pause did not break state. Reset during a sweep stopped it.
- Ball room Play advanced ball positions and selected w. Pause stopped it; fourth-coordinate movement at its upper limit stopped at 1.95 for radius 0.55. Projection overlaps were visibly possible, with explicit physical explanation.
- A real native Chrome tab switch paused running motion after temporarily disabling debugger focus emulation. Automation focus emulation otherwise masks page visibility. The temporary emulation override was restored after testing. Pointer cancel/lost-capture cleanup was source reviewed; hardware cancel gestures were not physically tested.
- Narrow responsive layout: requested 390×844 override, measured 375 px content width with matching scrollWidth (no horizontal overflow), screenshot inspected and controls exercised. An additional tablet override was inspected, and overrides were reset. Desktop layout was inspected at the normal viewport.
- Camera recenter, empty-space orbit and scroll zoom checked in the final browser pass. Screenshot view download produced the actual Chrome file `elsewhere-study.png`, copied to docs/screenshots/tesseract-xw45.png and visually inspected. This is a rendered scene export, not a full browser-chrome screenshot.
- No application-origin console errors were observed. Warnings from an existing Chrome wallet extension were unrelated to this app.

## Delivery and limits
The loopback preview uses a session-only detached Python subprocess launcher with stdin detached and a new session. HTTP 200 and Chrome rendering were verified after the launching command exited. No launch agent, login item, security change, paid service, or public deployment. Prior servers/repositories remain untouched. Final remote SHA/CI are verified at handoff.

Mouse and keyboard were exercised. Physical touch hardware, VR, accelerometers, WebGL context loss, and automatic browser background throttling on uninstrumented hardware remain untested. Physics limitations and saved-settings boundaries are in README and ADR. No Codex sidebar registration is claimed.
