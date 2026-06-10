# Name-scoped (formula-local) buff checklist

> Migration checklist. Derived 2026-06-05 via TS-AST parse of every call to a
> formula helper exposing a `...extra` slot (GI `dmg`/`shield`/`fixedShield`/
> `customDmg`/`customShield`/`customHeal`; SR `dmg`/`shield`/`heal`/`customDmg`/
> `customShield`/`customHeal`/`customBreakDmg`; ZZZ `dmgDazeAndAnom`/
> `dmgDazeAndAnomMerge`/`dmgDazeAndAnomOverride`/`shield`/`heal`/`custom*`).
> `registerFormula` stamps every extra with `{ ...tag, name }`, so these apply
> only to that formula's reads. `[bracketed]` = the resolved const name.

**Open-world caveat:** this lists only buffs *authored into a formula helper's
extra slot*. A `final.X` read in Pando also gathers global buffs written anywhere
(other char/weapon/artifact sheets, common glue) by tag-subset, so the full
contributor set of any value is NOT determined by one sheet -- the canopy
converter must gather globally, not per-file. See `dmg-survey.md` section 4 and
the engine `tags.md` (open-world gather).

**deep vs shallow:** deep = a buff to a scaling stat that re-fires the stat
multiply (GI/SR `base/premod/final` atk/def/hp; ZZZ `flatAndPercentStats`
`atk/def/hp/impact/anomProf/anomMas/enerRegen` and their `_` percent forms under
`combat/initial/base`). Shallow = everything else. See also the consumption-layer
note in `dmg-survey.md` (some stats are read at `premod`/their own layer and never
touch `final`, so layer name alone does not fix scope depth).

## gi (3)

| file:line | helper | name | qt.q | depth |
| --- | --- | --- | --- | --- |
| Nahida.ts:239 | customDmg | karma_dmg | premod.dmg_ | shallow |
| Nahida.ts:239 | customDmg | karma_dmg | premod.critRate_ | shallow |
| Nilou.ts:213 | dmg | skill_moon | premod.dmg_ | shallow |

## sr (1)

| file:line | helper | name | qt.q | depth |
| --- | --- | --- | --- | --- |
| March7th.ts:52 | dmg | talentDmg | formula.base | shallow |

## zzz (280)

`dmgDazeAndAnom*` rows are one authored buff fanned into `_dmg`/`_daze`/
`_anomBuildup`; the `name` shown is the ability arg. All shallow unless marked.

