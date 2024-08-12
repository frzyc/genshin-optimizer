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
As an example, to calculate the current character's skill talent level, use `read({ et:self qt:char q:skill sheet:agg }, 'sum')` or simply `self.char.skill`.
For more details on `et:` and `sheet:` see below.

We split query identifier into `qt:` and `q:` to simplify formula specifications.
Some formulas apply to a large group of queries, most of which having a common `qt:` by design, e.g.,
all `qt:premod` stats include the value from `qt:base` stats.

## Top-level Formulas and Prep Phase

Top-level formulas are queries that are used directly by the UI, e.g., character's dmg formula.
They are identified by `qt:formula`, and are declared in [prep.ts](../src/data/common/prep.ts).
We assume the following tags (in addition to `qt:formula`) to exist for the top-level formulas,

- `q:dmg`: `et:self sheet: name: move:`,
- `q:heal`: `et:self sheet: name:`,
- `q:shield`: `et:self sheet: name: ele:`,
- `q:trans/swirl`: `et:self sheet: name: ele: trans:`.

Most of these formulas begin by preparing appropriate tags for the rest of the formulas.
Tags (such as dmg element `ele:`) are assumed to exist throughout the formula specification, but computing the correct value requires a calculator.
So it cannot be set prior to calculator creation.
Instead, we calculate them while the tags are not assumed ready, hence the `prep` phase, identified by `qt:prep`.
In this phase, the formulas are more restricted in the avilable tags (e.g., `qt:prep q:ele` cannot use `ele:`).
Once `prep:` calculation is completed, the tags are attached to the base formula via `dynTag`.

## Entry Type and Sheet Specifier

The tag categories `et:` and `sheet:` are separated into read-side, which is used by `read` operations, and write-side, which is used as tags in tag database entries.

- Read-side `et:` specifies whether the query computes the current character stat (`et:self`), team-wide stat (`et:team`), the stat of the buff target (`et:target`), or the common enemy stat (`et:enemy`).
- Write-side `et:` specifies whether the entry applies only to the current character (`et:selfBuff`), the entire team (`et:teamBuff`), other members (`et:notSelfBuff`), or the enemy (`et:enemy`).
- Read-side `sheet:` speficies the sheets to include in gathering, whether to gather all sheets from all members (`sheet:agg`), only character sheets of the current member (`sheet:iso`), or common listing outside of any specific sheets (`static`).
- Write-side `sheet:` specifies the sheet the entry belongs to (`sheet:<char key>/<weapon key>/<art>`), or if the entry is a UI custom formula (`sheet:custom`).

Every query starts with a read-side `sheet: et:` combination.
The gathering operation then maps to the appropriate write-side `sheet: et:` via util functions.
Following is the gathered entries on different `sheet: et:` combinations:

- `sheet:agg et:self` queries (e.g., `self.char.skill`)
  - `{ sheet:agg et:self  } <= { sheet:custom }` (`data/common/index.ts`)
    - Custom contributions
  - `{ src:<src> sheet:agg } <= { src:* dst:<src> et:selfBuff/teamBuff/notSelfBuff }` (`teamData`)
    - `{ src:<src> sheet:agg } <= { sheet:<char key/weapon key/art> }` (`char/weapon/artData` with `withMember`)
      - Sheet-specific contributions from appropriate members `src: dst:` and write-side `sheet: et:`
  - No sheet-specific contributions at top-level as the sheet selection above are wrapped within `withMember`.
    So those formulas are only included when `teamData` adds the correct `src:` with `reread` above
- `et:self sheet:iso` queries (e.g., `self.char.lvl`)
  - `{ sheet:agg et:self } <= { sheet:custom }` (`data/common/index.ts`)
    - Custom contributions
  - `{ sheet:iso } <= { sheet:<char key> et:self }` (`charData` with `withMember`)
    - `et:self` contributions from the current character
- `et:team sheet:agg/iso` queries (e.g., `team.final.atk`)
  - `{ et:team } <- { src:* et:self }` (`teamData`)
    - `et:self` query from each member with the same `sheet:`
- TODO: `et:enemy sheet:enemy`, `sheet:static`, and `sheet:dyn`

Notes:

- `sheet:iso` contributions use `et:self` instead of `et:selfBuff`.
- Artifact use `sheet:art` instead of `sheet:<artifact name>` as all artifacts are always included together. This helps reduce the `read` needed due to the sheer number of artifacts.
  - `sheet:<artifact name>` is used only for counting the number equipped artifact of that set.

## Conditionals

Conditional query tags are of the form

```
{
  et: 'self', qt: 'cond', // Fixed tags
  sheet:<sheet>, q:<cond name>, // Conditional identifier
  src:<src>, // Character that is applying (src:) buff
  dst:<dst>, // Character that is receiving (dst:) buff
  // Unused tags
  name:null, region:null, ele:null, move:null,
  trans:null, amp:null, cata:null
}
```

Since the tag requires both `src:` and `dst:`, conditionals are only valid when both are guaranteed to exist.
A notable class of entries that satisfy the condition are entries with `et:selfBuff/teamBuff/notSelfBuff/enemyDebuff` tags.
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
