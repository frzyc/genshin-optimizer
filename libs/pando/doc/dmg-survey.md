# Cross-game damage formula survey (for the canopy dmg layer)

> Locally authored design note (not from `pando-c`). Surveyed 2026-06-05 from
> `libs/{gi,sr,zzz}/formula/src/data/common/*` and `char/sheets/*`, cross-checked
> against the formula `api.md`/`tags.md` here. Defer to code where they disagree.

Purpose: decide how a game-agnostic damage formula layer (in canopy) should work,
by pinning down what GI / SR / ZZZ actually share and where they diverge.

## 1. The shared skeleton

All three games assemble damage as the same skeleton, and all three already
factor out one reusable "incoming-damage" multiplier that every damage type
rereads (GI `inDmg`, SR `dmg.inDmg`, ZZZ `dmg.shared x def_mult_`):

```
finalDmg = baseAmount
         x dmgBonusMult     # 1 + sum(attribute_dmg_ + universal_dmg_)
         x critMult         # lookup(critMode){crit, nonCrit, avg}
         x incomingMult     # defMult x resMult [x takenMult]
```

- **baseAmount** = `stat(atk/def/hp) x moveMult`, `moveMult = subscript(level, talentScaling)`.
  GI/ZZZ add additive layers into the base (`cataAddi`, `flat_dmg`).
- **critMult** has an *identical shape* in all three:
  `lookup(critMode, { crit: 1+critDmg, nonCrit: 1, avg: 1 + cappedCrit*critDmg })`,
  with `cappedCrit = clamp(crit_, 0, 1)`. ZZZ carries a second copy for anomaly crit.
- **incomingMult** is the enemy-side bundle and is the single most important shared
  structure -- compute once, reread into every damage type.

File anchors: GI `common/dmg.ts:29-55`; SR `common/dmg.ts:6-40` + `prep.ts:25-50`;
ZZZ `common/dmg.ts:22-101` + `prep.ts:7-39`.

## 2. Where they diverge

| Stage | GI | SR | ZZZ |
| --- | --- | --- | --- |
| Entry points | dmg + transformative + swirl(hybrid) | dmg + **break** (separate) | **standard / sheer / anomaly** + daze/anomaly-buildup |
| DEF mult | level-ratio `(Lc+100)/((Le+100)(1-defRed-defIgn))` | level-ratio `(Lc+20)/(...)` | **def-value** `LF/(max(def(1-defRed)(1-pen)-penFlat,0)+LF)` |
| RES mult | **piecewise** `res()` custom op (breaks at 0, .75) | linear `1-(res-resPen)` | linear `1-res+resRed+resIgn` |
| Damage-taken / vuln | not modeled | **TODO** (unimplemented) | modeled: `1+dmgInc-dmgRed`, stun `stun_/unstun_` |
| Reactions / special | amplifying (x, pre-crit), catalyze (additive to base), transformative (separate, some crit), infusion priority | break dmg `baseRatio[ele]*levelMult*(1+brEffect_)`; broken/toughness | sheer (skips defMult, `*1+sheer_dmg_`); anomaly (`*1+anom_base_`, anomaly-crit, `*anomProf*0.01`, `*1+(lvl-1)/59`, skips pen); `sheerForce=atk*0.3` |
| Mult combination | inline chain | inline chain | explicit **`fixedProd` product bundle** reread into each type |

Asymmetries worth noting: ZZZ already models damage-taken + stun that SR leaves
TODO; only GI needs a non-linear RES; only ZZZ splits into separate per-type entry
points and uses a def-value (not level-ratio) DEF formula; reactions are entirely
GI-specific.

## 3. Design implications for the canopy dmg layer

1. **A damage formula is an ordered pipeline of stages, not a fixed expression.**
   In canopy's order-is-law form that is literally successive
   `c.dmg = prod(c.dmg, stageMult)` assignments, each wrapped in
   `withCtx({ source })` so provenance survives for the UI.
2. **Multiple named entry points sharing one incoming bundle.** Generalize ZZZ's
   pattern: compute the shared enemy-incoming multiplier once as a coordinate; each
   damage type (standard/sheer/anomaly/break/swirl/heal/shield) multiplies it in.
   Maps cleanly onto canopy coordinates (compute once, reference by path).
3. **Three primitives belong in the game-agnostic layer** (identical across games):
   `critMult(rate, dmg, mode)`, `cappedCrit = clamp`, `dmgBonus = 1 + sum`. The
   `critMode` selector is a canopy `branch` on a fixed input.
4. **Keep defMult/resMult game-supplied.** Two DEF flavors (level-ratio vs
   def-value) and two RES flavors (linear vs piecewise/custom-op) do not unify
   cleanly. Only the additive stacking of `red + ign` is a shared helper.
5. **Per-type extras (anomaly/sheer/break) are just extra multipliers + a `branch`
   on damage-type on the shared base** -- not separate machinery.

## 4. Damage that modifies the character's own stats

Three genuinely different things hide under "the damage changes a stat":

