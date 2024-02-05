import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  cmpEq,
  cmpGE,
  constant,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import {
  allEidolonKeys,
  type AbilityKey,
  type StatBoostKey,
} from '@genshin-optimizer/sr/consts'
import type {
  CharacterDatum,
  SkillTreeNodeBonusStat,
} from '@genshin-optimizer/sr/stats'
import type { DmgTag, FormulaArg, Stat } from '../util'
import {
  TypeKeyToListingType,
  customDmg,
  customHeal,
  customShield,
  getStatFromStatKey,
  listingItem,
  percent,
  self,
  selfBuff,
  type TagMapNodeEntries,
} from '../util'

type AbilityScalingType = Exclude<AbilityKey, 'technique' | 'overworld'>

export function getBaseTag(data_gen: CharacterDatum): DmgTag {
  return { elementalType: TypeKeyToListingType[data_gen.damageType] }
}

/**
 * Returns simple `number` arrays representing scalings of a character's traces
 * @param data_gen Character's entire `data` object from sr-stats:allStats
 * @returns Object with entry for basic, skill, ult, talent, technique and eidolon scalings. Eidolon contains further entries 1-6 for each eidolon.
 */
export function scalingParams(data_gen: CharacterDatum) {
  const [basic, skill, ult, talent, technique] = data_gen.skillTreeList
    .map((s) => s.skillParamList)
    .filter((s): s is number[][] => !!s)
  const eidolon = objKeyMap(
    allEidolonKeys,
    (eidolon) => data_gen.rankMap[eidolon].params
  )

  return {
    basic,
    skill,
    ult,
    talent,
    technique,
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
 * @param arg `{ team: true }` to use `teamBuff` instead of `selfBuff`. `{ cond: <node> }` to hide these instances behind a conditional check.
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
  const multi = percent(subscript(self.char[abilityScalingType], levelScaling))
  const attackType = dmgTag.damageType1 ?? abilityScalingType
  if (attackType === 'talent')
    throw new Error(`Cannot infer attack type for Talent-type ability ${name}`)
  dmgTag.damageType1 = attackType
  const base = prod(self.final[stat], multi)
  return customDmg(name, dmgTag, base, splits, arg, ...extra)
}

/**
 * Creates an array of TagMapNodeEntries representing a levelable ability's shield instance, and registers their formulas
 * @param name Base name to be used as the key
 * @param stat Stat that the damage scales on
 * @param levelScalingMulti Array representing the multiplicative scaling at different levels of the ability
 * @param levelScalingFlat Array representing the flat scaling at different levels of the ability
 * @param abilityScalingType Ability level that the scaling depends on
 * @param arg `{ team: true }` to use `teamBuff` instead of `selfBuff`. `{ cond: <node> }` to hide these instances behind a conditional check.
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
  const abilityLevel = self.char[abilityScalingType]
  const multi = percent(subscript(abilityLevel, levelScalingMulti))
  const flat = subscript(abilityLevel, levelScalingFlat)
  const base = sum(prod(self.final[stat], multi), flat)
  return customShield(name, base, arg, ...extra)
}

/**
 * Creates an array of TagMapNodeEntries representing a levelable ability's heal instance, and registers their formulas
 * @param name Base name to be used as the key
 * @param stat Stat that the damage scales on
 * @param levelScalingMulti Array representing the multiplicative scaling at different levels of the ability
 * @param levelScalingFlat Array representing the flat scaling at different levels of the ability
 * @param abilityScalingType Ability level that the scaling depends on
 * @param arg `{ team: true }` to use `teamBuff` instead of `selfBuff`. `{ cond: <node> }` to hide these instances behind a conditional check.
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
  const abilityLevel = self.char[abilityScalingType]
  const multi = percent(subscript(abilityLevel, levelScalingMulti))
  const flat = subscript(abilityLevel, levelScalingFlat)
  const base = sum(prod(self.final[stat], multi), flat)
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
  const { char } = self
  const { eidolon, ascension, lvl, ele, path } = char
  // The "add" only applies to currLvl - 1, since "base" is stat at lvl 1
  const readLvl = sum(constant(-1), lvl)
  const statBoosts = data_gen.skillTreeList
    .map((s) => s.levels?.[0]?.stats)
    .filter((s): s is SkillTreeNodeBonusStat => !!s)
  return [
    ele.add(data_gen.damageType),
    path.add(data_gen.path),
    // Base stats
    ...(['hp', 'atk', 'def'] as const).map((sk) => {
      const basePerAsc = data_gen.ascension.map((p) => p[sk].base)
      const addPerAsc = data_gen.ascension.map((p) => p[sk].add)
      return selfBuff.base[sk].add(
        sum(
          subscript(ascension, basePerAsc),
          prod(readLvl, subscript(ascension, addPerAsc))
        )
      )
    }),
    ...(['crit_', 'crit_dmg_'] as const).map((sk) => {
      const statAsc = data_gen.ascension.map((p) => p[sk])
      return selfBuff.premod[sk].add(subscript(ascension, statAsc))
    }),
    selfBuff.base.spd.add(
      subscript(
        ascension,
        data_gen.ascension.map((p) => p.spd)
      )
    ),
    // Small trace stat boosts
    ...statBoosts.flatMap((statBoost) =>
      Object.entries(statBoost).map(([key, amt], index) => {
        return getStatFromStatKey(selfBuff.premod, key).add(
          cmpEq(char[`statBoost${(index + 1) as StatBoostKey}`], 1, amt)
        )
      })
    ),
    // Eidolon 3 and 5 ability level boosts
    ...([3, 5] as const).flatMap((ei) =>
      Object.entries(data_gen.rankMap[3].skillTypeAddLevel).map(
        ([abilityKey, levelBoost]) =>
          selfBuff.char[abilityKey].add(cmpGE(eidolon, ei, levelBoost))
      )
    ),
    // Formula listings for stats
    // TODO: Reorder this
    selfBuff.listing.formulas.add(listingItem(self.final.hp)),
    selfBuff.listing.formulas.add(listingItem(self.final.atk)),
    selfBuff.listing.formulas.add(listingItem(self.final.def)),
    selfBuff.listing.formulas.add(listingItem(self.final.spd)),
    selfBuff.listing.formulas.add(listingItem(self.final.enerRegen_)),
    selfBuff.listing.formulas.add(listingItem(self.final.eff_)),
    selfBuff.listing.formulas.add(listingItem(self.final.eff_res_)),
    selfBuff.listing.formulas.add(listingItem(self.final.brEff_)),
    selfBuff.listing.formulas.add(listingItem(self.common.cappedCrit_)),
    selfBuff.listing.formulas.add(listingItem(self.final.crit_dmg_)),
    selfBuff.listing.formulas.add(listingItem(self.final.heal_)),
    selfBuff.listing.formulas.add(
      listingItem(self.final.dmg_[TypeKeyToListingType[data_gen.damageType]])
    ),
    selfBuff.listing.formulas.add(listingItem(self.final.dmg_.physical)),
  ]
}
