import { crawlObject, layeredAssignment } from '@genshin-optimizer/common/util'
import {
  cmpEq,
  cmpGE,
  cmpNE,
  constant,
  max,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  type AttributeKey,
  type SkillKey,
  allSkillKeys,
} from '@genshin-optimizer/zzz/consts'
import {
  type CharacterDatum,
  type SkillParam,
  allStats,
} from '@genshin-optimizer/zzz/stats'
import { anomTimePassed } from '../common/anomaly'
import type { DamageType, DmgTag, FormulaArg, Stat } from '../util'
import {
  type TagMapNodeEntries,
  customAnomalyBuildup,
  customAnomalyDmg,
  customDaze,
  customDmg,
  customHeal,
  customSheerDmg,
  customShield,
  damageTypes,
  listingItem,
  own,
  ownBuff,
  percent,
} from '../util'

type AbilityScalingType = SkillKey
type MappedStats = Record<AbilityScalingType, Record<string, SkillParam[]>>
type SkillOverides = Partial<
  Record<
    AbilityScalingType,
    Partial<Record<string, Record<number, TagMapNodeEntries[]>>>
  >
>

export function getBaseTag(data_gen: CharacterDatum): DmgTag {
  return { attribute: data_gen.attribute }
}

/**
 * Creates an array of TagMapNodeEntries representing a levelable ability's damage instance, daze and anomaly buildup, and registers their formulas
 * @param skillParam SkillParams object corresponding to the specific ability
 * @param name Name to register under
 * @param dmgTag Tag object containing damageType1, damageType2 and attribute. If not specified, attribute will be physical.
 * @param stat Stat that the damage scales on
 * @param abilityScalingType Ability level that the scaling depends on.
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`. `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns Array of TagMapNodeEntries representing the damage instance, daze and anomaly buildup
 */
