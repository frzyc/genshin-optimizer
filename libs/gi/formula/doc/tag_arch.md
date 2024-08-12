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
Instead we calculate them while the tags are not assumed ready, hence the `prep`are phase, identified by `qt:prep`.
In this phase, the formulas are more restricted in the avilable tags (e.g., `qt:prep q:ele`, of course, cannot use `ele:` tags).
Once `prep:` calculation is completed, the tags are attached to the base formula via `dynTag`.

## `et:` and `sheet:`

The tag categories `et:` and `sheet:` are separated into read-side, which is used by `read` operations, and write-side, which is used in as tags in tag database entries.

- Read-side `et:` specifies the type of calculation, whether the query computes the current character stat (`et:self`), the common enemy stat (`et:enemy`), team-wide stat (`et:team`), or the stat of the buff target (`et:target`).
- Read-side `sheet:` speficies the sheets that will be used to gather particular query, whether to gather all sheets from all team members (`sheet:agg`), only character sheets of the current character (`sheet:iso`), or common listing outside of any specific sheets (`static`).
- Write-side `et:` specifies the type of entry, whether it is a buff that only applies to the current character (`et:selfBuff`), the entire team (`et:teamBuff`), other members only (`et:notSelfBuff`), or if it is a debuff to enemy (`et:enemy`).
- Write-side `sheet:` specifies the sheet that the entry belongs to (`sheet:<char key>/<weapon key>/<art>`), or if the entry is a UI custom formula (`sheet:custom`).

The query starts with one of the read-side `sheet: et:` combination.
The gathering operation then maps to the appropriate write-side `sheet: et:` via util functions.
Consider a read on a `sheet:agg et:` query (e.g., `self.char.skill`), the following is the entries matched during the gathering

- `{ sheet:agg et:self  } <= { sheet:custom }` (`data/common/index.ts`)
  - Custom contributions
- `{ src:<src> sheet:agg } <= { src:<*> dst:<src> et:selfBuff/teamBuff/notSelfBuff }` (`teamData`, insert the correct `et:`)
  - `{ src:<src> sheet:agg } <= { sheet:<char key/weapon key/art> }` (`charData/weaponData/artData` with `withMember`, select sheets)
    - Chararcter/weapon/artifact-specific `et:selfBuff/teamBuff/notSelfBuff` contributions (from appropriate members `src:` and `dst:`)
- No sheet-specific contributions at top-level as the sheet selection above are wrapped within `withMember`.
  So those formulas are only included when `teamData` adds the correct `src:` with `reread` above

For `et:self sheet:iso` queries, the gathered entries are simpler,

- `{ sheet:agg et:self } <= { sheet:custom }` (`data/common/index.ts`)
  - Custom contributions
- `{ sheet:iso } <= { sheet:<char key> et:self }` (`charData` with `withMember`)
  - `et:self` contributions from the current character

> To avoid collision with `sheet:agg`, `sheet:iso` contributions use `et:self` instead of `et:selfBuff`.

Team-wide queries (`et:team`) utilize the computations of `et:self`, with the following gathered entries,

- `{ et:team } <- { src:* et:self }` (`teamData`)
  - `et:self` query from each member with appropriate `sheet:`

TODO: `et:enemy sheet:enemy`, `sheet:static`, and `sheet:dyn`

## Sheet-Specific formulas

TODO

> Artifact use `sheet:art` instead of `sheet:<artifact name>` as all artifacts are always included together.
> This helps reduce the `read` needed due to the sheer number of artifacts.

## Buffs and Conditionals

TODO

## Optional Tags

Tags `name: region: move: ele: trans: amp: cata:` (`name:` and everything on the right of `|` in the string representation) are generally not assumed to be present in most formulas.
Instead, it is used to include additions to the current formula.
For example, reading `{ q:dmg_ ele:hydro }` gathers both any-element dmg bonus (`{ q:dmg_ }`) and hydro-only dmg bonus (`{ q:dmg_ ele:hydro }`).
Most formulas also retain these optional tags, so the specified optional tags at a top-level formula also apply to the deeper parts of the formula, e.g., character talent level.

> `name:` is removed when crossing the team buff boundary to improve caching as team buffs do not need the formula name.

## Mechanisms

## Non-Stacking (`Read.addOnce`)

TODO

## Priority String

TODO

## Team-Wide Stats

TODO

## Conditional and Top-level Formula Crawling (`meta.ts` generation)

TODO
