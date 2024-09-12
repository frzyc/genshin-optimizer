import { objMap } from '@genshin-optimizer/common/util'
import {
  cmpEq,
  cmpGE,
  constant,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import {
  type AbilityKey,
  type StatBoostKey,
} from '@genshin-optimizer/sr/consts'
import {
  type CharacterDatum,
  type SkillTreeNodeBonusStat,
} from '@genshin-optimizer/sr/stats'
import type { DmgTag, FormulaArg, Stat } from '../util'
import {
  customBreakDmg,
  customDmg,
  customHeal,
  customShield,
  getStatFromStatKey,
  listingItem,
  own,
  ownBuff,
  percent,
  registerBuff,
  type TagMapNodeEntries,
} from '../util'

type AbilityScalingType = Exclude<AbilityKey, 'technique' | 'overworld'>

export function getBaseTag(data_gen: CharacterDatum): DmgTag {
  return { elementalType: data_gen.damageType }
}

/**
 * Returns simple `number` arrays representing scalings of a character's traces
 * @param data_gen Character's entire `data` object from sr-stats:allStats
 * @returns Object with entry for basic, skill, ult, talent, technique and eidolon scalings. Eidolon contains further entries 1-6 for each eidolon.
 */
export function scalingParams(data_gen: CharacterDatum) {
  const {
    basic,
    skill,
    ult,
    talent,
    technique,
    bonusAbility1,
    bonusAbility2,
    bonusAbility3,
  } = data_gen.skillTree
  const eidolon = objMap(data_gen.rankMap, (rankInfo) => rankInfo.params)

  return {
    basic: basic.skillParamList,
    skill: skill.skillParamList,
    ult: ult.skillParamList,
    talent: talent.skillParamList,
    technique: technique.skillParamList,
    bonusAbility1: bonusAbility1.skillParamList,
    bonusAbility2: bonusAbility2.skillParamList,
    bonusAbility3: bonusAbility3.skillParamList,
    eidolon,
  }
}

/**
 * Creates an array of TagMapNodeEntries representing a levelable ability's damage instance, and registers their formulas
 * @param name Base name to be used as the key
 * @param dmgTag Tag object containing damageType1, damageType2 and elementalType
 * @param stat Stat that the damage scales on
 * @param levelScaling Array representing the scaling at different levels of the ability
 * @param abilityScalingType Ability level that the scaling depends on. This also controls the default damageType1 for dmgTag, if it is not specified already.
 * @param splits Array of decimals that should add up to 1. Each entry represents the percentage of damage that hit deals, for multi-hit moves. We get splits from SRSim devs, see the array at the top of https://github.com/simimpact/srsim/blob/main/internal/character/march7th/ult.go for example.
 * @param arg `{ team: true }` to use `teamBuff` instead of `ownBuff`. `{ cond: <node> }` to hide these instances behind a conditional check.
 * @param extra Buffs that should only apply to this damage instance
 * @returns Array of TagMapNodeEntries representing the damage instance
 */
export function dmg(
  name: string,
  dmgTag: DmgTag,
  stat: Stat,
  levelScaling: number[],
  abilityScalingType: AbilityScalingType,
  splits: number[] = [1],
  arg: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries[] {
  const multi = percent(subscript(own.char[abilityScalingType], levelScaling))
  const attackType = dmgTag.damageType1 ?? abilityScalingType
  if (attackType === 'talent')
    throw new Error(`Cannot infer attack type for Talent-type ability ${name}`)
  dmgTag.damageType1 = attackType
  const base = prod(own.final[stat], multi)
  return customDmg(name, dmgTag, base, splits, arg, ...extra)
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
  levelScalingFlat: number[],
  abilityScalingType: AbilityScalingType,
  arg: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries {
  const abilityLevel = own.char[abilityScalingType]
  const multi = percent(subscript(abilityLevel, levelScalingMulti))
  const flat = subscript(abilityLevel, levelScalingFlat)
  const base = sum(prod(own.final[stat], multi), flat)
  return customHeal(name, base, arg, ...extra)
}

/**
 * Creates, registers, and returns TagMapNodeEntries for a character's:
 * - Base stats
 * - Stat boost traces
 * - Eidolon 3 and 5
 * @param data_gen Character's entire `data` object from sr-stats:allStats
 * @returns TagMapNodeEntries representing character stats/buffs
 */
export function entriesForChar(data_gen: CharacterDatum): TagMapNodeEntries {
  const { char } = own
  const { eidolon, ascension, lvl } = char
  // The "add" only applies to currLvl - 1, since "base" is stat at lvl 1
  const readLvl = sum(constant(-1), lvl)
  const statBoosts = Object.entries(data_gen.skillTree)
    .filter(([key]) => key.includes('statBoost'))
    .map(([_, s]) => s.levels?.[0]?.stats)
    .filter((s): s is SkillTreeNodeBonusStat => !!s)
  return [
    ownBuff.char.ele.add(data_gen.damageType),
    ownBuff.char.path.add(data_gen.path),
    // Base stats
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const basePerAsc = data_gen.ascension.map((p) => p[sk].base)
      const addPerAsc = data_gen.ascension.map((p) => p[sk].add)
      return ownBuff.base[sk].add(
        sum(
          subscript(ascension, basePerAsc),
          prod(readLvl, subscript(ascension, addPerAsc))
        )
      )
    }),
    ...(['crit_', 'crit_dmg_'] as const).map((sk) => {
      const statAsc = data_gen.ascension.map((p) => p[sk])
      return ownBuff.premod[sk].add(subscript(ascension, statAsc))
    }),
    ownBuff.base.spd.add(
      subscript(
        ascension,
        data_gen.ascension.map((p) => p.spd)
      )
    ),
    // Small trace stat boosts
    ...statBoosts.flatMap((statBoost, index) =>
      Object.entries(statBoost).flatMap(([key, amt]) => {
        const sbKey = `statBoost${(index + 1) as StatBoostKey}` as const
        const buff = getStatFromStatKey(ownBuff.premod, key).add(
          // TODO: Add automatic ascension/level/previous node requirement
          cmpEq(char[sbKey], 1, amt)
        )
        return registerBuff(sbKey, buff)
      })
    ),
    // Eidolon 3 and 5 ability level boosts
    ...([3, 5] as const).flatMap((ei) =>
      Object.entries(data_gen.rankMap[ei].skillTypeAddLevel).flatMap(
        ([abilityKey, levelBoost]) =>
          registerBuff(
            `eidolon${ei}_${abilityKey}`,
            ownBuff.char[abilityKey].add(cmpGE(eidolon, ei, levelBoost))
          )
      )
    ),
    // Break base DMG
    ...customBreakDmg(
      'breakDmg',
      {
        elementalType: data_gen.damageType,
        damageType1: 'break',
      },
      1
    ),
    // Formula listings for stats
    // TODO: Reorder this
    ownBuff.listing.formulas.add(listingItem(own.final.hp)),
    ownBuff.listing.formulas.add(listingItem(own.final.atk)),
    ownBuff.listing.formulas.add(listingItem(own.final.def)),
    ownBuff.listing.formulas.add(listingItem(own.final.spd)),
    ownBuff.listing.formulas.add(listingItem(own.final.enerRegen_)),
    ownBuff.listing.formulas.add(listingItem(own.final.eff_)),
    ownBuff.listing.formulas.add(listingItem(own.final.eff_res_)),
    ownBuff.listing.formulas.add(listingItem(own.final.brEff_)),
    ownBuff.listing.formulas.add(listingItem(own.common.cappedCrit_)),
    ownBuff.listing.formulas.add(listingItem(own.final.crit_dmg_)),
    ownBuff.listing.formulas.add(listingItem(own.final.heal_)),
    ownBuff.listing.formulas.add(
      listingItem(own.final.dmg_[data_gen.damageType])
    ),
    ownBuff.listing.formulas.add(listingItem(own.final.dmg_)),
    ownBuff.listing.formulas.add(listingItem(own.final.weakness_)),
    ownBuff.listing.formulas.add(listingItem(own.final.resPen_)),
  ]
}
