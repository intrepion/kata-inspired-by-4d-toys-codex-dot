# Delegated design specification
No interactive interview occurred. The user delegated all recommended choices. Grill with Docs was adapted by resolving the design tree explicitly:
- Experience → original title Elsewhere Atelier, dark teal observatory, amber/mint geometry, three scene cards.
- Representation → exact w sections by intersecting polytope edges; analytic ball slices; separately labeled orthographic whole-solid projections.
- Exploration → Shape study (tesseract, 5-cell, 16-cell), Sphere orchard (offset balls), Ball room (equal-mass translating 4D balls).
- Manipulation → orbit the 3D camera, drag selected toy at constant world z in x/y, keyboard/buttons for fourth-coordinate movement, all six rotation planes, slice sweep, reset, pause.
- Learning → scene-specific discoveries, live section point count and empty/tangent explanations.
- Persistence → validated versioned settings, explicit save, reload restores paused; failures reported, reset restores deterministic scene.
- Delivery → private GitHub repo, CI, independent standards/spec reviews, actual Mac Chrome controls, detached local server on inspected free port 5192.

Delegated test seams: geometry (known cube/ball sections and SO(4) invariants), ball-room step (4D equal-mass impulses, bounds, energy), settings parser (corrupt/untrusted state). TDD permission is covered by delegated implementation and testing decisions. Normal-control browser review covers each scene, view modes, rotations, drag, reset, repeated/pause flows and save/reload. Touch and VR hardware are not assumed available.

Acceptance: finite geometry at all boundaries; distinguish slice/projection in UI; no public deployment or paid services; accessible labeled controls, responsive layout; build/typecheck/domain tests/audit green; final pushed SHA exactly matches passing CI.
