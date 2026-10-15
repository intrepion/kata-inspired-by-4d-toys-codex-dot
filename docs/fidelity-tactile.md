# Tactile sphere-room correction

Primary research, 2026-10-15: [Marc ten Bosch’s creator page](https://4dtoys.com/) describes grabbed physical objects, poking/throwing/rolling, gravity play and a 3D section slider through genuinely 4D bodies. This change targets the physical manipulation loop. It does not claim the creator’s general angular/polytope engine or original numerical feel.

Recommended default: Gravity play in the existing ball room; preserve study/orchard and offer Inertia lab. Live held bodies have zero inverse mass and collide with dynamic spheres. Timestamped world-position samples produce a capped release impulse; idle/cancel/blur releases produce no impulse. Drag movement is swept in small spatial increments, and collision distance still includes w. No runtime toy positions were saved before; existing settings parsing/key are untouched.

`src/physics.ts` owns gravity/contact; `src/grab.ts` is the DOM-free manipulation seam; `src/main.ts` owns pointer capture and mode selection. Existing six geometry/elastic fixtures remain; new tests cover settling, live push, bounded release, cancel/idle release and projected overlap separated in w.

Checks: actual-repository `npm run check` passed on 2026-10-15: strict typecheck, 21/21 tests and production build. The bundle-size advisory remains. All independent reviews closed. Focused native acceptance completed in an isolated QA origin; see central evidence below.

Native acceptance route: open ball room → Play → watch a fall/bounce → drag a visible ball into another while others move → release a lateral throw → change w to hide/reveal it → choose Inertia lab and observe free drift → return to study/rotate XW → save/reload existing settings. Also cancel a grab/blur and verify no throw. Use ordinary pointer/keyboard controls, no state injection.

Remaining limits: spheres only, translation only, fixed-z drag plane, no arbitrary oriented solids/frictional rolling or VR/touch hardware QA. No commits or pushes.

Native acceptance (2026-10-15): Gravity settling; live grab/release/throw; w hide/reveal; inertial drift; study XW 45° save/reload. Camera: Orbitable perspective 3D with 4D slice/projection. Controls: Drag toy/orbit, w sliders, Play/Pause, Gravity/Inertia. Central evidence: [native acceptance](LOCAL_ACCEPTANCE_2026-10-15.md) (screenshots alongside). Limit: Individual hidden 4D contact impulse and cancel safety remain unit evidence; native contact arrangement was visually ambiguous. Existing localhost/127-origin saves were untouched; test progress was isolated at `http://fidelity-qa-20261015.localhost:5192/`.
