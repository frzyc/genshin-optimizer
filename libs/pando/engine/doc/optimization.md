# Optimization

The build solver does not evaluate every candidate against the full node graph.
It first *reduces the problem*: shrinking the graph and discarding candidates
that cannot win. Two routines do this, in
[`src/optimization/`](../src/optimization/):

- `simplify` -- graph reduction independent of candidates.
- `prune` -- range- and monotonicity-based candidate and branch elimination.

Both preserve the top-`N` answers exactly; they only remove work that cannot
change them.

## The problem shape

`prune` ([`prune.ts:56`](../src/optimization/prune.ts)) solves

```
maximize    nodes[0]
subject to  nodes[i] >= minimum[i]   for i in 0..minimum.length
```

over a set of candidate columns. Its signature:

```ts
export function prune<I extends OP, ID>(
  nodes: NumNode<I>[],       // [objective, ...constraints, ...other calcs]
  candidates: Candidate<ID>[][],
  dynTagCat: string,         // tag category the compiled kernel iterates over
  minimum: number[],
  topN: number
): PruneResult<I, ID>
```

A `Candidate<ID>` is `{ id: ID } & Record<string, number>` (`prune.ts:20`): one
choice (an artifact, relic, or disc) expressed as named numeric coordinates plus
an opaque id. `candidates` is an array of columns (one per slot); a build is one
candidate from each column. The returned `nodes`, `candidates`, and `minimum`
are a *new, smaller* problem with the same `topN` builds -- they are not
interchangeable with the inputs (`prune.ts:46-54`).

`PruneResult` also carries `cndRanges` and `monotonicities`, which the solver
reuses to split work.

## `prune` routine

`prune` runs a fixpoint loop (`prune.ts:64-72`):

```
while (progress) {
  pruneBranches(state)   // drop branches that are never taken
  pruneRange(state, 1)   // drop candidates / constraints by value range
  reaffine(state)        // refold weighted sums of reads into fewer reads
  pruneBottom(state, topN)
}
nodes = simplify(nodes)
```

`State<I, ID>` (`prune.ts:75`) holds the mutable problem and lazily derives
three analyses, invalidating them when `nodes` or `candidates` change:

- `cndRanges` -- per-column min/max for each candidate coordinate.
- `nodeRanges` -- min/max of every node, propagated bottom-up
  (`computeNodeRanges`).
- `monotonicities` -- for each `dynTagCat` value, whether the objective is
  increasing/decreasing/incomparable in it (`getMonotonicities`).

### pruneBranches (`prune.ts:140`)

Uses `nodeRanges` to constant-fold branches that are decided regardless of
candidate choice. For `thres`, if `value.min >= threshold.max` the branch is
always taken (and vice versa); decided `match`/`lookup`/`subscript` collapse to
the chosen `x`; `min`/`max` drop operands that can never be the extremum. This
both shrinks the graph and removes whole candidate coordinates that only fed a
dead branch.

### pruneRange (`prune.ts:185`)

Removes candidates and constraints by interval reasoning. A constraint whose
node range already clears its `minimum` everywhere is dropped (always
satisfied). A candidate whose best-case contribution still cannot meet a
constraint is dropped (always infeasible).

### reaffine (`prune.ts`)

Recognizes affine combinations -- weighted sums of `read`s -- and refactors them
into fewer synthetic `read` coordinates folded into the candidates. This lowers
the dimensionality the compiled kernel iterates over, so it is the step that
most directly speeds up the inner loop.

### pruneBottom (`prune.ts:229`)

Pareto filtering. Using `monotonicities`, candidates are grouped by their
incomparable coordinates; within a group, a candidate dominated by more than
`topN` others can never appear in a top-`N` build and is removed.

### Range and monotonicity propagation

`computeNodeRanges` (`prune.ts`) walks bottom-up assigning each node a `Range`
according to its op (sum of ranges, product corners, `sumfrac` corners, branch
output envelope, read = sum over matching candidates, `custom` via
`customOps[ex].range`). `getMonotonicities` propagates increasing/decreasing
flags the same way (e.g. `thres` branches carry opposite monotonicity,
`sumfrac` denominator inverts sign). These two analyses are what make the prune
steps sound: every elimination is justified by an interval or a dominance proof,
never by sampling.

## `simplify` routine

`simplify` ([`simplify.ts:8`](../src/optimization/simplify.ts)) is candidate-
independent graph cleanup, overloaded over `NumNode`/`StrNode`/`AnyNode`:

1. `flatten` -- merge nested associative ops (`sum(a, sum(b, c))` ->
   `sum(a, b, c)`) and drop single-argument wrappers.
2. `combineConst` -- fold constant operands, dropping identity elements
   (`sum` 0, `prod` 1).
3. `deduplicate` -- collapse structurally identical subnodes to one shared
   object, using a commutativity-aware key: operand id sets for `sum`/`prod`/
   `min`/`max`, and for `match` the sorted pair of *branch* ids (its operands
   stay ordered). Sharing here means the calculator's per-node work is not
   repeated.

`prune` calls `simplify` once at the end so the reduced graph handed to the
kernel is already folded and shared.

## How the solver uses this

`game-opt`'s solver compiles the pruned `nodes` into a flat JavaScript kernel
that iterates candidate combinations over `dynTagCat`, applies the `minimum`
constraints, and keeps the top `topN`. Pruning runs before compilation, and the
returned `cndRanges`/`monotonicities` drive how the solver splits the remaining
search across workers. See [`libs/game-opt/doc/overview.md`](../../../game-opt/doc/overview.md).
