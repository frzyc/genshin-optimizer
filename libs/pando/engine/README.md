# Pando

Pando is a tag-indexed computation graph: a small algebra of serializable nodes,
evaluated by a `Calculator` against a tag-indexed database of `tag <- value`
entries. It is the calculation core shared by the per-game `*-formula` libs.

This file is an index; the documentation lives in [`doc/`](doc/).

## Documentation

- [Usage walkthrough](doc/usage.md) -- start here: build tag-database entries,
  compute with a `Calculator`, and optimize over candidates with `prune`.
- [Tags and gathering](doc/tags.md) -- what a tag is, tag combination (`T1/T2`),
  and how `calc.gather(T)` collects the results of matching entries (including
  `reread`).
- [Node operations](doc/nodes.md) -- the arithmetic, branching, and tag-related
  operations and their semantics.
- [Propagation](doc/propagation.md) -- how the `Calculator` walks nodes and
  resolves reads.
- [Optimization](doc/optimization.md) -- the `prune`/`simplify` routines behind
  the build solver.
- [Calculator customization](doc/customization.md) -- subclassing hooks and
  `addCustomOperation`.
