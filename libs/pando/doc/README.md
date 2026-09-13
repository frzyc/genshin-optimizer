# Pando documentation map

Index of the architecture docs in this set. `(gen)` = auto-generated and
unverified -- defer to the code where they disagree. The rest are hand-written /
verified.

## Pando engine -- the calc core (`libs/pando/engine/`)

- [README](../engine/README.md) -- what Pando is (tag-indexed computation graph)
  + index.
- [doc/tags.md](../engine/doc/tags.md) -- what a tag is (`cat:val` pairs),
  notation, tag combination.
- [doc/nodes.md](../engine/doc/nodes.md) -- every node op (arithmetic / branching
  / tag-related) and its semantics.
- [doc/customization.md](../engine/doc/customization.md) -- `Calculator`
  subclassing hooks + `addCustomOperation`.
- [doc/usage.md](../engine/doc/usage.md) `(gen)` -- end-to-end: build entries ->
  compile a `Calculator` -> compute -> optimize with `prune`.
- [doc/propagation.md](../engine/doc/propagation.md) `(gen)` -- how a `Calculator`
  turns a node graph + tag DB into values (read resolution).
- [doc/optimization.md](../engine/doc/optimization.md) `(gen)` -- the
  `prune`/`simplify` routines behind the build solver.

## Per-game formula libs -- tag vocab + authoring surface

- [gi](../../gi/formula/doc/tags.md) / [sr](../../sr/formula/doc/tags.md) /
  [zzz](../../zzz/formula/doc/tags.md) `tags.md` `(gen)` -- each game's tag
  architecture (the tags themselves; SR/ZZZ mirror GI).
- [gi](../../gi/formula/doc/api.md) / [sr](../../sr/formula/doc/api.md) /
  [zzz](../../zzz/formula/doc/api.md) `api.md` `(gen)` -- the authoring API
  (`data/char/*`, `data/weapon|relic|wengine|disc/*`) that produces tag entries.
- [zzz/glue.md](../../zzz/formula/doc/glue.md) -- *verified* deep-dive of ZZZ's
  gather: the `reread` redirections + four-layer stat waterfall + team/disc/dyn
  seams (expands zzz tags.md's "Gathering and the glue").

## Bridge + legacy engine

- [game-opt/overview.md](../../game-opt/doc/overview.md) `(gen)` -- the
  game-agnostic layer between the Pando engine and the per-game formula libs.
- [gi/wr/overview.md](../../gi/wr/doc/overview.md) `(gen)` -- WaveRider, the
  legacy / deprecated GI calc engine.

## Cross-game migration analysis (this directory)

- [dmg-survey.md](dmg-survey.md) -- cross-game damage pipeline + formula-local
  stat-modification patterns (deep/shallow, accumulator-vs-singleton), for
  designing the canopy damage layer.
- [name-scoped-buffs.md](name-scoped-buffs.md) -- census of every formula-local
  (name-scoped) buff across GI/SR/ZZZ, with file:line, target stat layer, and
  deep/shallow classification.
