# Authoring API

The surface formula authors write in `data/{char,wengine,disc}/sheets/*`. The
accessor/modifier mechanics (`own`/`ownBuff`/..., `.add`/`.reread`/`.sheet`/
`.name`, conditionals, `addOnce`, `percent`) match GI -- see its
[authoring API](../../../gi/formula/doc/api.md). The tags these produce are
documented in [tags.md](./tags.md). ZZZ specifics, each pointing at the tag
section it touches:

- **Accessors** -- `own`/`team`/`target`/`enemy` and `ownBuff`/`teamBuff`/
  `notOwnBuff`/`enemyDebuff`/`userBuff`; `sheet:`/`accu` come from the query's
  `Desc` ([Query and sheet aggregation](./tags.md#query-and-sheet-aggregation-desc)),
  and `et:`/`sheet:` meanings from gi's
  [Entry Type and Sheet Specifier](../../../gi/formula/doc/tags.md#entry-type-and-sheet-specifier).
  `.addWithDmgType('basic', v)` sets both `damageType1` and `damageType2`; note
  `Read.add` rejects a bare `dmg_` write carrying none of
  `attribute`/`skillType`/`damageType1`/`damageType2`.
- **Entity / formula helpers** ([sheet.ts](../src/data/util/sheet.ts)) -- the
  `custom*` family registers a top-level `qt:formula` query (see the `formula`
  query-type list under
  [Query and sheet aggregation](./tags.md#query-and-sheet-aggregation-desc)):
  `customDmg` -> `q:standardDmg`, `customSheerDmg` -> `q:sheerDmg`,
  `customAnomalyDmg` -> `q:anomalyDmg`, `customAnomalyBuildup` -> `q:anomBuildup`,
  `customDaze` -> `q:dazeBuildup`, `customShield` -> `q:shield`, `customHeal` ->
  `q:heal`. Each adds `ownBuff.formula.base <- base` tagged `name:<name>`; the
  `dmgTag` argument carries `damageType1`/`damageType2`/`attribute`/`skillType`,
  applied to the formula's tag.
- **Char damage builders** ([char/util.ts](../src/data/char/util.ts)) -- the
  primary entry point is `registerAllDmgDazeAndAnom(key, mappedStats, ...overrides)`,
  which auto-generates every skill's dmg + daze + anomaly-buildup triple from the
  datamine. Per-hit customization is passed as `dmgDazeAndAnomOverride(mappedStats,
  skillType, name, hitNumber, dmgTag, stat, arg?, ...extra)` entries (each builds
  one hit via `dmgDazeAndAnom`). Build an ability's triple directly with
  `dmgDazeAndAnom(skillParam, name, dmgTag, stat, abilityScalingType, arg?, ...extra)`
  or its multi-hit merge `dmgDazeAndAnomMerge([...skillParams], ...)`. `shield`/
  `heal` are the level-scaling shield/heal builders (stat + scaling arrays ->
  `customShield`/`customHeal`). `getBaseTag(data_gen)` returns the char's default
  `DmgTag` (its `attribute`).
- **Entity assembly** -- `entriesForChar(data_gen)` (`char/util.ts`),
  `entriesForWengine(key)` (`wengine/util.ts`), and `entriesForDisc(key)`
  (`disc/util.ts`) emit the entity's base/core stat contributions and `listing`
  entries. `cmpSpecialtyAndEquipped(key, num)` / `showSpecialtyAndEquipped(key)`
  (`wengine/util.ts`) gate a wengine buff (and its listing) on the engine being
  equipped and matching the wielder's specialty.
- **Sheet registration** -- `register(<sheet>, ...)` stamps the write-side
  `sheet:` and rewrites `et:enemy` to `et:enemyDeBuff`. `registerBuff` (with
  `includeOriginalEntry`) and `registerBuffFormula` add `et:display name:<name>`
  copies to the `listing.buffs` (and `.formulas`) listings; equipment sheets are
  wired via the `registerWengine`/`registerDisc` wrappers around
  `registerEquipment`, which emits each `reread`/`tag`/`read` entry under both the
  shared equipment sheet (`wengine`/`disc`) and the specific set key (see
  [Gathering and the glue](./tags.md#gathering-and-the-glue)).

Gathering and the cycle-prevention discipline are described in
[tags.md](./tags.md#gathering-and-the-glue).