export function dmgDazeAndAnom(
  skillParam: SkillParam,
  name: string,
  dmgTag: DmgTag,
  stat: Stat,
  abilityScalingType: AbilityScalingType,
  arg: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries[] {
  if (!dmgTag.attribute) dmgTag.attribute = 'physical'
  const dmgMulti = sum(
    percent(skillParam.DamagePercentage),
    prod(
      sum(own.char[abilityScalingType], -1),
      percent(skillParam.DamagePercentageGrowth)
    )
  )
  const dmgBase = prod(
    own.final[stat],
    dmgMulti,
    cmpEq(own.dmg.mv_mult_, 0, percent(1), own.dmg.mv_mult_)
  )
  const dmg = arg.cond ? cmpNE(arg.cond, '', dmgBase) : dmgBase
  const dazeBase = sum(
    percent(skillParam.StunRatio),
    prod(
      sum(own.char[abilityScalingType], -1),
      percent(skillParam.StunRatioGrowth)
    )
  )
  const daze = arg.cond ? cmpNE(arg.cond, '', dazeBase) : dazeBase
  const anomBase = constant(skillParam.AttributeInfliction / 100)
  const anom = arg.cond ? cmpNE(arg.cond, '', anomBase) : anomBase
  return [
    stat === 'sheerForce'
      ? customSheerDmg(`${name}_dmg`, dmgTag, dmg, arg, ...extra)
      : customDmg(`${name}_dmg`, dmgTag, dmg, arg, ...extra),
    customDaze(`${name}_daze`, dmgTag, daze, arg, ...extra),
    // TODO: No clue if this is right
    customAnomalyBuildup(`${name}_anomBuildup`, dmgTag, anom, arg, ...extra),
  ]
}

/**
 * Creates an array of TagMapNodeEntries representing a levelable ability's damage instance, daze and anomaly buildup, and registers their formulas
 * @param skillParam SkillParams array corresponding to the specific ability's hits to merge
 * @param name Name to register under
 * @param dmgTag Tag object containing damageType1, damageType2 and attribute. If not specified, attribute will be physical.
 * @param stat Stat that the damage scales on
 * @param abilityScalingType Ability level that the scaling depends on.
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`. `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns Array of TagMapNodeEntries representing the damage instance, daze and anomaly buildup
 */
export function dmgDazeAndAnomMerge(
  skillParam: SkillParam[],
  name: string,
  dmgTag: DmgTag,
  stat: Stat,
  abilityScalingType: AbilityScalingType,
  arg: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries[] {
  if (!dmgTag.attribute) dmgTag.attribute = 'physical'
  const dmgMulti = sum(
    ...skillParam.map((sp) => percent(sp.DamagePercentage)),
    prod(
      sum(own.char[abilityScalingType], -1),
      sum(...skillParam.map((sp) => percent(sp.DamagePercentageGrowth)))
    )
  )
  const dmgBase = prod(
    own.final[stat],
    dmgMulti,
    cmpEq(own.dmg.mv_mult_, 0, percent(1), own.dmg.mv_mult_)
  )
  const dazeBase = sum(
    ...skillParam.map((sp) => percent(sp.StunRatio)),
    prod(
      sum(own.char[abilityScalingType], -1),
      sum(...skillParam.map((sp) => percent(sp.StunRatioGrowth)))
    )
  )
  return [
    stat === 'sheerForce'
      ? customSheerDmg(`${name}_dmg`, dmgTag, dmgBase, arg, ...extra)
      : customDmg(`${name}_dmg`, dmgTag, dmgBase, arg, ...extra),
    customDaze(`${name}_daze`, dmgTag, dazeBase, arg, ...extra),
    // TODO: No clue if this is right
    customAnomalyBuildup(
      `${name}_anomBuildup`,
      dmgTag,
      constant(
        skillParam.reduce((acc, sp) => acc + sp.AttributeInfliction, 0) / 100
      ),
      arg,
      ...extra
    ),
  ]
}

/**
 * Pass in result to registerAllDmgDazeAndAnom 3rd param to override the default dmg daze and anom calculations.
 * @param mappedStats Characters entire mappedStats object
 * @param skillType Which skill to override. Also determines the level read.
 * @param name Which ability from the skill to override
 * @param hitNumber Which hit from the ability to override
 * @param dmgTag Tag object containing damageType1, damageType2 and attribute. If not specified, attribute will be physical.
 * @param stat Stat that the damage scales on
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`. `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns Keyed object for use in registerAllDmgDazeAndAnom
 */
export function dmgDazeAndAnomOverride<
  Stats extends MappedStats,
  SkillName extends SkillKey,
  AbilityName extends keyof Stats[SkillName],
>(
  mappedStats: Stats,
  skillType: SkillName,
  name: AbilityName,
  hitNumber: number,
  dmgTag: DmgTag,
  stat: Stat,
  arg: FormulaArg = {},
  ...extra: TagMapNodeEntries
) {
  return {
    [skillType]: {
      [name]: {
        [hitNumber]: dmgDazeAndAnom(
          mappedStats[skillType][name][hitNumber],
          `${name as string}_${hitNumber}`,
          dmgTag,
          stat,
          skillType,
          arg,
          ...extra
        ),
      },
    },
  }
}

/**
 * Registers all damage, daze and anomaly buildup instances for a character.
 * If you need to override the element, damage type, add some extra buffs, etc., pass in dmgDazeAndAnomOverride to 3rd+ param.
 * @param key Character key
 * @param mappedStats Characters entire mappedStats object
 * @param overrides dmgDazeAndAnomOverride(s)
 * @returns Array of TagMapNodeEntries representing all of the damage instance, daze and anomaly buildup
 */
export function registerAllDmgDazeAndAnom(
  key: CharacterKey,
  mappedStats: MappedStats,
  ...overrides: SkillOverides[]
): TagMapNodeEntries[] {
  const flatOverrides = overrides.reduce((combined, current) => {
    crawlObject(
      current,
      undefined,
      (o) => Array.isArray(o),
      (o, keys) => (combined = layeredAssignment(combined, keys, o))
    )
    return combined
  }, {})
  return (
    Object.entries(mappedStats)
      // Remove core, ability, and mindscape mapped stats
      .filter(([key]) => allSkillKeys.includes(key))
      .flatMap(([sKey, skill]) =>
        Object.entries(skill).flatMap(([abilityName, params]) =>
          params.flatMap(
            (param, index) =>
              flatOverrides[sKey]?.[abilityName]?.[index] ??
              dmgDazeAndAnom(
                param,
                `${abilityName}_${index}`,
                {
                  attribute: allStats.char[key].attribute,
                  damageType1: inferDamageType(key, abilityName),
                  skillType: `${sKey}Skill`,
                },
                allStats.char[key].specialty === 'rupture'
                  ? 'sheerForce'
                  : 'atk',
                sKey
              )
          )
        )
      )
  )
}

function inferDamageType(key: CharacterKey, abilityName: string): DamageType {
  const damageType = damageTypes.find((dt) =>
    abilityName.toLowerCase().startsWith(dt.toLowerCase())
  )
  if (!damageType) {
    if (key === 'AstraYao' && abilityName === 'Chord') return 'exSpecial'
    if (key === 'Banyue' && abilityName === 'DodgeImmovableMountain')
      return 'dodgeCounter'
    if (key === 'Lucy' && abilityName === 'GuardBoarsToArms') return 'basic'
    if (key === 'Lucy' && abilityName === 'GuardBoarsSpinningSwing')
      return 'basic'
    if (key === 'Yanagi' && abilityName === 'StanceJougen') return 'basic'
    if (key === 'Yanagi' && abilityName === 'StanceKagen') return 'basic'
    if (key === 'Yidhari' && abilityName === 'FrostsCrushingWeight')
      return 'basic'
    throw new Error(
      `Failed to infer damage type for key:${key} abilityName:${abilityName}. Please add an overide in zzz/formula/src/data/char/util.ts::inferDamageType`
    )
  }
  return damageType
}

/**
 * Creates an array of TagMapNodeEntries representing a levelable ability's shield instance, and registers their formulas
 * @param name Base name to be used as the key
 * @param stat Stat that the damage scales on
 * @param levelScalingMulti Array representing the multiplicative scaling at different levels of the ability
 * @param levelScalingFlat Array representing the flat scaling at different levels of the ability
 * @param abilityScalingType Ability level that the scaling depends on
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`. `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this shield instance
 * @returns Array of TagMapNodeEntries representing the shield instance
 */
export function shield(
  name: string,
  stat: Stat,
  levelScalingMulti: number[],
  levelScalingFlat: number[],
  abilityScalingType: AbilityScalingType,
  arg: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  const abilityLevel = own.char[abilityScalingType]
  const multi = percent(subscript(abilityLevel, levelScalingMulti))
  const flat = subscript(abilityLevel, levelScalingFlat)
  const base = sum(prod(own.final[stat], multi), flat)
  return customShield(name, base, arg, ...extra)
}

/**
 * Creates an array of TagMapNodeEntries representing a levelable ability's heal instance, and registers their formulas
 * @param name Base name to be used as the key
 * @param stat Stat that the damage scales on
 * @param levelScalingMulti Array representing the multiplicative scaling at different levels of the ability
 * @param levelScalingFlat Array representing the flat scaling at different levels of the ability
 * @param abilityScalingType Ability level that the scaling depends on
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`. `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this heal instance
 * @returns Array of TagMapNodeEntries representing the heal instance
 */
export function heal(
  name: string,
  stat: Stat,
  levelScalingMulti: number[],
  levelScalingFlat: number[] | undefined,
  abilityScalingType: AbilityScalingType,
  arg: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  const abilityLevel = own.char[abilityScalingType]
  const multi = percent(subscript(abilityLevel, levelScalingMulti))
  const flat = levelScalingFlat ? subscript(abilityLevel, levelScalingFlat) : 0
  const baseScaling = prod(own.final[stat], multi)
  const base = flat ? sum(baseScaling, flat) : baseScaling
  return customHeal(name, base, arg, ...extra)
}

const anomalyMultipliers: Record<AttributeKey, number> = {
  fire: 0.5,
  electric: 1.25,
  ether: 0.625,
  ice: 5,
  physical: 7.13,
}
const disorderTimeMultipliers: Record<AttributeKey | 'frost', number> = {
  fire: 1, // 2 * 0.5
  electric: 1.25,
  ether: 1.25, // 2 * 0.625
  ice: 0.075,
  physical: 0.075,
  frost: 0.75,
}

/**
 * Creates, registers, and returns TagMapNodeEntries for a character's:
 * - Base stats
 * - Core skill stat boosts
 * @param data_gen Character's entire `data` object from zzz-stats:allStats
 * @returns TagMapNodeEntries representing character stats/buffs
 */
export function entriesForChar(data_gen: CharacterDatum): TagMapNodeEntries {
  const { char } = own
  const { promotion, lvl, core } = char
  // The "add" only applies to currLvl - 1, since "base" is stat at lvl 1
  const readLvl = sum(constant(-1), lvl)
  // Convert {stat: value}[] to {stat: value[]}
  type CoreStatKey = keyof (typeof data_gen.coreStats)[number]
  const coreStats = data_gen.coreStats.reduce(
    (coreStatsArrs, currCoreStatMap) => {
      Object.entries(currCoreStatMap).forEach(([stat, value]) => {
        if (!coreStatsArrs[stat]) coreStatsArrs[stat] = [0] // add 0th core level
        coreStatsArrs[stat].push(value)
      })
      return coreStatsArrs
    },
    {} as Partial<Record<CoreStatKey, number[]>>
  )
  const miyabiCheck = data_gen.id === '1091'

  return [
    ownBuff.char.attribute.add(data_gen.attribute),
    ownBuff.char.specialty.add(data_gen.specialty),
    ownBuff.common.count.withSpecialty(data_gen.specialty).add(1),
    ownBuff.char.faction.add(data_gen.faction),
    ownBuff.common.count.withFaction(data_gen.faction).add(1),
    ownBuff.common.count[data_gen.attribute].add(1),
    // Base + promotion stats
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const addPerPromo = data_gen.promotionStats.map((p) => p[sk])
      return ownBuff.base[sk].add(
        sum(
          data_gen.stats[`${sk}_base`],
          subscript(promotion, addPerPromo),
          prod(readLvl, data_gen.stats[`${sk}_growth`])
        )
      )
    }),
    // Other base stats
    ...(['anomMas', 'anomProf', 'impact', 'enerRegen'] as const).map((stat) =>
      ownBuff.base[stat].add(data_gen.stats[stat])
    ),
    // Core skill stat boost
    ...Object.entries(coreStats).map(([stat, values]) =>
      stat === 'hp_'
        ? ownBuff.initial[stat].add(subscript(core, values))
        : ownBuff.base[stat].add(subscript(core, values))
    ),
    // Mindscape skill level boost
    ...allSkillKeys.map((sk) =>
      ownBuff.char[sk].add(
        cmpGE(char.mindscape, 5, 2 + 2, cmpGE(char.mindscape, 3, 2))
      )
    ),
    // TODO: Remove this once we have character sheets for everyone
    // Standard/Sheer DMG
    ...(data_gen.specialty === 'rupture'
      ? customSheerDmg(
          'sheerDmgInst',
          {
            attribute: data_gen.attribute,
            damageType1: 'sheer',
          },
          prod(percent(1.5), own.final.sheerForce)
        )
      : customDmg(
          'standardDmgInst',
          {
            attribute: data_gen.attribute,
          },
          prod(percent(1.5), own.final.atk)
        )),
    // Anomaly DMG
    ...customAnomalyDmg(
      'anomalyDmgInst',
      {
        attribute: data_gen.attribute,
        damageType1: 'anomaly',
      },
      prod(
        percent(anomalyMultipliers[data_gen.attribute]),
        own.final.atk,
        cmpEq(own.dmg.anom_mv_mult_, 0, percent(1), own.dmg.anom_mv_mult_)
      )
    ),
    ...customAnomalyDmg(
      `disorderDmgInst_${miyabiCheck ? 'frost' : data_gen.attribute}`,
      {
        attribute: miyabiCheck ? 'ice' : data_gen.attribute,
        damageType1: 'disorder',
      },
      prod(
        sum(
          percent(miyabiCheck ? 6 : 4.5),
          own.final.addl_disorder_,
          prod(
            max(
              0,
              sum(
                constant(miyabiCheck ? 20 : 10),
                prod(constant(-1), anomTimePassed)
              )
            ),
            percent(
              disorderTimeMultipliers[
                miyabiCheck ? 'frost' : data_gen.attribute
              ]
            )
          )
        ),
        own.final.atk
      )
    ),
    ...customAnomalyBuildup(
      'anomalyBuildupInst',
      { attribute: data_gen.attribute },
      percent(1)
    ),
    ...customDaze('dazeInst', { attribute: data_gen.attribute }, percent(1)),
    // Formula listings for stats
    ownBuff.listing.formulas.add(listingItem(own.final.hp)),
    ownBuff.listing.formulas.add(listingItem(own.final.atk)),
    ownBuff.listing.formulas.add(listingItem(own.final.def)),
    ownBuff.listing.formulas.add(listingItem(own.final.impact)),
    ownBuff.listing.formulas.add(listingItem(own.final.sheerForce)),
    ownBuff.listing.formulas.add(listingItem(own.common.cappedCrit_)),
    ownBuff.listing.formulas.add(listingItem(own.final.crit_dmg_)),
    ownBuff.listing.formulas.add(listingItem(own.final.pen_)),
    ownBuff.listing.formulas.add(listingItem(own.final.pen)),
    ownBuff.listing.formulas.add(listingItem(own.final.enerRegen)),
    ownBuff.listing.formulas.add(listingItem(own.final.anomProf)),
    ownBuff.listing.formulas.add(listingItem(own.final.anomMas)),
    ownBuff.listing.formulas.add(
      listingItem(own.final.dmg_[data_gen.attribute])
    ),
  ]
}
