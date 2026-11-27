# Tag Architecture

This mirrors the Genshin [tag architecture](../../../gi/formula/doc/tags.md);
read that first for the shared model (tags, queries, entry types, the prep
phase, conditionals). This document covers the tags specific to Star Rail. For
the authoring API that produces them, see [api.md](./api.md).

Tag categories in this module identify the calculation as follows:

- `name:` the top-level formula
- `preset:` optimization preset slot
- `src:` the character applying buffs
- `dst:` the character receiving buffs
- `sheet:` the sheet that contains the formula
- `et:` the entry type
- `qt:` and `q:` the query

SR-specific optional categories (defined on the `Tag` type in
[read.ts](../src/data/util/read.ts)):

- `elementalType:` physical / fire / ice / lightning / wind / quantum / imaginary
- `damageType1:`, `damageType2:` basic / skill / ult / followUp / dot / break / ...
- `path:` the character path (used for relic/lightcone matching)

As in GI, the optional tags are not assumed present in most formulas; reading
`{ q:dmg_ elementalType:fire }` gathers both the type-agnostic and the
fire-specific bonus.

## Query and sheet aggregation (`Desc`)

The current computation is identified by `qt: q:`. Valid combinations live in
[tag.ts](../src/data/util/tag.ts); each is declared with a
`Desc = { sheet, accu? }` that fixes its rendezvous `sheet:` and accumulator,
applied automatically by `convert`. The three rendezvous levels:

```
*--------*-----------------------------------------------------------*
|        |                       Affected By                         |
| sheet: *-----------*------*----------*-------------*------*--------*
|        | Team Buff | Relic | Reaction | Light Cone | Char | Custom |
*--------*-----------*-------*----------*------------*------*--------*
|  agg   |    YES    |  YES  |   YES    |    YES     | YES  |  YES   |
|  iso   |     -     |   -   |    -     |     -      | YES  |  YES   |
| static |     -     |   -   |    -     |     -      |  -   |   -    |
*--------*-----------*-------*----------*------------*------*--------*
```

Named `Desc`s: `agg` (`sheet:agg accu:sum`), `aggStr` (`sheet:agg`),
`iso`/`isoSum` (`sheet:iso`), `fixed` (`sheet:static`), `prep`
(`sheet:undefined`). (The Reaction column is carried over from the shared table;
SR has no elemental reactions yet, so nothing currently gathers through it.)

### Query types

`ownTag` (tag.ts) groups queries by `qt:`:

- `base` -- `atk def hp spd` (agg).
- `premod` / `final` -- the full SR stat list (agg): `hp atk def spd` and their
  `_` percent forms, `crit_ crit_dmg_ brEffect_ eff_ eff_res_ enerRegen_ heal_
  incHeal_ dmg_ common_dmg_ resPen_ defIgn_ weakness_ brEfficiency_`,
  plus `shield_` on premod.
- `char` -- identity is `iso` (`lvl ele path ascension teamPosition eidolon
  maxEnergy`); ability levels are `agg` (`basic skill ult talent servantSkill
  servantTalent`); trace `bonusAbilities` and `statBoosts` are `isoSum`.
- `lightCone` -- `lvl ascension` (iso), `superimpose` (isoSum).
- `common` -- `count` (isoSum), `critMode` (fixed), `cappedCrit_` (iso).
- `dmg` -- `out inDmg critMulti` (fixed).
- `formula` -- `base` (agg), `listing` (aggStr), and `dmg shield heal breakDmg`
  (prep).
- `listing` -- `formulas` and `buffs` (aggStr), the optimization targets.

`enemyTag.common` -- `lvl` (fixed), `defRed_ res` (agg), `maxToughness isBroken`
(iso).

Beyond the per-stat groups above, the `qt:` vocabulary (the `queryTypes` set in
tag.ts) also includes the cross-cutting ones shared with GI: `cond` (conditional
reads), `misc` (carries `percent(x)` -> `{qt:misc q:_}` multipliers and
`allStatics`), and the non-stacking trio `stackIn`/`stackTmp`/`stackOut` (see the
team glue below). These are global qt values a read may carry.

`et:` (entry type) ranges over the same set as GI: read-side `own`/`team`/
`target`/`enemy`; write-side `own`/`teamBuff`/`notOwnBuff`/`enemyDeBuff`
(`notOwnBuff` = a buff applied to every teammate except its source).

