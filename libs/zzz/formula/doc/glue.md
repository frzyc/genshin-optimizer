# ZZZ glue tags

> Verified 2026-06-05 against source (`libs/zzz/formula/src/...`); line refs below.
> Expands the "Gathering and the glue" section of the (generated, unverified)
> [tags.md](./tags.md) with the actual redirections. "Glue" = the `reread` entries
> that wire each sheet's contributions into the aggregation points a `read`
> resolves against.

## The one primitive: `reread` = `X <= Y`

`X.reread(Y)` emits a redirection entry: when the calculator gathers tag `X`, it
also gathers `Y` (recursing into `cache.with(Y.tag)`) and splices those results in
(engine `calc.ts` `_gather`; propagation.md). Everything below is built from this
plus plain `.add(value)` writes. A `read` at tag `T` gathers every entry whose tag
is a subset of `T`, folded by the query's accumulator (the `Desc`, see tags.md) --
so glue never has to name a consumer; it just adds contributions under a tag the
consumer's read will subset-match.

## Sheet aggregation model

`sheet:` is the rendezvous dimension. A read fixes which `sheet:` it wants, and the
glue routes contributions into it (`util/tag.ts:38-70`):

```
sheet  | Team Buff | Disc | Reaction | W-Engine | Char | Custom
agg    |   YES     | YES  |   YES    |   YES    | YES  |  YES
iso    |    -      |  -   |    -     |    -     | YES  |  YES
static |    -      |  -   |    -     |    -     |  -   |   -
```

`sheets` (`util/listing.ts:97-110`): the rendezvous buckets `agg`/`iso`/`static`;
the per-entity sheets (every `CharacterKey`, `WengineKey`, `DiscSetKey`); the role
buckets `char`/`wengine`/`disc`; the optimizer seam `dyn`; user `custom`; and
`commonSheets` (`enemy`, `anomaly`). The glue moves contributions *up* the bucket
hierarchy (`agg` gathers from `iso`/per-entity; never the reverse), which is what
keeps the gather acyclic.

## Static glue -- `data/common/index.ts`

Assembled once. Imports the pipeline (`dmg`, `prep`, `anomalyBuildup`, `anomaly`,
`daze`; lines 18-22), then:

| line | redirection / write | effect |
| --- | --- | --- |
| 24 | `iso et:own <= custom` | user custom buffs into the iso layer |
| 25 | `agg et:own <= custom` | user custom buffs into the agg layer |
| 28-30 | `agg et:teamBuff <= anomaly` | anomaly (reaction) buffs as team buffs into agg |
| 35-37 | `agg <= char` | char-sheet contributions into agg |

`agg <= wengine` and `agg <= disc` are deliberately **not** here -- they are added
per-equipment in `util.ts` (opt-in, to cut `read` traffic; lines 33-34 comment).

### The four-layer stat waterfall

`base -> initial -> combat -> final`, two ways depending on the stat
(`flatAndPercentStats = atk def hp impact anomProf anomMas enerRegen`,
`util/listing.ts:49-57`):

- flat+percent stats (lines 41-56):
  - `initial X = base X * (1 + initial X%)`
  - `final X = initial X * (1 + combat X%) + combat X`
- single-variant stats, except `sheerForce` (lines 61-70):
  - `initial X += base X` (forced add, `true`, to bypass the `dmg_` guard)
  - `final X = initial X + combat X`
- `sheerForce` special-cased (lines 72-88): `initial = initial.atk * 0.3` for the
  `rupture` specialty; `combat = (final.atk - initial.atk) * 0.3`; `final =
  initial + combat`.

Then (lines 90-96) `cappedCrit_ = clamp(final.crit_, 0, 1)` and
`anom_cappedCrit_ = clamp(final.anom_crit_, 0, 1)`, and (98-101) every `qt:cond`
defaults to `0` (`reader.with('qt','cond').add(0)`).

## Dynamic glue -- `src/util.ts` (built per character / equipment / team)

### Character (`charTagMapNodeEntries`, 51-85)

- `char <= sheet:<charKey>` and `iso <= sheet:<charKey>` (67-68): route a specific
  character's authored sheet into the `char` and `iso` buckets.
- writes identity + ability levels (`lvl`, `basic`, ..., `mindscape`, `potential`).
- default `base.crit_ = 0.05`, `base.crit_dmg_ = 0.5` (82-83).

