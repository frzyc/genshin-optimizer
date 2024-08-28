# Tag Architecture

Tag categories in this module identifies the calculation as follows

- `name:` the top-level formula
- `preset:` TODO _Do we remove this?_
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
  - The sheet the entry belongs to (`sheet:<char key>/<weapon key>/<art>`), or
  - That the entry is a UI custom formula (`sheet:custom`).

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
- `sheet:static et:own/enemy` (e.g., `own.commin.critMode`)
  - Non-sheet contributions from the same tag
- `et:team sheet:agg/iso` queries (e.g., `team.final.atk`)
  - `{ et:team } <- { src:* et:own }` (`teamData`)
    - `et:own` query from each member (with the same `sheet:`)

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

## Mechanisms

### Formula Listing

TODO

### Non-Stacking (`Read.addOnce`)

TODO

### Priority String

TODO

### `meta.ts` generation

TODO