**Alice** L56-106 BasicAttackCelestialOverture [m4_basic_anomBuildup_] combat.anomBuildup_ (fan); L118 customDmg m6_dmg [m6_crit_] combat.crit_
**Anby** L79 BasicAttackThunderbolt [core_after3rdBasic_dazeInc_] combat.dazeInc_; [m2_stunned_basic_dmg_] combat.dmg_ (fan)
**Anton** (all dmgDazeAndAnomOverride -> combat.common_dmg_, fan): L77 [core_piledriver_dmg_]; L115 [m6_dmg_]; L125 [core_drill_dmg_]+[m6_dmg_]; L136 [core_piledriver_dmg_]+[m6_dmg_]; L147 [core_piledriver_dmg_]; L157 [core_piledriver_dmg_]; L167 [core_piledriver_dmg_]; L177 [core_drill_dmg_]+[m6_dmg_]; L188 [core_piledriver_dmg_]; L198 [core_piledriver_dmg_]; L208 [core_drill_dmg_]; L218 [core_drill_dmg_]
**AstraYao** (fan): L65 BasicAttackCapriccio [m6_capriccio_crit_] combat.crit_; L76 Interlude / L90 Chorus / L101 Finale / L112 WindchimesOaths / L124 Chord / L135 Chord each [m6_mv_mult] dmg.mv_mult_ + [m6_crit_] combat.crit_
**Banyue** (fan): L59 BasicAttackTopplingMountain [m1_basic_sheer_dmg_] combat.sheer_dmg_ + [m4_basic_dmg_] combat.dmg_; L73 BasicAttackCrushingPeaks same; L87 LionsRoar [m1_exSpecial_sheer_dmg_] combat.sheer_dmg_; L100 LionsRoarWrath [m1_exSpecial_sheer_dmg_]+[m4_exSpecial_dmg_]; L114 MountainTremor [m1_exSpecial_sheer_dmg_]; L127 MountainTremorWrath [m1_exSpecial_sheer_dmg_]+[m4_exSpecial_dmg_]
**Ben** (fan -> combat.common_dmg_): L88 FiscalFist [m4_dmg_]; L99 CashflowCounter [m4_dmg_]
**Billy** (fan -> combat.common_dmg_): L48 [core_dmg_]; L58 [core_dmg_]
**Burnice**: L92,L102 MixedFlameBlend [ability_fire_anomBuildup_] combat.anomBuildup_ (fan); L112,L122 IntenseHeat [ability_fire_anomBuildup_] (fan); L132,L143 DoubleShot [ability_fire_anomBuildup_]+[m6_fire_resIgn_] combat.resIgn_ (fan); L156 customDmg core_afterburn_dmg [core_afterburn_dmg_] combat.common_dmg_ +[ability_fire_anomBuildup_]+[m1_afterburn_fire_anomBuildup_] combat.anomBuildup_; L171 customAnomalyBuildup core_afterburn_anomBuildup (same 3); L183 customDmg m6_additional_afterburn_dmg [m6_fire_resIgn_] combat.resIgn_
**Caesar** (fan): L54 OverpoweredShieldBash [m6_exSpecial_assistFollowup_crit_] combat.crit_ + [m6_dmg_] combat.common_dmg_; L65 AidingBlade same
**Corin** (fan -> combat.common_dmg_ [core_common_dmg_]): L52,L62 Wipeout; L72 OopsyDaisy; L82 Nope; L92 CleanSweep; L102 SkirtAlert; L112 Sorry; L122 VeryVerySorry; L132 EmergencyMeasures; L142 QuickSweep
**Dialyn** (fan -> combat.flat_dmg): L87 Rock [ability_attack_dmg]+[ability_rupture_dmg]; L98 Scissors same; L109 Paper same
**Ellen** (fan): L90 ArcticAmbush [core_dash_crit_dmg_] combat.crit_dmg_ + [m6_dash_mv_mult] dmg.mv_mult_; L101,L111,L121 FlashFreezeTrimming [core_basic_crit_dmg_] combat.crit_dmg_; L131,L141 GlacialBladeWave same; L151,L161 IcyBlade same
**Harumasa** (fan): L99,L111,L123 HitenNoTsuruSlash [core_dash_crit_] combat.crit_ + [core_dash_crit_dmg_] combat.crit_dmg_ + [m2_dash_dmg_] combat.dmg_; L135 ChasingThunder [core_dash_crit_]+[core_dash_crit_dmg_]
**Koleda** (fan -> combat.dazeInc_ [core_dazeInc_]): L91,L101,L111 SmashNBash
**Lighter**: L118 BasicAttackLFormThunderingFist [m1_finishing_move_dmg_] combat.common_dmg_ (fan)
**Lucia** (fan; each call 4 extras: [exSpecial_harmony_dmg_] combat.flat_dmg + [m2_harmony_dmg_] combat.common_dmg_ + [harmony_crit_] combat.crit_ + [harmony_crit_dmg_] combat.crit_dmg_): L62,L75 OrbitalCombo; L88 StardustEcho; L101,L114 SymphonyReaperStorm; L127 SymphonyReaperDaybreak; L140,L153 CrushingMist; L166 HarmonyPaintedDreams; L179 StageOfBrilliance; L192 GreatArmor
**Lucy** ([core_atk] combat.atk **DEEP** + [ability_crit_] final.crit_ + [ability_crit_dmg_] final.crit_dmg_): L92,L104,L116 BoarsToArms (fan); L128 BoarsSpinningSwing (fan); L176 customDmg m6_dmg
**Lycaon** (fan -> combat.dazeInc_): L119-169 MoonHunter [core_basic_dazeInc_]; L179 ThrillOfTheHunt [m1_dazeInc_]; L189 [m1_fullCharge_dazeInc_]; L199 GlacialWaltz [core_assistFollowUp_dazeInc_]
**Manato** (fan -> combat.crit_dmg_ [core_basic_crit_dmg_]): L129,L139,L149,L159 BlazingWindMistySlash
**Miyabi** (fan unless noted): L108-148 Kazahana [m2_dmg_] combat.common_dmg_; L168,L181,L194 Shimotsuki [ability_dmg_] combat.common_dmg_ + [ability_ice_resIgn_] combat.resIgn_ + [m1_defIgn_] combat.defIgn_ + [m6_dmg_] combat.common_dmg_; L209 customDmg core_frostburnBreak_dmg [m4_frostburnBreak_dmg_] combat.common_dmg_
**OrphieMagus** (fan): L91 CorrosiveFlash [m1_fire_resIgn_] combat.resIgn_; L115 CrimsonVortex same; L130 HeatCharge [m1_fire_resIgn_]+[m4_common_dmg_] combat.common_dmg_; L146 FieryEruption [m1_fire_resIgn_]; L173 DanceWithFire [m4_common_dmg_]
**Piper** (fan -> combat.dmg_ [m2_physical_dmg_]): L61,L71,L81 OneTrillionTons; L91 ReallyHeavy; L101 HoldOnTight
**Pulchra** (fan -> combat.dmg_ [m6_special_dmg_]): L55,L65 RendingClawNightmareShadow
**Qingyi** (fan): L109,L121 EnchantedMoonlitBlossoms [flash_connect_dmg_] combat.common_dmg_ + [flash_connect_dazeInc_] combat.dazeInc_ + [m6_crit_dmg_] combat.crit_dmg_; L133 TranquilSerenade [chain_dmg_] combat.common_dmg_
**Seed** (fan): L113 FallingPetalsSlaughter [ability_basic_dmg_] combat.dmg_ + [ability_basic_electric_resIgn_] combat.resIgn_; L124 DownfallFirstForm same + [m1_basic_crit_dmg_] combat.crit_dmg_; L136 DownfallSecondForm same
**Seth**: L97,L107 LightningStrikeElectrified [m2_basic_electric_anomBuildup_] combat.anomBuildup_ (fan); L117,L127,L137 Thundershield [m4_defensiveAssist_dazeInc_] combat.dazeInc_ (fan); L173 customDmg m6_dmg [m6_crit_]+[m6_crit_dmg_]
**Soldier11** (fan; each: [core_common_dmg_]+[m2_common_dmg_] combat.common_dmg_ + [m6_fire_resIgn_] combat.resIgn_): L100,L115,L130,L145 FireSuppression; L160 DashAttack
**Soukaku** (fan -> combat.common_dmg_ [m6_dmg_]): L105,L115,L125 FrostedBanner; L135 DashAttack5050
**Trigger**: L126 customDmg m6_armor_break_rounds_dmg [m6_armor_break_rounds_dmg_] combat.common_dmg_
**Vivian** (fan -> combat.crit_ [m4_crit_]): L86 FlutteringFrockSuspension; L96 Featherbloom
**Yanagi**: L108 GekkaRuten [m2_exSpecial_electric_anomBuildup_] combat.anomBuildup_ (fan)
**Yixuan** (fan -> combat.common_dmg_): L64 AuricArray [core_dmg_]; L77 QingmingEruption [core_dmg_]; L87 CloudShaper [ability_dmg_]+[m4_dmg_]; L98 AshenInk [ability_dmg_]+[m4_dmg_]
**Yuzuha** (fan -> combat.anomBuildup_ [basic_anomBuildup_]): L82 SugarburstSparkles; L92 SugarburstSparklesMax
**ZhuYuan** (fan; each: [core_dmg_] combat.common_dmg_ + [m2_basic_dash_ether_dmg_] combat.dmg_ + [m4_basic_dash_ether_res_ign_] combat.resIgn_): L137,L149,L161 PleaseDoNotResist; L173 OverwhelmingFirepower
**BigCylinder** (wengine): L29 customDmg damage [.] combat.crit_
**CannonRotor** (wengine): L21 customDmg damage [.] combat.crit_

## Totals

Per-game: gi 3, sr 1, zzz 280. Grand total 284 distinct authored buffs (ZZZ
`dmgDazeAndAnom*` fan x3 downstream). Deep: 5 (all Lucy `core_atk` -> `combat.atk`).
Shallow: 279.

Per-target tally: combat.common_dmg_ 87 | combat.crit_dmg_ 32 | combat.crit_ 30 |
combat.dmg_ 22 | combat.resIgn_ 22 | combat.anomBuildup_ 21 | combat.dazeInc_ 18 |
combat.flat_dmg 17 | dmg.mv_mult_ 7 | combat.sheer_dmg_ 6 | combat.atk 5 (deep) |
final.crit_ 5 | final.crit_dmg_ 5 | combat.defIgn_ 3 | premod.dmg_ 2 |
premod.critRate_ 1 | formula.base 1.

Migration note: the surface is overwhelmingly ZZZ (280/284), almost entirely the
`dmgDazeAndAnomOverride` mindscape/core-passive pattern (an ability buff const
threaded into the override extra, fanned across dmg/daze/anomBuildup). Only 5 are
deep (Lucy flat ATK into `combat.atk`). GI/SR barely use the pattern (4 total).
