# Elsewhere Atelier
A hands-on collection of objects in four spatial dimensions.

## Language
**Slice**: The intersection of a 4D solid with the 3D hyperplane w = s. An object may have an empty slice.
_Avoid_: Shadow, projection

**Projection**: The orthographic image of the whole solid after dropping w. It can show overlapping objects that are separated in w.
_Avoid_: Slice

**Plane rotation**: A rotation mixing two coordinates while preserving 4D distances. XW, YW and ZW involve the fourth spatial dimension.
_Avoid_: Rotation around the fourth axis

**Ball**: A solid Euclidean 4D sphere including its interior. Its slice is a 3D ball, a point, or empty.

**Ball room**: A bounded 4D box containing translational equal-mass balls. Gravity play supports falling, live grabs, pushes and throws; Inertia lab uses elastic zero-gravity contacts.
_Avoid_: Full rigid-body solver
