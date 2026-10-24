# Usage

End to end: build tag-database entries, compile them into a `Calculator`,
compute values, then optimize over candidate inputs. See [tags.md](./tags.md)
for the gathering semantics, [nodes.md](./nodes.md) for the operations, and
[optimization.md](./optimization.md) for how `prune` works.

## 1. Build entries and a database

An entry `{ tag, value }` means "the computation of `tag` should include
`value`" (`tag <- value`). Declare the tag categories and their values with
`compileTagMapKeys`, author the entries, then compile them into a `Calculator`.

```ts
import {
  Calculator,
  compileTagMapKeys,
  compileTagMapValues,
  constant,
  prod,
  read,
  sum,
} from '@genshin-optimizer/pando/engine'

// Declare every tag category and its possible values.
const keys = compileTagMapKeys([
  { category: 'q', values: new Set(['atk', 'atk_', 'dmg']) },
  { category: 'src', values: new Set(['weapon', 'artifact']) },
])

// Author entries. `value` is a Node; a `read(tag, accu)` pulls other entries.
const entries = [
  { tag: { q: 'atk' }, value: constant(100) }, // base atk
  { tag: { q: 'atk', src: 'weapon' }, value: constant(50) }, // weapon flat atk
  { tag: { q: 'atk_' }, value: constant(0.2) }, // +20% atk
  // dmg = (sum of atk entries) * (1 + sum of atk_ entries)
  {
    tag: { q: 'dmg' },
    value: prod(read({ q: 'atk' }, 'sum'), sum(1, read({ q: 'atk_' }, 'sum'))),
  },
]

// Compile the entries into the tag database and build the calculator.
const calc = new Calculator(keys, compileTagMapValues(keys, entries))
```

Splitting entries across several `compileTagMapValues(keys, ...)` arrays and
passing them all to `new Calculator(keys, ...valuesA, ...valuesB)` merges them --
this is how the per-game libs assemble `common`, `char`, `weapon`, ... into one
database.

## 2. Calculate

- `calc.gather(tag)` returns every matching entry's result (the raw
  contributions).
- `calc.compute(node)` evaluates a node; a `read` inside it gathers and folds
  with its accumulator.
- `calc.withTag(tag)` binds extra tag context for the nested reads.

```ts
calc.gather({ q: 'atk' }).map((r) => r.val) // [100, 50] -- both atk entries
calc.compute(read({ q: 'atk' }, 'sum')).val // 150
calc.compute(read({ q: 'dmg' })).val // single dmg entry: 150 * (1 + 0.2) = 180

// Bind src:weapon so reads beneath also carry it.
calc.withTag({ src: 'weapon' }).compute(read({ q: 'atk' }, 'sum')).val
```

A `read` with no accumulator falls back to `defaultAccu(tag)` and finally to
`'unique'`, which assumes exactly one matching entry (here, `dmg`); use
`'sum'`/`'prod'`/`'min'`/`'max'` when several entries contribute.

## 3. Optimize

The build solver maximizes one node subject to minimum constraints over a set of
candidate inputs. Express the objective and constraints as `NumNode`s whose free
variables are `read`s over a chosen *dynamic* tag category (conventionally `q`).
Each candidate supplies values for those keys; `prune` returns a smaller,
equivalent problem with the same top-`N` answers.

```ts
import { prune, read, prod, sum } from '@genshin-optimizer/pando/engine'

// nodes[0] is the objective; nodes[1..minimum.length] are >= minimum.
const objective = sum(read({ q: 'c0' }), prod(2, read({ q: 'c1' })))
const constraint = read({ q: 'c2' })

// One column per slot; each candidate is { id, ...keyValues }.
const candidates = [
  [
    { id: 1, c0: 0, c1: 3, c2: 4 },
    { id: 2, c0: 6, c1: 2, c2: 6 },
    { id: 3, c0: 10, c1: 1, c2: 6 },
  ],
]

const result = prune(
  [objective, constraint], // nodes
  candidates,
  'q', // the dynamic tag category the kernel iterates
  [5], // minimum for constraint (objective has no minimum)
  2 // keep top-2 builds
)
// result = { nodes, candidates, minimum, cndRanges, monotonicities } -- a
// reduced problem. Feed it to the iteration kernel that enumerates candidate
// combinations and keeps the best.
```

`prune` only shrinks the problem (range/monotonicity elimination + `simplify`);
it does not enumerate builds. The actual multi-worker enumeration lives in
`@genshin-optimizer/game-opt/solver` (`Solver`), which calls `prune`, compiles
the reduced nodes into a flat kernel, and distributes the search. See
[optimization.md](./optimization.md).
