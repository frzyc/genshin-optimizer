# game-opt

The game-agnostic layer between the Pando engine and the per-game formula libs
(`gi`/`sr`/`zzz`). It wraps Pando's raw `read`/`tag` primitives into a typed
authoring API, extracts metadata from authored formulas, runs the build solver,
and provides shared UI. Five sub-libraries:

| Sub-lib | Project | Role |
| --- | --- | --- |
| `engine` | `game-opt-engine` | typed reader, `convert`, conditionals, `Calculator` subclass |
| `formula` | `game-opt-formula` | metadata extraction, equipment registration |
| `solver` | `game-opt-solver` | multi-worker build optimizer over Pando `prune` |
| `sheet-ui` | `game-opt-sheet-ui` | sheet/document/field/conditional UI types and components |
| `formula-ui` | `game-opt-formula-ui` | debug/inspection UI contexts |

Each game formula lib depends on `engine`, `formula`, and `solver`; the apps add
`sheet-ui`/`formula-ui`.

## engine

The authoring vocabulary. It re-exports Pando's `TypedRead`, `tag` (as
`baseTag`), `tagVal`, `constant`, `reread`, and the node/entry types, and layers
game conventions on top.

- **`Read`** (`engine/src/read.ts`) extends Pando's `TypedRead` with chainable
  authoring methods: `.name(...)`, `.sheet(...)`, `.add(value)`,
  `.addOnce(sheet, value)`, `.reread(otherRead)`. A read's `.add(...)` produces
  a `TagMapNodeEntry`; `.reread(...)` produces the `<=` redirection entry. The
  game `Tag` (`engine` `Tag` interface) adds the shared categories `preset`,
  `src`, `dst`, `et` (entry type), `sheet`, `name`, `qt`, `q`, and stores
  conditional metadata inline under a symbol key.
- **`createConvert`** (`engine/src/tag.ts`) is the factory each game calls to
  turn its `ownTag`/`enemyTag` declaration (a `Record<qt, Record<q, Desc>>`)
  into typed accessor objects. `convert(table, baseTag)` returns an object whose
  `[qt][q]` chains build a `Read` pre-bound to the `Desc`'s `sheet`/`accu` and
  to `baseTag`'s `et`/`src`/`dst`. This is what produces `own`, `ownBuff`,
  `teamBuff`, `enemy`, etc. in each game's `tag.ts`.
- **`Desc`** = `{ sheet: Sheet | undefined; accu?: Read['ex'] }`. It is the
  contract that says "the final value of this query lives at this `sheet:` and
  accumulates with this op." The formula libs define a small set of named
  `Desc`s (`agg`, `iso`, `static`, ...) and tag every query with one. See the
  per-game `doc/tags.md`.
- **Conditional helpers** -- `createAllBoolConditionals`,
  `createAllListConditionals`, `createAllNumConditionals` (`engine/src/tag.ts`)
  -- build conditional reads whose metadata (type, list, min/max) is recorded on
  the tag's symbol key for later extraction. `createConditionalEntries` writes
  the user-supplied conditional values back into the database.
- **`Calculator`** (`engine/src/calculator.ts`) subclasses Pando's
  `Calculator`, fixing the metadata type `M = CalcMeta<Tag, COp>`. Its
  `computeMeta` records `usedCats` (which tag categories a result touched) and
  `conds` (conditionals encountered); `listFormulas`/`listCondFormulas` walk a
  read's gathered formulas for the UI.

## formula

Post-processing over the authored `TagMapNodeEntries`:

- `extractCondMetadata(data, extractCond)` -- collects every conditional's
  metadata into a sorted `{ sheet: { name: IConditionalData } }`.
- `extractFormulaMetadata(data, extractFormula)` -- collects `IFormulaData<T>`
  per named formula.
- `registerEquipment(specificSheet, equipmentSheet, ...data)` -- the shared
  basis for `registerArt`/`registerRelic`/etc. Equipment buffs are all-or-
  nothing, so each entry is emitted twice: once under the shared equipment sheet
  (`sheet:art`/`relic`/`disc`/`wengine`) that `sheet:agg` already rereads, and
  once under the specific set key (used only for counting equipped pieces). This
  avoids making `sheet:agg` reread every individual set and "greatly reduces
  `Read` traffic" (see the comment in `formula/src/util.ts`).

## solver

Turns a computed objective + constraints + candidate pool into top-`N` builds.

- `SolverConfig<ID>` = `{ nodes, minimum, candidates, topN, numWorkers,
  setProgress }`; `Solver<ID>` distributes work across Web Workers and exposes a
  `results: Promise<BuildResult<ID>[]>`.
- It calls Pando's `prune(nodes, candidates, 'q', minimum, topN)`
  (`solver/src/solver.ts`) to shrink the problem, then each worker `compile`s
  the pruned nodes into a flat kernel via Pando's `executionStr` and iterates
  combinations.
- `split.ts` uses the `monotonicities`/`cndRanges` from `prune` to break large
  subproblems: group by non-monotonic axes, otherwise quarter the monotonic
  ranges. See [`libs/pando/engine/doc/optimization.md`](../../pando/engine/doc/optimization.md).

## sheet-ui / formula-ui

`sheet-ui` defines the game-agnostic presentation types -- `UISheet`,
`Document` (`text`/`fields`/`conditional`), `Field` (`TagField`/`TextField`),
`Conditional`, `Header`, `FormulaText` -- and renders them polymorphically.
Games inject concrete rendering through React contexts (`TagDisplayContext`,
`FormulaTextContext`, conditional value setters). `formula-ui` is the thinner
debug layer: `CalcContext`/`TagContext`/`DebugReadContext` and a
`DebugListingsDisplay` that calls `calc.withTag(tag).toDebug()`.
