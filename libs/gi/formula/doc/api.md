# Authoring API

The surface formula authors write in `data/char/*`, `data/weapon/*`, and
`data/artifact/*`. Each helper is a shortcut for tags defined in
[tags.md](./tags.md); the relevant tag section is linked from each item, rather
than repeating the tag shapes here.

- **Query accessors** ([tag.ts](../src/data/util/tag.ts)) -- `own`, `team`,
  `target`, `enemy` (read) and `ownBuff`, `teamBuff`, `notOwnBuff`,
  `enemyDebuff`, `userBuff` (write). Each is a `convert(...)` of `ownTag`/
  `enemyTag` that fixes `et:`/`dst:`/`src:` and, from the query's `Desc`, its
  `sheet:`/`accu` (see [Query](./tags.md#query) and
  [Sheet aggregation](./tags.md#sheet-aggregation-desc)); the `et:`/`sheet:`
  meanings are under
  [Entry Type and Sheet Specifier](./tags.md#entry-type-and-sheet-specifier). So
  `ownBuff.premod.atk_.add(x)` writes the `qt:premod q:atk_` tag and
  `own.final.atk` reads `qt:final q:atk`. `.sheet(k)`/`.name(n)`/an optional
  category (`own.final.dmg_[ele]`) override that tag
  ([Optional Tags](./tags.md#optional-tags)); `X.reread(Y)` emits the `X <= Y`
  redirection. The same readers also expose the chaining used by the glue and
  buff sites: `.sum`/`.prod`/`.min`/`.max` pick the read accumulator
  (overriding the query's `Desc`); `.with(cat, v)`, `.withTag({...})`, and
  `.withAll(cat, [])` narrow or open tag categories; `.add(x)`/`.addOnce(...)`
  emit write entries. `readStat(read, statKey)` resolves a stat key to the right
  read (handling `dmg_`/`<ele>` shapes).
- **Formula helpers** -- `dmg(...)`/`shield(...)`/`fixedShield(...)`
  (`char/util.ts`) and `customDmg`/`customShield`/`customHeal`
  ([sheet.ts](../src/data/util/sheet.ts)) register a top-level `qt:formula`
  query (`q:dmg`/`shield`/`heal`, with the `name:`/`move:`/`ele:` and `prep` tags
  it needs) -- see
  [Top-level Formulas and Prep Phase](./tags.md#top-level-formulas-and-prep-phase).
  `dmg`/`shield` scale off a stat; `fixedShield` takes an already-computed value.
- **Entity assembly** -- `entriesForChar`/`entriesForWeapon` emit the entity's
  `base`/`premod` stat contributions and its `listing.formulas` listing entries;
  they do not register a `qt:formula` of their own.
- **Sheet registration** -- `register(<key>, ...)` /
  `registerArt(<setKey>, ...)` stamp the write-side `sheet:` (`<key>`, or both
  `art` and `<setKey>` for artifacts) and rewrite `et:enemy` to `et:enemyDeBuff`;
  authors use the `*Buff` variables and let `register` fix `et:` (note under
  [Entry Type and Sheet Specifier](./tags.md#entry-type-and-sheet-specifier)).
  `artCount` is `own.common.count.sheet(<setKey>)`.
- **Conditionals** -- each factory takes the owning `sheet` and returns a record
  keyed by conditional name; the per-name value is the `qt:cond` read wrapped in
  helpers that gate buffs:
  - `allBoolConditionals(sheet, ignored?)` -> `{ ifOn(node, off?), ifOff(node) }`.
  - `allListConditionals(sheet, list, ignored?)` -> `{ map(table, def?), value }`
    (`map` subscripts the selected list index).
  - `allNumConditionals(sheet, int_only?, min?, max?, ignored?)` -> the read
    itself (the entered number).

  `ignored` (`'both'|'src'|'dst'|'none'`) drops `src:`/`dst:` from the cond tag
  when the buff is member-agnostic. `conditionalEntries(sheet, src, dst)` writes
  the chosen value; tag shape in [Conditionals](./tags.md#conditionals).
- **Non-stacking** -- `teamBuff.<stat>.addOnce(sheet, v)` keeps only the
  highest-priority source ([Non-Stacking](./tags.md#non-stacking-readaddonce)).
  `percent(x)` wraps a value as `{ qt:misc q:_ }`.
- **Sheet-local statics** -- `allStatics(sheet)` returns a reader keyed by `q:`
  over that sheet's `qt:misc et:own` values, so an author reads back constants the
  sheet itself defined (paired with `userBuff`/`percent` writes).

Once authored, entries are gathered into final values by the glue described in
[tags.md -- Gathering and the glue](./tags.md#gathering-and-the-glue), under the
[cycle-prevention discipline](./tags.md#cycle-prevention-discipline).
