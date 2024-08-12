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
Once each `prep:` calculation is completed, the tags are attached to the base formula with `dynTag`.

## Entry Types and Sheets

TODO

## Sheet-Specific formulas

TODO

> Artifact use `sheet:art` instead of `sheet:<artifact name>` as all artifacts are always included together. This helps reduce the `read` needed due to the sheer number of artifacts.

## Buffs and Conditionals

TODO

## Optional Tags

Tags `name: region: move: ele: trans: amp: cata:` (`name:` and everything on the right of `|` in the string representation) are generally not assumed to be present in most formulas.
Instead, it is used to include additions to the current formula.
For example, reading `{ q:dmg_ ele:hydro }` gathers both entries any-element dmg bonus (`{ q:dmg_ }`) as well as hydro-only dmg bonus (`{ q:dmg_ ele:hydro }`).
Most formulas also retain these optional tags, so the specified optional tags at the top-level formula also applies to the deeper parts of the formula, e.g., character talent level.

> `name:` is removed when crossing the team buff boundary to improve caching as team buffs do not need to know the original formula name.

## Mechanisms

## Non-Stacking (`Read.addOnce`)

TODO

## Priority String

TODO

## Team-Wide Stats

TODO

## Conditional and Top-level Formula Crawling (`meta.ts` generation)

TODO
