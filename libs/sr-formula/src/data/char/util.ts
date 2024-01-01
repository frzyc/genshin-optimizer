import {
  cmpEq,
  cmpGE,
  constant,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando'
import {
  allEidolonKeys,
  type AbilityKey,
  type StatBoostKey,
  type TypeKey,
} from '@genshin-optimizer/sr-consts'
import type {
  CharacterDataGen,
  SkillTreeNodeBonusStat,
} from '@genshin-optimizer/sr-stats'
import { objKeyMap } from '@genshin-optimizer/util'
import type { AttackType, FormulaArg, Stat, Type } from '../util'
import {
  TypeKeyToListingType,
  customDmg,
  customHeal,
  customShield,
  listingItem,
  percent,
  self,
  selfBuff,
  type TagMapNodeEntries,
} from '../util'

type AbilityScalingType = Exclude<AbilityKey, 'technique'>

export function scalingParams(data_gen: CharacterDataGen) {
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
 * @param type Type of the damage
 * @param stat Stat that the damage scales on
 * @param levelScaling Array representing the scaling at different levels of the ability
 * @param abilityScalingType Ability level that the scaling depends on
 * @param splits Array of decimals that should add up to 1. Each entry represents the percentage of damage that hit deals, for multi-hit moves. We get splits from SRSim devs, see the array at the top of https://github.com/simimpact/srsim/blob/main/internal/character/march7th/ult.go for example.
 * @param overrideAttackType Type of attack damage that is dealt, only need to set if it deals a different damage type than abilityScalingType, or if abilityScalingType is Talent
 * @param arg
 * @param extra Buffs that should only apply to this damage instance
 * @returns Array of TagMapNodeEntries representing the damage instance
 */
export function dmg(
  name: string,
  type: TypeKey,
  stat: Stat,
  levelScaling: number[],
  abilityScalingType: AbilityScalingType,
  splits: number[] = [1],
  overrideAttackType: AttackType | undefined = undefined,
  arg: FormulaArg = {},
  ...extra: TagMapNodeEntries
): TagMapNodeEntries[] {
  const multi = percent(subscript(self.char[abilityScalingType], levelScaling))
  const attackType = overrideAttackType ?? abilityScalingType
  if (attackType === 'talent')
    throw new Error(`Cannot infer attack type for Talent-type ability ${name}`)
  const base = prod(self.final[stat], multi)
  return customDmg(name, type, attackType, base, splits, arg, ...extra)
}

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

export function entriesForChar(data_gen: CharacterDataGen): TagMapNodeEntries {
  const { final: _final, char } = self
  const { eidolon, ascension } = char
  // The "add" only applies to currLvl - 1, since "base" is stat at lvl 1
  const readLvl = sum(constant(-1), self.char.lvl)
  const statBoosts = data_gen.skillTreeList
    .map((s) => s.levels?.[0]?.stats)
    .filter((s): s is SkillTreeNodeBonusStat => !!s)
  return [
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
    ...(['crit_', 'crit_dmg_', 'spd'] as const).map((sk) => {
      const statAsc = data_gen.ascension.map((p) => p[sk])
      switch (sk) {
        case 'crit_':
        case 'crit_dmg_':
          return selfBuff.premod[sk].add(subscript(ascension, statAsc))
        case 'spd':
          return selfBuff.base[sk].add(subscript(ascension, statAsc))
      }
    }),
    // Small trace stat boosts
    ...statBoosts.flatMap((statBoost) =>
      Object.entries(statBoost).map(([key, amt], index) => {
        let stat
        switch (key) {
          case 'physical_dmg_':
          case 'fire_dmg_':
          case 'ice_dmg_':
          case 'wind_dmg_':
          case 'lightning_dmg_':
          case 'quantum_dmg_':
          case 'imaginary_dmg_':
            // substring will fetch 'physical' from 'physical_dmg_', for example
            stat =
              selfBuff.premod.dmg_[key.substring(0, key.indexOf('_')) as Type]
            break
          default:
            stat = selfBuff.premod[key]
            break
        }
        return stat.add(
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
