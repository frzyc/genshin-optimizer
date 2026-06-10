# Tag Architecture

This documents the **tags** themselves. For the authoring API that produces and
reads these tags, see [api.md](./api.md).

## In short

A **tag** is a record of `category: value` pairs. A `read` names a *query* -- the
value to compute -- as `qt:`/`q:`, plus the context that selects which
contributions count: `et:` (whose stat), `sheet:` (which sources to gather), the
member pair `src:`/`dst:`, and optional `move:`/`ele:`/reaction tags. Separate
*glue* files wire values together with `reread` redirections (`X <= Y`); every
redirect points only **downward** a fixed hierarchy (`qt:` final > premod > base;
`sheet:` agg > iso > static), which keeps the gather graph acyclic. Authors never
write raw tags -- they use the typed accessors in [api.md](./api.md); this file
is what those compile to, and how the pieces interact. The rest of this document
expands each piece: the [query](#query) (`qt:`/`q:` + [Desc](#sheet-aggregation-desc)),
[entity/sheet sides](#entry-type-and-sheet-specifier) with the full per-combo
gather list, [conditionals](#conditionals), [optional tags](#optional-tags), the
[glue](#gathering-and-the-glue), and the [cycle-prevention rules](#cycle-prevention-discipline).

The tag categories, and what each identifies:

- `name:` the top-level formula
- `preset:` the optimization preset slot (`preset0`..`presetN`, game-opt
  `listing.ts`); `withPreset(preset, ...data)` (`util.ts`) stamps it onto entries
  so several loadouts can coexist in one tag database for comparison. (Marked for
  review -- it may be removed if presets move out of the tag layer.)
- `src:` the character that is applying buffs
- `dst:` the character that is receiving buffs
- `sheet:` the sheet that contains the formula
- `et:` the entry type
- `qt:` and `q:` the query

- `region:` the region of the character
- `move:` the type of the current dmg formula
- `ele:` the element of the current formula
- `trans:` the transformative reaction
- `amp:` the amplifying reaction
- `cata:` the catalytic reaction

String representation of a tag (computed using `tagStr`) is of the form

```
{ #{name} {preset} {src} ({dst}) {sheet} {et} {qt}.{q} | {region} {move} {ele} {trans} {amp} {cata} }
```

Missing tags are omitted.

## Query

The current computation, called query, is identified by `qt: q:`.
It is always set when performing a `read` operation, and valid query combinations are specified in `data/util/tag.ts`.
All queries assume a certain `et: sheet:` and `accu` upon read, which is specified by `Desc` and enforced via `convert` (both declared in `tag.ts`).
As an example, to calculate the current character's skill talent level, use `read({ et:own qt:char q:skill sheet:agg }, 'sum')` or simply `own.char.skill`.
For more details on `et:` and `sheet:` see below.

We split query identifier into `qt:` and `q:` to simplify formula specifications.
Some formulas apply to a large group of queries, most of which having a common `qt:` by design, e.g.,
all `qt:premod` stats include the value from `qt:base` stats.

The full `qt:` vocabulary is the `queryTypes` set in `tag.ts`. Besides the stat
layers (`base`/`premod`/`final`/`weaponRefinement`), the entity groups
(`char`/`weapon`/`common`/`reaction`/`trans`/`dmg`/`prep`), and the top-level
`formula`/`listing` groups, it includes three cross-cutting `qt:`s that a read may
carry and that participate in the global gather:

- `qt:cond` -- conditional reads (see [Conditionals](#conditionals)).
- `qt:misc` -- the type-agnostic carrier `q:_`; `percent(x)` tags a value as
  `{ qt:misc q:_ }`, and `allStatics(sheet)` reads a sheet's `qt:misc` constants.
- `qt:stackIn` / `qt:stackTmp` / `qt:stackOut` -- the non-stacking protocol (see
  [Non-Stacking](#non-stacking-readaddonce)).

### Sheet aggregation (`Desc`)

Each query is declared with a `Desc = { sheet, accu? }` in [tag.ts](../src/data/util/tag.ts).
The `sheet:` in the `Desc` is the query's _rendezvous point_: the sheet at which the
correct final value is gathered. Three rendezvous levels are used, differing in which
sources they gather:

```
*--------*-----------------------------------------------------*
|        |                      Affected By                    |
| sheet: *-----------*-----*----------*--------*------*--------*
|        | Team Buff | Art | Reaction | Weapon | Char | Custom |
*--------*-----------*-----*----------*--------*------*--------*
|  agg   |    YES    | YES |   YES    |  YES   | YES  |  YES   |
|  iso   |     -     |  -  |    -     |   -    | YES  |  YES   |
| static |     -     |  -  |    -     |   -    |  -   |   -    |
*--------*-----------*-----*----------*--------*------*--------*
```

The named `Desc`s are:

- `agg` = `{ sheet:'agg', accu:'sum' }` -- aggregates every source. Stats, buffs.
- `aggStr` = `{ sheet:'agg' }` -- agg without a numeric accumulator (formula listings).
- `iso` / `isoSum` = `{ sheet:'iso' (accu:'sum') }` -- character + custom only. Identity
  (`char.lvl`, `char.ele`) and per-character counts.
- `fixed` = `{ sheet:'static' }` -- sheet-agnostic; computed once from same-tag inputs
  (`common.critMode`, `dmg.out`).
- `prep` = `{ sheet:undefined }` -- no rendezvous yet; resolved during the prep phase
  (see below).

`convert` (tag.ts) reads each `Desc` and binds the read's `sheet:`/`accu` accordingly, so
authors never spell out `sheet:` for ordinary queries -- `own.premod.atk` already carries
`sheet:agg accu:sum`. Gathering across these levels is wired up separately (see
[Gathering and the glue](#gathering-and-the-glue)).

A `Desc` may override `accu` per query even at the `agg` level. The notable
exception is `reaction.ampMulti` = `{ ...agg, accu:'prod' }`: amplifying-reaction
multipliers from different sources compose multiplicatively, so its `agg` gather
folds with `prod` rather than `sum`. Such per-query `accu` overrides are declared
inline in the `tag.ts` query table.

## Top-level Formulas and Prep Phase

Top-level formulas are queries that are used directly by the UI, e.g., character's dmg formula.
They are identified by `qt:formula`, and are declared in [prep.ts](../src/data/common/prep.ts).
We assume the following tags (in addition to `qt:formula`) to exist for the top-level formulas,

- `q:dmg`: `et:own sheet: name: move:`,
- `q:heal`: `et:own sheet: name:`,
- `q:shield`: `et:own sheet: name: ele:`,
- `q:trans/swirl`: `et:own sheet: name: ele: trans:`.

Most of these formulas begin by preparing appropriate tags for the rest of the formulas.
Tags (such as dmg element `ele:`) are assumed to exist throughout the formula specification, but computing the correct value requires a calculator.
So it cannot be set prior to calculator creation.
Instead, we calculate them while the tags are not assumed ready, hence the `prep` phase, identified by `qt:prep`.
In this phase, the formulas are more restricted in the avilable tags (e.g., `qt:prep q:ele` cannot use `ele:`).
Once `prep:` calculation is completed, the tags are attached to the base formula via `dynTag`.

## Entry Type and Sheet Specifier

The tag categories `et:` and `sheet:` are separated into read-side, which is used by `read` operations, and write-side, which is used as tags in tag database entries.

- Read-side `et:` specifies whether the query computes
  - The current character stat (`et:own`),
  - Team-wide stat (`et:team`),
  - The stat of the buff target (`et:target`), or
  - The common enemy stat (`et:enemy`).
- Write-side `et:` specifies whether the entry applies
  - To the current character (`et:own`),
  - To the entire team (`et:teamBuff`, inside sheets only),
  - To other members (`et:notOwnBuff`, inside sheets only), or
  - To the (common) enemy (`et:enemyDeBuff` inside sheets and `et:enemy` outside sheets).
- Read-side `sheet:` speficies the sheets to include in gathering, whether to gather
  - All sheets from all members (`sheet:agg`),
  - Only character sheets of the current member (`sheet:iso`), or
  - Common listing outside any specific sheets (`static`).
- Write-side `sheet:` specifies
  - The sheet the entry belongs to (`sheet:<char key>/<weapon key>/<art>`),
  - That the entry is a UI custom formula (`sheet:custom`),
  - The cross-team resonance sheet (`sheet:reso`), gathered into every member's
    `sheet:agg` as a team buff (see the resonance reread below), or
  - The common-enemy sheet (`sheet:enemy`), the rendezvous for `enemyTag` writes,
    kept off the member `agg`.

Note that some tags are both read- and write-sides.
Every query starts with a read-side `sheet: et:` combination.
The gathering operation then maps to the appropriate write-side `sheet: et:` via util functions.
Following is the gathered entries on different `sheet: et:` combinations:

- `sheet:agg et:own` queries (e.g., `own.char.skill`)
  - Non-specific non-sheet contributions
  - `{ sheet:agg et:own } <= { sheet:custom }` from `data/common/index.ts`
    - Custom contributions
  - `{ sheet:agg } <= { sheet:<char key/weapon key/art> }` from `char/weapon/artData` with `withMember`
    - Sheet-specific `et:own` contributions from appropriate members
    - (Artifact only) `{ sheet:art qt:premod } <= { sheet:dyn }`
      - Hook for conversion to untagged graph.
  - `{ src:<src> sheet:agg } <= { src:* dst:<src> et:teamBuff/notOwnBuff }` from `teamData`
    - `{ src:<src> sheet:agg } <= { sheet:<char key/weapon key/art> }` from `char/weapon/artData` with `withMember`
      - Sheet-specific `et:*Buff` contributions from appropriate members `src: dst:`
- `sheet:iso et:own` queries (e.g., `own.char.lvl`)
  - Non-specific non-sheet contributions
  - `{ sheet:iso et:own } <= { sheet:custom }` from `data/common/index.ts`
    - Custom contributions
  - `{ sheet:iso } <= { sheet:<char key> }` from `charData` with `withMember`
    - Char-sheet-specific `et:own` contributions from the current character
- `sheet:agg et:enemy` queries (e.g., `enemy.common.defIgn`)
  - `{ src:<src> sheet:agg } <= { src:* dst:<src> et:enemyDeBuff }` from `teamData`
    - `{ src:<src> sheet:agg } <= { sheet:<char key/weapon key/art> }` from `char/weapon/artData` with `withMember`
      - Sheet-specific contributions from appropriate members `src: dst:` and write-side `sheet: et:`
- `sheet:iso et:enemy` queries (unused so far)
  - `{ sheet:iso } <= { sheet:<char key> }` from `charData` with `withMember`
    - Char-sheet-specific contributions from the current character
- `sheet:static et:own/enemy` (e.g., `own.common.critMode`)
  - Non-sheet contributions from the same tag
- `et:team sheet:agg/iso` queries (e.g., `team.final.atk`)
  - `{ et:team } <- { src:* et:own }` (`teamData`)
    - `et:own` query from each member (with the same `sheet:`)
- `et:target` queries (e.g., `target.final.atk` read by a buff that scales off
  its receiver)
  - `{ et:target dst:<dst> } <= { et:own src:<dst> dst:null }` (`teamData`)
    - resolves a target read to that member's own-stat gather

In addition to the per-combo gathers above, `teamData` adds two redirects that do
not correspond to a single read tag:

- **Resonance**: `{ et:own } <= { et:teamBuff sheet:reso name:null }` -- the
  cross-team `sheet:reso` buffs are folded into every member's `sheet:agg`.
- **Non-stacking**: the `qt:stackIn/stackTmp/stackOut` protocol (see
  [Non-Stacking](#non-stacking-readaddonce)), a cross-member read over
  `et:team` that keeps only the highest-priority source.

Notes:

- Write-side `et:*Buff` can only be used inside a sheet as they require the `teamData` entry to insert `src:` and `char/weapon/artData` (with `withMember`) to override `sheet:`.
  Outside of a sheet, `et:own/enemy` must be used instead as the `teamData` entry overrides `et:` in the process.
  - The convention is to use `ownBuff/teamBuff/notOwnBuff/enemyDebuff` _variables_ for all entry creations, and "fix" the `et:` for sheets when it is `register`ed.
- Artifact use `sheet:art` instead of `sheet:<artifact name>` as all artifacts are always included together.
  This helps reduce the `read` needed due to the sheer number of artifacts.
  - `sheet:<artifact name>` is used only for counting the number equipped artifact of that set.

## Conditionals

Conditional query tags are of the form

```
{
  et: 'own', qt: 'cond', // Fixed tags
  sheet:<sheet>, q:<cond name>, // Conditional identifier
  src:<src>, // Character that is applying (src:) buff
  dst:<dst>, // Character that is receiving (dst:) buff
  // Unused tags
  name:null, region:null, ele:null, move:null,
  trans:null, amp:null, cata:null
}
```

Since the tag requires both `src:` and `dst:`, conditionals are only valid when both are guaranteed to exist.
A notable class of entries that satisfy the condition are entries with `et:ownBuff/teamBuff/notOwnBuff/enemyDebuff` tags.
We call those entries _buff context_, as those entries are missing when calculating stats without team information.

> Unused tags are set to `null` when reading conditionals to improve caching.

## Optional Tags

Tags `name: region: move: ele: trans: amp: cata:` (`name:` and everything on the right of `|` in the string representation) are generally not assumed to be present in most formulas.
Instead, it is used to include additions to the current formula.
For example, reading `{ q:dmg_ ele:hydro }` gathers both any-element dmg bonus (`{ q:dmg_ }`) and hydro-only dmg bonus (`{ q:dmg_ ele:hydro }`).
Most formulas also retain these optional tags, so the specified optional tags at a top-level formula also apply to the deeper parts of the formula, e.g., character talent level.

> `name:null` is applied when crossing team buff boundaries to improve caching.

## Gathering and the glue

Authored entries (see [api.md](./api.md)) resolve to concrete tags, and those
tags only connect to each other because separate _glue_ files add the gathering
entries. The glue is imported together with the sheets and assembled in
[data/index.ts](../src/data/index.ts):

```
entries = [ ...common, ...artifact, ...character, ...weapon ]
keys    = compileTagMapKeys([... qt, q, fixedTags..., name ])
values  = compileTagMapValues(keys, entries)
```

Two kinds of glue:

- **Static glue** -- [data/common/index.ts](../src/data/common/index.ts) wires
  the sheet hierarchy and the stat hierarchy with `reread`/`add`:
  - `sheet:agg <= sheet:custom`, `sheet:iso <= sheet:custom` -- fold user input
    into both rendezvous levels.
  - `qt:final <- qt:premod`, `qt:premod <- qt:base (+ weaponRefinement)`,
    `premod X += base X * premod X%` -- the stat waterfall.
  - capped crit, level curves (`subscript(own.char.lvl, ...)`), element counts,
    and `qt:cond` defaulting to 0.
- **Dynamic glue** -- the per-instance util functions in `src/util.ts`:
  `charData` adds **both** `sheet:agg <= sheet:<char>` and `sheet:iso <= sheet:<char>`
  rereads (plus level/talent values and the default crit base); `weaponData` adds
  only `sheet:agg <= sheet:<weapon>` (weapons never feed the `iso` level); `artifactsData`
  adds only `sheet:agg <= sheet:art`
  plus the `sheet:art qt:premod <= sheet:dyn` detachment hook and per-set counts;
  `teamData` adds the cross-member reads (`et:target`/`et:team` and the
  `teamBuff`/`notOwnBuff`/`enemyDeBuff` redirections). `withMember(src, ...)` only
  stamps `src:` onto entries (it is applied by callers wrapping a member's data);
  the `sheet:` override is done by the `reread`s inside the data functions, not by
  `withMember`. This is the per-build wiring; the full gather list per `sheet:/et:`
  combination is enumerated under [Entry Type and Sheet Specifier](#entry-type-and-sheet-specifier).

So a `read` of `own.final.atk` works only because this glue redirects
`sheet:agg qt:final` down to `qt:premod`, down to `qt:base`, and across to every
contributing sheet. Authors never see those redirections; they are the
discipline below.

## Cycle-Prevention Discipline

The tag system permits cycles: nothing in the compiler stops a `read` from
resolving (directly or through rereads) back to itself. Acyclicity is a
convention, maintained by ordering tag categories into a _hierarchy_ and only
ever redirecting _downward_. The two working rules, neither compiler-enforced:

**(a) When a redirect changes a tag category, do not erase the other categories
unless another category also changes.**
Erasing (dropping/`null`-ing) a category widens the match set and can re-include
the entry you are redirecting from -- a self-loop. A safe redirect changes a
category's value (`qt:final -> qt:premod`) while keeping the rest intact, so it
lands on a strictly different, lower node. Drop a category only when a
simultaneous change to another category guarantees you have still moved
downward.

**(b) When a redirect changes a tag category, it most often also changes another
category lower in the hierarchy.**
The hierarchy, highest to lowest:

- `qt:` stat layer: `final` > `premod` > (`base`, `weaponRefinement`). Each layer
  reads only strictly lower layers (`common/index.ts`), never the reverse.
- `sheet:`: `agg` > `iso` > `static`, and `agg` gathers from the concrete sheets
  (`<char/weapon key>`, `art`, `custom`). Reads flow `agg -> iso -> static -> sheet`,
  never back up.
- The prep phase (`qt:prep`) is computed _before_ stats are ready, so its queries
  may depend only on other preps, `static`, tag values (`tagVal`), and
  conditionals -- never on `premod`/`final`. Once resolved, prep values are
  attached to the formula via `dynTag` (see Top-level Formulas and Prep Phase),
  which is a one-way edge into the already-built lower graph.

Concretely: adding a new contribution to a stat means writing to its layer
(`ownBuff.premod.X.add(...)`), not re-pointing `final` at something new; redirects
that move `qt:` or `sheet:` always step down a level. Following (a) and (b)
keeps the gather graph a DAG without any runtime cycle check.

## Mechanisms

### Formula Listing

The UI needs to enumerate what a character/sheet exposes -- which formulas are
selectable optimization targets and which flat buffs to display -- without
evaluating the graph. That registry lives in the `qt:listing` queries: `q:formulas`
(optimization targets) and `q:buffs` (flat, non-scaling buffs), both `aggStr`
(`sheet:agg` with a string accumulator, so they gather string-valued entries from
every sheet without numeric folding).

A listing entry is built with `listingItem(read, cond?)` =
`tag(cond ?? read.ex ?? 'infer', read.tag)` ([sheet.ts](../src/data/util/sheet.ts)):
a string node carrying the *target read's tag*, so the listing records *which* tag
is selectable, not its value. `registerFormula` auto-appends
`ownBuff.listing.formulas.add(listingItem(<the formula>))` for every top-level
formula it registers, and `entriesForChar` appends listing entries for the
character's key display stats (`own.final.atk`, ...). The UI then reads
`own.listing.formulas` (e.g. `calc.listFormulas(...)`) to recover the list of
target tags.

### Non-Stacking (`Read.addOnce`)

Some buffs from multiple copies of the same source must not stack -- only the
highest-priority instance applies. `teamBuff.<stat>.addOnce(sheet, value)`
(game-opt `read.ts`) implements this with the three `qt:stack*` queries and a
per-sheet unique `q` id. It expands to two write entries per source:

1. `ownBuff.stackIn.<q>.add(value)` -- records this source's candidate value.
2. `teamBuff.<stat>.add(own.stackOut.<q>)` -- the buff itself reads the resolved
   winner.

`teamData` then wires the resolution across members (priority `i+1`, so `0` means
"no buff"):

- `ownBuff.stackTmp.<q> = cmpNE(own.stackIn.<q>, 0, i+1)` -- this member's
  priority, if it supplies the buff.
- `ownBuff.stackOut.<q> = cmpEq(team.stackTmp.<q>.max, i+1, own.stackIn.<q>)` --
  emit the value only if this member holds the team-max priority; otherwise 0.

So exactly one source (the highest priority) contributes; the rest resolve to 0.
The `stack*` reads use `et:team`/raw tags rather than `sheet:agg` to avoid a
cycle back through the buff being resolved.

### Priority String

Some categorical results are resolved by *priority*: several sources each propose
a value, and the highest-priority proposal wins (rather than summing). This is
encoded as a subscript table. `priorityTable(entries, default)`
([tag.ts](../src/data/util/tag.ts)) inverts a `{ group: { key: priority } }` map
into a `string[]` indexed by priority -- `table[p]` is the key registered at
priority `p`.

Each candidate source adds its priority into an `...Index` query (read with
`.max`), and the winner is `subscript(<index>.max, table)`, looking up the string
at the highest contributed priority. Example -- elemental infusion
([common/dmg.ts](../src/data/common/dmg.ts)): `infusionPrio` ranks
`physical/hydro/pyro` across `overridable`/`team`/`nonOverridable` tiers;
`reaction.infusionIndex` defaults to `0`, each infusion source adds its priority,
and `reaction.infusion = subscript(own.reaction.infusionIndex.max, infusionTable)`
yields the winning element string. Because the winner is chosen by `max` over a
fixed table, the resolution is order-independent and acyclic.

### `meta.ts` generation

So the UI can know a sheet's conditionals and formula listings without building a
`Calculator`, that metadata is extracted from the entries at build time and
committed as a generated module. The `gen-desc` executor
([executors/gen-desc/executor.ts](../src/executors/gen-desc/executor.ts), run via
the `gen-desc` Nx target) walks the assembled `entries` and extracts two things:

- **Conditionals** -- `extractCondMetadata` (game-opt/formula) collects each
  `qt:cond` entry's `sheet:`/`q:` (the conditional's sheet + name).
- **Formulas** -- `extractFormulaMetadata` matches the formula-listing pattern that
  `registerFormula` emits (`qt:listing q:formulas`, a sheet-specific sheet, a `tag`
  node carrying `name:`/`q:`) and records `{ sheet, name, tag }`.

It writes a `// WARNING: Generated file` module exporting `conditionals` and
`formulas` consts, formatted with `formatText`. The file is regenerated by
`yarn gen-file`; never hand-edit it -- change `data/` and regenerate.
