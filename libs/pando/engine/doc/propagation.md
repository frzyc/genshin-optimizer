# Propagation

How a `Calculator` turns a node graph plus a tag database into values. This
complements [the README](../README.md), which defines tags and tag-database
gathering; here we follow the actual evaluation walk in
[`src/node/calc.ts`](../src/node/calc.ts) and the node algebra in
[`src/node/type.ts`](../src/node/type.ts).

## Nodes

Every node is a serializable object `{ op, x, br, ex?, tag? }` (`Base` in
`type.ts:20`):

- `op` -- the operation name (`OP`, `type.ts:4`).
- `x` -- operand subnodes.
- `br` -- branching subnodes (the condition/selector inputs).
- `ex` -- extra payload (a constant value, an accumulator name, a subscript
  table, dynamic-tag categories, a custom-op id).
- `tag` -- a `Tag` attached to read- and tag-related nodes.

Operations divide into four groups:

| Group | Ops | Meaning |
| --- | --- | --- |
| Constant | `const` | `ex` is the value |
| Arithmetic | `sum` `prod` `min` `max` `sumfrac` | over `x`; `sumfrac` is `x0 / (x0 + x1)` |
| Branching | `thres` `match` `lookup` `subscript` | choose among `x` using `br` |
| Tag / read | `tag` `dtag` `vtag` `read` (`reread`) | move through the tag space and pull values |
| Escape hatch | `custom` | `ex` names a function registered via `addCustomOperation` |

`NumNode`, `StrNode`, and `AnyNode` (`type.ts:108-149`) are the typed unions;
the `PermitOP` type parameter lets later stages prove that a subset of ops has
been eliminated (e.g. tag ops are gone after detachment).

### Branching semantics

A branching node evaluates its `br` inputs first, picks one index, and only
then evaluates the single chosen `x`. The others are never computed.

- `thres`: `br0 >= br1 ? x0 : x1` (`type.ts:53`)
- `match`: `br0 == br1 ? x0 : x1` (`type.ts:56`)
- `lookup`: `x[ ex[br0] ] ?? x0`, where `ex: Record<string, number>`
  (`type.ts:59`)
- `subscript`: `ex[br0]` -- a constant table indexed by a computed number
  (`type.ts:64`)

This "evaluate the selector, then one branch" rule (calc.ts:99-110) is what
keeps conditionals from forcing the whole graph, and it is also what the
optimizer's `pruneBranches` exploits.

## Tags and the tag database

A `Tag` is a `Record<category, value>` (see `tag/type.ts`). The calculator does
not match tags by scanning; it compiles them. `TagMapKeys`
([`tag/keys.ts`](../src/tag/keys.ts)) packs a tag into an `Int32Array` `TagId`,
assigning each category a byte offset and each value a nonzero bit pattern.
`compileTagMapKeys` / `compileTagMapValues`
([`tag/compilation.ts`](../src/tag/compilation.ts)) turn authored
`TagMapEntries` into a layered structure that `TagMapSubsetValues`
([`tag/subset.ts`](../src/tag/subset.ts)) can query by *subset*: an entry
matches a query when its tag is a subset of the query's, so extra categories on
the query are ignored. This is why a read for `{ q:dmg_ ele:hydro }` also
gathers the element-agnostic `{ q:dmg_ }` entry.

Tag combination is asymmetric (`T1/T2`, defined in the README): the right-hand
tag's categories win, the left-hand's fill in the rest. `cache.with(tag)`
(below) is exactly this combination, applied incrementally.

## The Calculator

`Calculator<M>` (`calc.ts:26`) holds:

- `nodes` -- the compiled tag database (`TagMapSubsetValues<AnyNode | ReRead>`).
- `cache` -- a `DedupTag` tree of memoized `PreRead<M>` gather results, keyed by
  tag context.
- `calc` -- a `DedupTag` tree of child calculators, one per tag context.

The generic `M` is per-result metadata (`CalcResult<V, M> = { val, meta }`,
`calc.ts:25`); the base `computeMeta` returns `undefined` and downstream
subclasses (e.g. `game-opt` `Calculator`) override it to record which tag
categories and conditionals a result used.

### Memoized tag contexts

`cache` and `calc` are deduplicated tag maps: navigating to a tag context is a
path through the tree (`Leaf.with`, `tag/dedup.ts`), and the result is stored on
that node. Two computations that arrive at the same tag share the same cache
node, so each `(tag-context)` gather and each child calculator is built once.

- `withTag(tag)` (`calc.ts:41`) returns a child calculator bound to a merged tag
  context, reusing the cached one when it exists.
- `gather(tag)` (`calc.ts:50`) returns the matching entries' results.
- `compute(node)` (`calc.ts:57`) is the entry point.

### `_compute`: the evaluation walk

`_compute(n, cache)` (`calc.ts:79`) is a `switch` on `op`:

- **const** -- return `ex`.
- **arithmetic** -- compute every `x`, fold with `arithmetic[op]`.
- **branching** (`thres`/`match`/`lookup`) -- compute `br`, pick the index via
  `branching[op]`, compute only that one `x`.
- **subscript** -- compute `br0`, index `ex`.
- **vtag** -- read a value straight off the current tag: `cache.tag[ex] ?? ''`.
- **tag** -- combine `cache` with the node's static `tag`, evaluate `x0` in that
  new context.
- **dtag** -- compute the `br` inputs to strings, combine them into the cache
  under the `ex` category names, evaluate `x0`. This is how the prep phase
  attaches a computed `ele:`/`amp:`/`cata:` to a downstream formula.
- **read** -- the propagation core, below.
- **custom** -- compute `x`, call `customOps[ex].calc`.

Every result is frozen and tagged with `computeMeta` output.

### `read` and `_gather`

A `read` (`calc.ts:127`) combines the cache with its `tag`, then calls
`_gather` (`calc.ts:64`) for that context. `_gather` finds every matching
database entry and, for each:

- if the entry is a `reread` to another tag, it recurses into
  `_gather(cache.with(entry.tag))` and splices in those results (the `<=`
  redirection from the README);
- otherwise it `_compute`s the entry node.

The gathered list (`pre`) is then folded by an accumulator `ex`
(`sum`/`prod`/`min`/`max`/`unique`). If the node did not specify one, the
calculator asks `defaultAccu(tag)` and falls back to `unique` -- and in calc
debug mode a `unique` read with more than one match throws (`calc.ts:135`),
which is how ill-formed (multiply-defined) singleton queries are caught. Results
are memoized on the cache node per accumulator (`computed[ex]`).

So "propagation" is: a `read` at tag `T` pulls every database entry whose tag is
a subset of `T`, rereads chase those to other tags, and accumulators combine the
contributions. Downstream formula libs build their whole stat dependency graph
out of this single mechanism -- see each game's `doc/tags.md` (and `doc/api.md`).

## Subclassing

Three hooks let a game layer enrich computation without touching the walk:

- `defaultAccu(tag)` (`calc.ts:149`) -- infer an accumulator from the query tag
  (the `Desc.accu` convention in the formula libs).
- `markGathered(...)` (`calc.ts:152`) -- observe each gathered entry.
- `computeMeta(...)` (`calc.ts:160`) -- attach metadata (`M`) to every result.

`game-opt`'s `Calculator` uses these to track `usedCats` and conditionals for
the UI; the base engine stays game-agnostic.
