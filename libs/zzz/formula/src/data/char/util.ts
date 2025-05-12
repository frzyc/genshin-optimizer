import { constant, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import type { AttributeKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import type { CharacterDatum, SkillParam } from '@genshin-optimizer/zzz/stats'
import type { DmgTag, FormulaArg, Stat } from '../util'
import {
  type TagMapNodeEntries,
  customAnomalyBuildup,
  customAnomalyDmg,
  customDaze,
  customDmg,
  customHeal,
  customShield,
  listingItem,
  own,
  ownBuff,
  percent,
} from '../util'

type AbilityScalingType = Exclude<SkillKey, 'core'>

export function getBaseTag(data_gen: CharacterDatum): DmgTag {
  return { attribute: data_gen.attribute }
}

/**
 * Creates an array of TagMapNodeEntries representing a levelable ability's damage instance, and registers their formulas
 * @param name Base name to be used as the key
 * @param dmgTag Tag object containing damageType1, damageType2 and attribute
 * @param stat Stat that the damage scales on
 * @param skillParam SkillParam object corresponding to the specific hit
 * @param abilityScalingType Ability level that the scaling depends on.
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`. `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns Array of TagMapNodeEntries representing the damage instance
 */
export function dmg(
  name: string,
  dmgTag: DmgTag,
  stat: Stat,
  skillParam: SkillParam,
  abilityScalingType: AbilityScalingType,
  arg: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  if (!dmgTag.damageType1)
    throw Error(
      `No damageType specified on ${name}. Please specify at least one.`
    )
  const multi = sum(
    skillParam.DamagePercentage,
    prod(own.char[abilityScalingType], skillParam.DamagePercentageGrowth)
  )
  const base = prod(own.final[stat], multi)
  return customDmg(name, dmgTag, base, arg, ...extra)
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

  return [
    ownBuff.char.attribute.add(data_gen.attribute),
    ownBuff.char.specialty.add(data_gen.specialty),
    ownBuff.common.count.withSpecialty(data_gen.specialty).add(1),
    ownBuff.char.faction.add(data_gen.faction),
    ownBuff.common.count.withFaction(data_gen.faction).add(1),
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
      ownBuff.base[stat].add(subscript(core, values))
    ),
    // TODO: Remove this once we have character sheets
    // Standard DMG
    ...customDmg(
      'standardDmgInst',
      {
        attribute: data_gen.attribute,
      },
      prod(percent(1.5), own.final.atk)
    ),
    // Anomaly DMG
    ...customAnomalyDmg(
      'anomalyDmgInst',
      {
        attribute: data_gen.attribute,
        damageType1: 'anomaly',
      },
      prod(percent(anomalyMultipliers[data_gen.attribute]), own.final.atk)
    ),
    ...customAnomalyBuildup(
      'anomalyBuildupInst',
      { attribute: data_gen.attribute },
      percent(1)
    ),
    ...customDaze('dazeInst', percent(1)),
    // Formula listings for stats
    // TODO: Reorder this
    ownBuff.listing.formulas.add(listingItem(own.final.hp)),
    ownBuff.listing.formulas.add(listingItem(own.final.atk)),
    ownBuff.listing.formulas.add(listingItem(own.final.def)),
    ownBuff.listing.formulas.add(listingItem(own.final.impact)),
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
