# 4D Toys focused native acceptance

2026-10-15, actual Mac Chrome/intrepion, new dedicated QA tab222225542, isolated http://fidelity-qa-20261015.localhost:5192/ origin. Root/Witness/user tabs untouched. Native CUA visible controls only; no model injection, JavaScript evaluation or synthetic DOM events. Final reviewed production build; actual21 tests/typecheck/build pass.

Camera: orbitable perspective 3D viewport with 3D-section / orthographic4D-to3D projection switch. Controls: drag toy to grab/move/release, drag empty space to orbit, visible w sliders and dynamics selector, Play/Pause/Reset.

Observed route: opened ball room(default Gravity play), switched Projection to see4toys, Play. Toys moved down and settled; dragging a purple toy upward during play selectedToy3 and showed `Released into live 4D motion`, with other toys still changing position. The released toy continued beyond the pointer destination before falling again. Native visible toy/w controls aligned Toy1/Toy2 atw0, then live yellow drag crossed the red toy's projected position and rearranged/occluded the projected bodies while play remained active. This verifies tactile input routing and coupled room behavior; it does not quantify an individual hidden4D collision impulse.

Pause and selected-toyw1.95 produced `0 of4 toys visible` and `Just beyond your world`; moving selectedwback0 revealed it. Inertia lab rebuilt a paused room and Play produced free drift with all4projected toys, distinct from gravity settling. Returned to shape study, setXW45 with native slider, Save settings, reload; visible XW45 and Projection persisted while motion started paused. All test save changes are confined to the isolated QA origin.

Evidence: live-gravity.jpg, live-contact.jpg, contact-throw.jpg, inertia-lab.jpg, study-reload.jpg. Numerical contact/idle/cancel-release safety remains unit evidence, not measured browser evidence. No VR/touch hardware, arbitrary rotated solids, frictional rolling or full recreation claim. No source fix or preview restart required by native QA.

Native screenshots and the session record are preserved in `qa/fidelity-2026-10-15/`. No additional browser playthrough was performed by the documentation reviewer.

## Included native captures

- [live-gravity.jpg](qa/fidelity-2026-10-15/live-gravity.jpg)
- [live-contact.jpg](qa/fidelity-2026-10-15/live-contact.jpg)
- [contact-throw.jpg](qa/fidelity-2026-10-15/contact-throw.jpg)
- [inertia-lab.jpg](qa/fidelity-2026-10-15/inertia-lab.jpg)
- [study-reload.jpg](qa/fidelity-2026-10-15/study-reload.jpg)