**(a) Stat substitution -- not a modification, just node composition.** A formula
whose base reads a *different* stat than usual. No scoping needed; the stat is
baked into the base node.
- ZZZ Ben M2 DEF-scaling: `customDmg('m2_dmg', {...}, prod(own.final.def, percent(dm.m2.dmg)))` (`char/sheets/Ben.ts:119-122`)
- GI Candace HP-scaling skill: `dmg('skill_basic', info, 'hp', ...)` -- `dmg()` takes the stat as a parameter (`char/Candace.ts:117-122`)
- SR March7th DEF shield: `shield('skillShield', 'def', ...)` (`char/sheets/March7th.ts:36`)

**(b) Formula-local stat buff -- the real "this hit modifies my stats for its own
calc."** A buff written to a stat that applies *only* when computing one named
formula. Authored as a buff entry passed in a formula helper's `...extra`, which
`registerFormula` re-tags with `name:<formula>` so it is gathered only under that
formula's `name` (`gi .../util/sheet.ts` registerFormula; `...extra.map(({tag,value}) => ({ tag: {...tag, name}, value }))`).
- SR March7th E4 follow-up bonus only on `talentDmg`: `ownBuff.formula.base.add(e4_counter_dmgInc)` in that `dmg(...)` call (`char/sheets/March7th.ts:23-61`)
- ZZZ per-hit guaranteed/bonus crit: `ownBuff.combat.crit_.add(...)` handed to one damage instance via `dmgDazeAndAnomOverride(..., harmony_crit_)` (ZZZ Lucia `char/sheets/Lucia.ts:46-51`; AstraYao M6 only on hit 3, `char/sheets/AstraYao.ts:40-74`)
- Per-formula element/infusion: baked into the formula's `dmgTag`, e.g. `shield('skill_hydroShield', 'hp', ..., { ele: 'hydro' })` (`char/Candace.ts:130-137`)

The scoping mechanism is the `name:` tag: the buff entry only matches reads carrying
that formula's `name`, so it can't leak into other formulas.

**(c) Global conditional stat conversion -- modifies the character's stats for ALL
their calcs (not formula-local).** A DEF->ATK / HP->ATK conversion written to a
stat layer.
- ZZZ Ben core "gain ATK from DEF": `ownBuff.initial.atk.add(prod(own.initial.def, percent(...)))` (`char/sheets/Ben.ts:127-131`)
- ZZZ Lucia HP->team sheerForce: `teamBuff.combat.sheerForce.add(prod(own.initial.hp, ...))` (`char/sheets/Lucia.ts:212-231`)

### Which stat layer do formula-local (b) buffs target? (census)

Scope cost for (b) depends entirely on the *layer* the buff writes to: a `final` /
`formula.base` write is a cheap late adjustment; a `base`/`premod`/`initial` write
would force the aggregation waterfall to re-run inside the scope. Census of every
name-scoped (formula-local) buff:

| Game | count | layers |
| --- | --- | --- |
| ZZZ | 260 | **all LATE**: `combat.*` (dominant `common_dmg_`, `crit_`, `crit_dmg_`, `flat_dmg`, `dazeInc_`, `resIgn_`, `anomBuildup_`), a few `final.crit_/crit_dmg_`, 7x `dmg.mv_mult_` |
| SR | 1 | `formula.base` (LATE) -- March7th `talentDmg` |
| GI | 3 | `premod.dmg_` x2, `premod.critRate_` x1 -- Nahida `karma_dmg` (`Nahida.ts:248-249`), Nilou `skill_moon` (`Nilou.ts:220`) |

**The right axis is depth, not layer name.** From `gi/.../common/index.ts:20-34`,
`final <= premod` is a *blanket reread for every stat*, and the only layer that
does real work is `premod[atk/def/hp] = base * (1 + %)`. So `final.X` is an
identity alias of `premod.X` for all non-(atk/def/hp) stats -- `premod` is their
last writable binding, and a `premod.dmg_`/`premod.critRate_` write *is* the late
binding, not an early one.

- **Deep** = a multiply sits between the write and the read: `atk/def/hp` in
  GI/SR (`base*(1+%)`), and ZZZ's `flatAndPercentStats`
  (`atk/def/hp/impact/anomProf/anomMas/enerRegen`) via the two-layer waterfall
  (`initial = base*(1+initial%)`, `final = initial*(1+combat%) + combat`).
  Overriding the *percent* here re-fires the multiply and everything downstream.
- **Shallow** = pure additive accumulation, `premod == final` (GI) or the write
  lands post-multiply: `dmg_`, `crit_`, `crit_dmg_`, `eleMas`, `resIgn_`,
  `dazeInc_`, `flat_dmg`, `mv_mult_`, `formula.base`, and even ZZZ `combat.atk`
  (flat, added after the `(1+combat%)` multiply).

**Two caveats on this census** (both push toward the open-world gather, not
per-file reasoning):

- **`final` reads gather globally.** A `final.X` value pulls every buff written to
  that stat *anywhere* -- other char/weapon/artifact sheets, common glue -- by
  tag-subset, not just the formula-local extras enumerated in
  [name-scoped-buffs.md](./name-scoped-buffs.md). So that checklist is the
  *formula-local* surface only; the full contributor set of any value requires a
  global gather. This is exactly the closed-vs-open-world gap (engine `tags.md`):
  canopy's converter must collect contributors globally, never per-file.