Compared with GI, SR has no `reaction`/`trans` query groups and no
`weaponRefinement` (light cones use `superimpose`); it adds `path`,
`damageType*`, the light-cone group, and `formula.breakDmg`.

## Gathering and the glue

Assembled in [data/index.ts](../src/data/index.ts) (entries -> `compileTagMapKeys`
-> `compileTagMapValues`). Glue is split:

- **Static glue** -- [data/common/index.ts](../src/data/common/index.ts):
  `sheet:agg <= sheet:custom`, `sheet:iso <= sheet:custom`,
  `sheet:agg <= sheet:char`, the stat waterfall
  `qt:final <- qt:premod <- qt:base` with `premod X += base X * premod X%`,
  capped crit, and `qt:cond` defaulting to 0.
- **Dynamic glue** -- `src/util.ts`: `lightConeTagMapNodeEntries` adds
  `sheet:agg <= sheet:lightCone` and records level/ascension/superimpose;
  `relicTagMapNodeEntries` adds `sheet:agg <= sheet:relic` and, notably, routes
  relic stats through an intermediate dynamic sheet:
  `sheet:relic qt:premod <= sheet:dyn`, with each rolled stat added under
  `sheet:dyn`. The `dyn` indirection lets the solver detach relic stats from the
  static graph (they become candidate coordinates) without rewriting the sheet.
  `teamData` adds the full cross-member redirect set (same shape as GI's
  `teamData`): `et:target dst:X <= et:own src:X` (a target read resolves to that
  member's own stat); `et:own src:X <= et:teamBuff{dst:X,src,name:null}` over
  every member pair, and `<= et:notOwnBuff{...}` over distinct pairs; `et:enemy <=
  et:enemyDeBuff{src}` per member; the `et:team <- src:* et:own` total; and the
  non-stacking protocol (`qt:stackTmp = cmpNE(stackIn,0,i+1)`, `qt:stackOut =
  cmpEq(max-over-team stackTmp, i+1, stackIn)`), which keeps only the
  highest-priority source's value -- deliberately outside `sheet:agg` to match the
  `addOnce` read.

## Cycle-Prevention Discipline

Identical in spirit to GI: the type system permits cycles; acyclicity is upheld
by a tag-category hierarchy and downward-only redirects. The two rules (neither
compiler-enforced):

**(a) When a redirect changes a tag category, do not erase the other categories
unless another category also changes.** Dropping a category widens the match and
can fold the read back onto itself.

**(b) When a redirect changes a tag category, it most often also changes another
category lower in the hierarchy.** Hierarchies:

- `qt:` stat layer: `final` > `premod` > `base`; each reads only strictly lower
  layers.
- `sheet:`: `agg` > `iso` > `static`, with `agg` gathering from `char`,
  `lightCone`, `relic`, `custom`. Relic stats additionally pass `relic <= dyn`,
  a one-way edge. Enemy-side writes rendezvous at the separate `sheet:enemy`
  (the `enemyTag` sheet), kept off the member `agg` so enemy stats cannot feed a
  member's damage read.
- `qt:prep` formulas (`dmg`/`shield`/`heal`/`breakDmg`) are computed before stats
  are ready and may depend only on other preps, `static`, tag values, and
  conditionals; results attach to the formula via `dynTag`.

Add contributions by writing to a layer (`ownBuff.premod.X.add(...)`); move
`qt:`/`sheet:` only downward. Following (a) and (b) keeps the gather graph a DAG
with no runtime cycle check.

## Key files

| File | Role |
| --- | --- |
| `src/data/util/tag.ts` | `ownTag`/`enemyTag`, `Desc`s, `convert`, accessors |
| `src/data/util/read.ts` | `Tag` type, `Read` class, reader |
| `src/data/util/listing.ts` | stats, sheets, elements, damage types, paths, members |
| `src/data/util/sheet.ts` | `register`/`registerBuff`/`registerBuffFormula`/... |
| `src/data/common/index.ts` | static glue: sheet + stat hierarchy |
| `src/data/common/{dmg,prep}.ts` | damage multipliers; formula entry points |
| `src/util.ts` | dynamic glue: char/relic/lightCone/team entries |
| `src/data/index.ts` | assembly: entries -> keys/values |
