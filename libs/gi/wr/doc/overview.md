# WaveRider (gi/wr)

WaveRider (WR) is the **legacy** Genshin calculation engine. It is deprecated --
the active stack is [Pando](../../../pando/engine/README.md) plus the per-game
`*-formula` libs (see gi's [tag architecture](../../formula/doc/tags.md)) --
but `apps/frontend` still runs on it, and it is the migration source for the
in-progress canopy layer. This doc summarizes how WR formulas are authored and
computed.

WR is three things: an immutable **node graph**, a path-indexed **`Data`** store
that nodes read from, and a lazy **`UIData`** calculator that evaluates nodes
against a `Data`.

## Nodes

All node types ([type.d.ts:14-152](../src/type.d.ts)) are immutable
`{ operation, operands, info? }` objects plus per-op fields. The unions are
`NumNode` and `StrNode`.

| Node | `operation` | Meaning |
| --- | --- | --- |
| `ConstantNode` | `const` | literal `value` |
| `ReadNode` | `read` | pull from `Data` at `path`, accumulating with `accu` (below) |
| `ComputeNode` | `add` `mul` `min` `max` `res` `sum_frac` | arithmetic over operands (`type.d.ts:187-192`) |
| `ThresholdNode` | `threshold` | `[v, thr, pass, fail]` -> `v >= thr ? pass : fail` |
| `MatchNode` | `match` | `[v1, v2, match, unmatch]` -> `v1 == v2 ? match : unmatch` |
| `LookupNode` | `lookup` | index a string into `table`, optional default |
| `SubscriptNode` | `subscript` | index a number into a constant `list` |
| `DataNode` | `data` | evaluate the operand in a scope with `data` merged in (`reset` jumps to the origin scope) |
| `StrPrioNode` | `prio` | first non-`undefined` string operand |
| `SmallestNode` | `small` | lexicographically smallest string operand |

`res` is GI resistance; `sum_frac` is `x0 / (x0 + x1)` (def/res scaling). `Empty`
results: `threshold`/`match` can mark the untaken branch empty (`emptyOn`), which
propagates `isEmpty` so a failed conditional contributes nothing.

### Info (display metadata)

Every node may carry `Info` ([type.d.ts:45-58](../src/type.d.ts)):
`path`, `unit`, `prefix` (the stat namespace -- `base`/`total`/`char`/`art`/
`weapon`/`teamBuff`/...), `source` (authoring entity), `variant`/`subVariant`
(element/reaction/`heal` for coloring), `pivot`, `asConst`, `fixed`,
`isTeamBuff`, `strikethrough`. `infoMut(node, info)` annotates a node without
changing its value.

### Constructors

Authors never build node literals; they use the DSL in
[utils.ts](../src/utils.ts): `constant`/`percent`, `read`/`stringRead`,
`sum`/`prod`/`min`/`max`/`frac`/`res`, `threshold`/`greaterEq`/`lessThan`,
`equal`/`unequal`/`compareEq`, `lookup`, `subscript`, `stringPrio`,
`data`/`resetData`, and `infoMut`.

## The reader: `input` and path-based binding

[formula.ts](../src/formula.ts) defines `input`, a tree whose every leaf is a
`ReadNode` carrying its `path` (e.g. `input.total.atk_` reads `['total','atk_']`).
The namespaces include `base`, `customBonus`, `premod`, `total`, `art`/`artSet`,
`weapon`, `enemy`, `hit` (the current dmg instance: `ele`/`move`/`reaction`/...),
`infusion`, `nonStacking`, and `tally`.

A `ReadNode`'s **`accu`** decides how multiple `Data` layers combine at that
path: `add` (default), `mul`, `min`, `max`, or `small` (strings). So when a
character, a weapon, and an artifact set each write `total.atk_`, reading
`input.total.atk_` returns their **sum**. This accumulation is the core of WR's
composition model -- analogous to a Pando `read` gathering tag entries.

`DataNode` provides scoping: `data(node, override)` evaluates `node` with
`override` merged onto the current `Data`; damage formulas use it to fix
`hit.ele`/`hit.move`/`hit.reaction` for one instance. `resetData` evaluates
against the origin scope (dropping accumulated buffs).

## Authoring a sheet

A sheet produces a `Data` ([type.d.ts:176-185](../src/type.d.ts)) =
`Input & { display?, conditional?, teamBuff? }`:

- `dataObjForCharacterSheet(charKey, dmgFormulas, bonus)`
  (`libs/gi/sheets/.../dataUtil.tsx`) assembles the `Data`: `premod`/`total`
  contributions, `teamBuff` for team-wide buffs, `display` formula rows, and
  `dmgFormulas` built with `dmgNode`/`customDmgNode` (move-typed damage with
  talent scaling).
- **Conditionals**: a `conditional` sub-object; the user's selection (e.g.
  `conditional.Bennett.a6 = 'on'`) is flattened into the `Data` as a `constant`
  string, then read back via `equal('on', read(...), bonus)` or `lookup`.
- **Display**: `display` rows reference formula nodes wrapped with `infoMut` for
  labels/units; the UI evaluates them via `UIData.getDisplay()`.

## Computation: `UIData`

The calculator is a **separate** library, `libs/gi/uidata` (not part of
`gi/wr`). [uiData.ts](../../uidata/src/uiData.ts) walks nodes lazily and memoizes
per node. `_read` fetches `objPathValue(data, path)` and folds the matching
layers by `accu`; `_data` builds a child `UIData` with merged data for
`DataNode`. The result is a `CalcResult` =
`{ value, meta: { op, ops, conds }, info, isEmpty }` -- `meta.ops` is the child
results (the breakdown tree the UI renders) and `meta.conds` records which
conditional paths were hit.

### Teams

[api.ts](../src/api.ts) `mergeData` folds several `Data` layers into one (each
path combined by its reader's `accu`). WR **relies on** `uiDataForTeam`
([uiData.ts](../../uidata/src/uiData.ts), in `libs/gi/uidata`) to operate
correctly: it builds the member/buff graph -- `own[i]` (pre-buff), `target[to]`,
`buff[to][from]`, `totalBuff[i]` -- and resolves cross-member buffs read from the
`teamBuff` paths. A single `UIData` is not enough; without `uiDataForTeam`, team
buffs and cross-member scaling do not resolve. (This whole-team coupling is one
of the things canopy's order-is-law model aims to retire.)

## Relation to Pando / canopy

WR's "read a path, accumulate across layers" maps onto Pando's "read a tag,
gather matching entries"; WR's `Info` maps onto Pando's tag categories + listing
metadata; WR `DataNode` scoping maps onto Pando `tag`/`dtag`. The migration
target, canopy, reframes the layer-accumulation as ordered assignments
(order-is-law).