- **Not every stat is read at `final`.** By convention the layer a stat is
  *consumed* at varies: the percent stats (`atk_/hp_/def_`) are consumed at
  `premod` (inside `premod[stat] = base x (1+%)`) and never touch `final`, while
  bonus stats (`dmg_`, `crit_`, `crit_dmg_`, `eleMas`) are read at `final`. So the
  scope boundary for an override is "the layer the stat is actually read at," which
  is *per-stat*, not a uniform `final`. For the percent stats `premod` is already
  the last binding; for bonus stats `final` is (an identity reread of `premod`).

Re-read through this lens, **every** formula-local (b) buff targets a *shallow*
quantity -- none overrides a stat-percent (`atk_/hp_/def_/combat.X_`) that would
re-fire the multiply. The GI `premod.dmg_/critRate_` cases are shallow
(`premod == final`); ZZZ's `combat.atk` is flat/post-multiply. Stat conversions
(DEF->ATK etc.) -- the one thing that *does* override a deep stat -- are always
global (pattern (c)), at sheet top level, applied to every formula.

Conclusion: **`scoped()` is sufficient for (b)** -- no separate
evaluation-context / read-rebind mechanism is needed. In canopy, collapse
`base/premod/final` into a single additive coordinate for all shallow stats, and
keep the two-step (`base` coord + `percent` coord -> `final = base*(1+pct)`) only
for the deep set (`atk/def/hp`, plus ZZZ's two-layer `flatAndPercentStats`). Make
the override-able shallow quantities leaf coordinates the assembly reads, and make
the assembly the scope unit; scope cost is then a shallow re-derivation and never
the stat-multiply waterfall (which is never overridden per-formula anyway). A
read-rebind (Pando `tag`/`dtag`) remains required only for GI's per-formula
element/infusion override (pattern (4)), which is not a stat modification.

### Accumulator vs singleton coordinates (accu classes)

Orthogonal to deep/shallow, and decisive for migration cost: a coordinate's `accu`
(its `Desc`) says how many contributors it can have. `unique` is the default when a
`Desc` omits `accu` (the `iso`/`fixed`/`prep` Descs). Confirmed in GI
`util/tag.ts:71-158` and ZZZ `util/tag.ts:72-202`:

- **Accumulators** (`agg`/`isoSum` = `sum`, `fixedProd`/`prepProd` = `prod`): every
  *stat layer* -- GI `base/premod/final`, ZZZ `base/initial/combat/final` -- plus
  `mv_mult_`, char abilities, reaction bonuses. Many contributors, gathered
  open-world. This is the half that needs the contribution-folding remodel and the
  global gather.
- **Singletons** (`unique`, via `iso`/`fixed`/`prep`): the *derived / identity*
  coordinates -- `cappedCrit_`/`anom_cappedCrit_`, `critMode`, the entire damage
  pipeline (`dmg.crit_mult_/def_mult_/res_mult_/...`, `dmg.shared`, GI
  `dmg.out/inDmg/critMulti`), the `formula.*` entry points, and char/weapon identity
  (`lvl`, `attribute`/`ele`, `mindscape`/`ascension`). Exactly one contributor by
  construction -- the calculator throws in debug if a `unique` read matches >1
  (engine `calc.ts`). Point reads, no gather.

The boundary is `cappedCrit_` / the `*_mult_` pipeline: below it the stat
aggregation is summed/open-world; at and above it the damage pipeline is
unique/single-contributor. So **the entire damage pipeline is singletons** -- it
consumes summed stats and emits single-input derived nodes.

Migration mapping: singletons -> a single canopy assignment (`c.x = ...`);
order-is-law already gives "exactly one contributor", so the dmg pipeline ports
near-mechanically. Accumulators -> the `c.x = sum(c.x, contribution)` fold, where
the open-world gather (contributors authored across many sheets) is the real work.
The ZZZ glue that performs this gather -- the `reread` `X <= Y` redirections -- is
walked in [libs/zzz/formula/doc/glue.md](../../zzz/formula/doc/glue.md); each
redirection becomes one fold into the target coordinate.

### Canopy implications

- (a) is plain node references -- nothing special.
- (c) is ordinary canopy assignments to a stat coordinate (possibly gated by a
  `branch`), applied before the damage reads it.
- (b) is exactly what canopy **`scoped()`** is for: run the formula under temporary
  leaf overrides that reset afterwards, baking the override into the returned node
  while leaving the record untouched. The `name:`-tag scoping in Pando becomes a
  `scoped(() => { c.crit_ = ...; return assembleDmg() })` block in canopy.
  This is the concrete shape of `migration.md`'s unresolved "scoped-override
  remodel" -- per-formula stat overrides are its main real-world use, and `scoped`
  already covers the value-override case (it does **not** yet cover rebinding a
  *read* the way Pando `tag`/`dtag` does, which only GI infusion/element override
  really needs).
