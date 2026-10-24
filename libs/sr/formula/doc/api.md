# Authoring API

The surface formula authors write in `data/char/*`, `data/relic/*`,
`data/lightCone/*`. The accessor/modifier mechanics (`own`/`ownBuff`/...,
`.add`/`.reread`/`.sheet`/`.name`, conditionals, `addOnce`, `percent`) match GI
-- see its [authoring API](../../../gi/formula/doc/api.md). The tags these
produce are documented in [tags.md](./tags.md). SR specifics, each pointing at
the tag section it touches:

- **Accessors** -- the usual `own`/`team`/`target`/`enemy` and `ownBuff`/
  `teamBuff`/`notOwnBuff`/`enemyDebuff`/`userBuff`, plus `semiOwn`/`semiOwnBuff`,
  which retain `dst:` so a buff owned by one character scales off another's
  stats. Their `sheet:`/`accu` come from the query's `Desc`
  ([Query and sheet aggregation](./tags.md#query-and-sheet-aggregation-desc));
  the `et:`/`sheet:` meanings are in gi's
  [Entry Type and Sheet Specifier](../../../gi/formula/doc/tags.md#entry-type-and-sheet-specifier).
- **Entity / formula helpers** ([sheet.ts](../src/data/util/sheet.ts)) --
  `customDmg`/`customShield`/`customHeal`/`customBreakDmg` register a top-level
  `qt:formula` query (`q:dmg`/`shield`/`heal`/`breakDmg` -- see the query-type
  list under
  [Query and sheet aggregation](./tags.md#query-and-sheet-aggregation-desc));
  `customDmg` splits a hit into `name:<name>_<i>` entries; the `dmgTag` argument
  carries `damageType1`/`damageType2`/`elementalType`, which `registerFormula`
  applies to the formula's tag. `isSemiOwn:true` routes through
  `semiOwnBuff`. `dmg`/`shield`/`heal` (`char/util.ts`) are the level-scaling
  builders an author reaches for first -- they build the base node from a stat +
  level-scaling array and call the `custom*` helpers. `getBaseTag(data_gen)`
  returns the char's default `DmgTag` (its `elementalType`) to pass into them;
  `isBonusAbilityActive(baIndex, node)` gates a value behind a bonus ability.
- **Entity assembly** -- `entriesForChar(data_gen)` (`char/util.ts`),
  `entriesForRelic(...)` (`relic/util.ts`), and `entriesForLightCone(...)`
  (`lightCone/util.ts`) emit the entity's base/passive stat contributions and its
  `listing` entries.
- **Sheet registration** -- `register(<sheet>, ...)` stamps the write-side
  `sheet:` and rewrites `et:enemy` to `et:enemyDeBuff`;
  `registerRelic`/`registerLightCone` use `registerEquipment` (dual
  `relic`/`lightCone` + specific-key entries). `registerBuff`/
  `registerBuffFormula` add `et:display name:<name>` copies to the `listing.buffs`
  (and `.formulas`) listings.

Gathering and the cycle-prevention discipline are described in
[tags.md](./tags.md#gathering-and-the-glue).