### W-engine (`wengineTagMapNodeEntries`, 87-112)

- opt-in `agg <= wengine` (99-101) -- only added when a wengine is equipped.
- `common.count.sheet(<wengineKey>) += 1`, plus `wengine.lvl/modification/phase`.

### Disc (`discTagMapNodeEntries`, 114-141) -- includes the optimizer seam

- opt-in `agg <= disc` (124-126).
- **`dyn` detachment hook** (128-135): `disc qt:initial <= dyn`, and each disc
  main/sub stat is written at `sheet:dyn` (`getStatFromStatKey(initial, k).sheet('dyn').add(v)`).
  Routing disc stats through a dedicated `sheet:dyn` lets the solver `detach` those
  reads and feed candidate values at runtime, *after* the nodes are optimized --
  this is the seam between the formula graph and `prune`/the compiled kernel.
- `count.sheet(<discSetKey>) += n` for set-bonus counting.
- `discsToTagMapNodeEntries` (143-157) just tallies an `IDisc[]` into stats/sets
  and calls the above.

### Team (`teamData`, 159-209) -- the src/dst member dimension

All entries are `sheet:agg`-scoped reads over the `src`/`dst` member axis:

| lines | redirection | meaning |
| --- | --- | --- |
| 166-170 | `target (dst) <= own (src=dst)` | reading a target's stat reads that member's own stat |
| 172-177 | each `own(src=dst) <= teamBuff(dst,src)` over all member pairs | gather every member's team buffs onto each member |
| 179-186 | `own(src=dst) <= notOwnBuff(dst,src)` for `src != dst` | buffs that apply to everyone but the source |
| 188-192 | `enemy <= enemyDeBuff(src)` per member | each member's debuffs onto the enemy |
| 207-208 | `et:team <= own(src)` per member | total-team stat = sum over members' own |

**Non-stacking** (193-205), implemented manually (not via `addOnce`): for member
`i` (priority `i+1`, so `0` = no buff),
- `qt:stackTmp = cmpNE(stackIn, 0, i+1)` -- this member's priority if it supplies the buff;
- `qt:stackOut = cmpEq(max over team of stackTmp, i+1, stackIn)` -- emit `stackIn`
  only if this member holds the team-max priority. So only the highest-priority
  source's value survives. (The comment notes this mirrors the `reader.addOnce`
  side used elsewhere; the `max ... et:team` is the cross-member rendezvous.)

## Assembly -- `data/index.ts`

`data = char + disc + wengine + common` (13-18); `compileTagMapKeys` orders the
categories `qt`, `q`, a gap, then `fixedTags` (`preset src dst et sheet attribute
skillType damageType1 damageType2 specialty faction`), then `name` (19-28);
`compileTagMapValues(keys, data)` packs it (29).

## Cycle-prevention discipline (why this is acyclic without a runtime check)

From tags.md, and visible in the redirections above: contributions only move
*downward* -- `sheet:` `agg > iso > static` (agg gathers from per-entity/char/
custom, never the reverse); `qt:` stat layers `final > combat > initial > base`
(each reads strictly lower); `et:enemy` writes are fixed to `et:enemyDeBuff` so
enemy stats cannot feed enemy-damage reads; `qt:prep`/`prepProd` formulas resolve
before stats. Add by writing to a layer; move `sheet:`/`qt:` only downward.

## Canopy implications

The glue *is* the open-world gather, so it is exactly the part the closed-world
canopy model must remodel:

- Each `X <= Y` reread becomes "fold Y's contributions into X's coordinate"
  (`c.x = sum(c.x, contribution)`). The converter must know *all* contributors,
  which subset-matching never required it to enumerate -- the core migration work.
- The `sheet:` dimension (`agg`/`iso`/`static` + per-entity) collapses into
  coordinate identity plus explicit accumulation folds; the per-entity sheets
  become the contribution sources feeding `agg`'s fold.
- The `src/dst` member axis becomes per-member coordinate subtrees; cross-member
  reads (team buff / target / total-team) become reads into another member's
  subtree. Non-stacking becomes a team-max read plus a `branch` gate.
- The `sheet:dyn` detachment hook maps directly onto the `onDyn` candidate-`read`
  lowering (`lower.ts`): disc stats are the solver candidates, so their canopy
  `dyn` coordinates are the ones `onDyn` emits a `read` for, while everything else
  inlines.
