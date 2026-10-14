# Tag Architecture

This mirrors the Genshin [tag architecture](../../../gi/formula/doc/tags.md);
read that first for the shared model (tags, queries, entry types, the prep
phase, conditionals). This document covers the tags specific to Zenless. For the
authoring API that produces them, see [api.md](./api.md).

Tag categories in this module identify the calculation as follows:

- `name:` the top-level formula
- `preset:` optimization preset slot
- `src:` the character applying buffs
- `dst:` the character receiving buffs
- `sheet:` the sheet that contains the formula
- `et:` the entry type
- `qt:` and `q:` the query

ZZZ-specific optional categories (on the `Tag` type in
[read.ts](../src/data/util/read.ts)): `attribute:` (electric / fire / ice /
physical / ether), `skillType:`, `damageType1:`/`damageType2:` (basic / dash /
special / anomaly / ...), and `specialty:`/`faction:` (used for team-composition
counts; `team.common.count` is bound with `specialty`/`faction`/`attribute`
`null`ed to avoid double-counting). Note `Read.add` refuses a bare `dmg_` write that carries none
of `attribute`/`skillType`/`damageType1`/`damageType2` (use `common_dmg_`
instead). See read.ts for the authoritative list.

## Source layout (`data/` vs `meta/`)

Unlike GI/SR, ZZZ splits the library:

- `src/data/` is the **source of truth** -- the hand-written sheets
  (`char/sheets/*`, `wengine/sheets/*`, `disc/sheets/*`), the shared formulas and
  glue (`common/*`), and the tag vocabulary (`util/*`).
- `src/meta/` is **generated** from `data/` (each file is marked
  `// WARNING: Generated file, do not modify`); it is a compiled cache of
  conditionals/formulas/buffs for fast UI lookup. Never edit it by hand -- change
  `data/` and regenerate.

## Query and sheet aggregation (`Desc`)

Queries are identified by `qt: q:` and declared with `Desc = { sheet, accu? }`
in [tag.ts](../src/data/util/tag.ts), applied by `convert`. Three rendezvous
levels:

```
*--------*-----------------------------------------------------------*
|        |                       Affected By                         |
| sheet: *-----------*------*----------*-------------*------*--------*
|        | Team Buff |  Disc | Reaction |  W-Engine  | Char | Custom |
*--------*-----------*-------*----------*------------*------*--------*
|  agg   |    YES    |  YES  |   YES    |    YES     | YES  |  YES   |
|  iso   |     -     |   -   |    -     |     -      | YES  |  YES   |
| static |     -     |   -   |    -     |     -      |  -   |   -    |
*--------*-----------*-------*----------*------------*------*--------*
```

ZZZ declares more accumulator-bearing `Desc`s than GI/SR, because several damage
multipliers combine by product rather than sum:

- `agg` = `{ sheet:'agg', accu:'sum' }`, `aggStr` = `{ sheet:'agg' }`
- `iso` / `isoSum` = `{ sheet:'iso' (accu:'sum') }`
- `fixed` = `{ sheet:'static' }`, `fixedProd` = `{ sheet:'static', accu:'prod' }`
- `prep` = `{ sheet:undefined }`, `prepProd` = `{ sheet:undefined, accu:'prod' }`

### Query types

`ownTag` (tag.ts):

- `base` -- the seed stats (agg): `atk def hp impact crit_ crit_dmg_ pen_
  anomProf anomMas enerRegen`.
- `initial` / `combat` -- the full ZZZ stat list (agg). `combat` is a second
  additive layer applied during combat (see waterfall below).
- `final` -- exactly the stats that have a meaningful final layer, i.e.
  `flatAndPercentStats` plus the single-variant base stats
  (`nonFlatAndPercentStats`); the percent-only `_` forms are consumed inside the
  waterfall and have no `final`. (Computed by `finalStats` in tag.ts.)
- `char` -- identity is `iso` (`lvl attribute specialty faction promotion
  mindscape potential`); ability levels are `agg` (`basic dodge special chain
  assist core`).
- `wengine` -- `lvl modification` (iso), `phase` (isoSum).
- `common` -- `count` (isoSum), `critMode` (fixed), `cappedCrit_`/
  `anom_cappedCrit_` (iso).
- `dmg` -- the multiplier chain, combined by product. The `fixedProd` aggregator
  is `shared` (the bundle every damage type rereads); the `fixed` multipliers are
  `crit_mult_ dmg_mult_ buff_mult_ def_mult_ res_mult_ dmg_taken_mult_
  stunned_mult_ sheer_mult_ anomaly_crit_mult_ anom_base_mult_`; `mv_mult_`/
  `anom_mv_mult_` are `agg` (so per-formula move multipliers can stack). Each
  unlisted multiplier here would silently join the product, so the set is closed
  by design.
