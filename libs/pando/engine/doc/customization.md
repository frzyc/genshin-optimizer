# Calculator Customization

`Calculator` can be customized via subclassing. The base implementations are
no-ops/identities, so override only what a game needs. The hooks are:

```
- defaultAccu(tag: Tag): BaseRead['ex']
    The accumulator a `read(tag)` with no explicit `accu` should use. Returning
    `undefined` leaves the final fallback as `'unique'`. Per-game libs use this
    to make a whole tag category (e.g. a `q:` that aggregates) default to
    `'sum'` without spelling the accumulator at every read.

- markGathered(tag: Tag, entryTag: Tag, n: AnyNode | undefined,
    result: CalcResult<number | string, M>): CalcResult<number | string, M>
    Called once per entry as it is gathered, before accumulation. Return the
    result unchanged, or a wrapped/annotated copy. Use it to tag a result's
    `meta` with its source for UI traces.

- computeMeta(n: AnyNode, value: number | string,
    x: (CalcResult<number | string, M> | undefined)[],
    br: CalcResult<number | string, M>[],
    tag: Tag | undefined): M
    Builds the `meta` `M` carried alongside each computed value (the generic
    annotation threaded through every `CalcResult`).
```

For custom operations, register them once at the start of the program with
`addCustomOperation(name, info)`, where `info: CustomInfo` is

```
type CustomInfo = {
  // Given each argument's range, the range of the result. Used by `prune`.
  range: (r: Range[]) => Range
  // Given each argument's range, monotonicity w.r.t. each argument. Used by
  // `prune`. Monotonicity = { inc: boolean; dec: boolean } (both = constant,
  // neither = non-monotonic).
  monotonicity: (r: Range[]) => Monotonicity[]
  // The actual computation. Argument and result types must match. Must be a
  // valid standalone function (no external calls) if used with `compile`.
  calc: (args: (number | string)[]) => number | string
  // Optional dual part of `calc(x + dx e)`, `e = sqrt(0)`, for autodiff. Same
  // standalone-declaration restriction as `calc`.
  diff?: (x: number[], dx: number[]) => number
}
```

`range`/`monotonicity` let the build solver's `prune` reason about the op
without evaluating it; provide them whenever a custom op feeds the optimizer.