- `formula` -- `base` (agg), `listing` (aggStr); damage entry points
  `standardDmg`/`sheerDmg`/`anomalyDmg` (prepProd); and the `prep` formulas
  `shield`, `heal`, and the anomaly/daze prep chain `anomMas_mult_`,
  `anomBuildup_mult_`, `enemyAnomBuildupRes_mult_`, `anomBuildup`, `daze_mult_`,
  `enemyDazeRes_mult_`, `enemyDazeTaken_mult_`, `dazeBuildup`.
- `listing` -- `formulas`/`buffs` (aggStr).

Beyond these per-stat groups, the `qt:` vocabulary (the `queryTypes` set) also
includes the cross-cutting `cond` (conditionals), `misc` (`percent(x)` ->
`{qt:misc q:_}` and `allStatics`), and the non-stacking trio
`stackIn`/`stackTmp`/`stackOut`. `et:` ranges over read-side `own`/`team`/
`target`/`enemy` and write-side `own`/`teamBuff`/`notOwnBuff`/`enemyDeBuff`
(`notOwnBuff` applies to every teammate but the source).

`enemyTag.common` carries the enemy stat block (`lvl def defRed_ res_ resRed_
dmgInc_ dmgRed_ stun_ unstun_ dazeRes_ dazeInc_ dazeRed_ anomBuildupRes_`),
gathered at the dedicated `sheet:enemy` (one of the `commonSheets` alongside
`anomaly`), kept off the member `agg`. Note the comment there: a future second
`stats` block may be added to model `ModifyAttackData` and prevent recursive
buffs.

## Gathering and the glue

Glue is imported with the sheets and assembled in `src/data/index.ts`. Two
kinds:

- **Static glue** -- [data/common/index.ts](../src/data/common/index.ts):
  `sheet:agg <= sheet:custom`, `sheet:iso <= sheet:custom`,
  `sheet:agg et:teamBuff <= sheet:anomaly`, `sheet:agg <= sheet:char`, the
  four-layer stat waterfall (below), the special `sheerForce` calc, capped crit,
  and `qt:cond` defaulting to 0.
- **Dynamic glue** -- `src/util.ts`: `wengineTagMapNodeEntries` adds
  `sheet:agg <= sheet:wengine` plus level/phase; `discTagMapNodeEntries` adds
  `sheet:agg <= sheet:disc` and routes disc stats through
  `sheet:disc qt:initial <= sheet:dyn` (the detachment hook for the solver);
  `teamData` adds cross-member reads. Equipment buffs use `registerEquipment`
  ([game-opt/formula](../../../game-opt/doc/overview.md)), which emits each buff
  under both the shared equipment sheet and the specific set key to keep `Read`
  traffic low.

### The four-layer stat waterfall

ZZZ has two percent layers, not one (common/index.ts). For a stat that has both
a flat and a percent variant (`flatAndPercentStats` -- `atk def hp impact
anomProf anomMas enerRegen`):

```
initial X = base X * (1 + initial X%)
final   X = initial X * (1 + combat X%) + combat X
```

Stats with a single variant (`nonFlatAndPercentStats`) skip the percent
multiply: `initial X = base X` (when a base exists) and `final X = initial X +
combat X`. `sheerForce` is a further special case: `initial = initial.atk * 0.3`
for the rupture specialty, `combat` from the atk delta, `final = initial +
combat`.

## Cycle-Prevention Discipline

Same as GI/SR: cycles are permitted by the types and prevented by discipline.

**(a) When a redirect changes a tag category, do not erase the other categories
unless another category also changes.** Erasing widens the match and risks a
self-loop.

**(b) When a redirect changes a tag category, it most often also changes another
category lower in the hierarchy.** Hierarchies:

- `qt:` stat layer: `final` > `combat` > `initial` > `base`; each layer reads
  only strictly lower ones.
- `sheet:`: `agg` > `iso` > `static`, `agg` gathering from `char`, `wengine`,
  `disc`, `anomaly`, `custom`; disc stats additionally pass `disc <= dyn`.
- `qt:prep`/`prepProd` formulas resolve before stats and depend only on other
  preps, `static`, tag values, and conditionals; they attach via `dynTag`.
- `et:enemy` write entries are fixed to `et:enemyDeBuff` so enemy stats cannot
  feed back into enemy-damage reads.

Add contributions by writing to a layer; move `qt:`/`sheet:` only downward.
Following (a) and (b) keeps the gather graph acyclic without a runtime check.

## Key files

| File | Role |
| --- | --- |
| `src/data/util/tag.ts` | `ownTag`/`enemyTag`, `Desc`s, `convert`, accessors |
| `src/data/util/read.ts` | `Tag` type, `Read` class, reader |
| `src/data/util/listing.ts` | stats, sheets, attributes, damage types, members |
| `src/data/util/sheet.ts` | `registerBuff`/`custom*` curation API |
| `src/data/common/index.ts` | static glue: sheet + four-layer stat waterfall |
| `src/util.ts` | dynamic glue: char/wengine/disc/team entries |
| `src/data/index.ts` | assembly: entries -> keys/values |
| `src/meta/` | generated cache; do not edit |
