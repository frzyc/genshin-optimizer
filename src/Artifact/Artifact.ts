import { ArtifactSlotsData, ArtifactStarsData } from '../Data/ArtifactData';
import { clampPercent, deepClone, evalIfFunc } from '../Util/Util';
import { allSubstats, IArtifact, MainStatKey, SubstatKey } from '../Types/artifact';
import { SlotKey, Rarity, ArtifactSetKey, allSlotKeys, SetNum, allRarities } from '../Types/consts';
import { BonusStats, ICalculatedStats } from '../Types/stats';
import { ArtifactSheet } from './ArtifactSheet';
import Conditional from '../Conditional/Conditional';
import { ArtifactSetEffects } from '../Types/Build';
import { mergeStats } from '../Util/StatUtil';
import ArtifactMainStatsData from './artifact_main_gen.json'
import ArtifactSubstatsData from './artifact_sub_gen.json'
import ArtifactSubstatLookupTable from './artifact_sub_rolls_gen.json'

const maxStar: Rarity = 5

export default class Artifact {
  //do not instantiate.
  constructor() { if (this instanceof Artifact) throw Error('A static class cannot be instantiated.'); }

  //SLOT
  static slotName = (slotKey: SlotKey): string =>
    ArtifactSlotsData[slotKey].name
  static slotMainStats = (slotKey: SlotKey): readonly MainStatKey[] =>
    ArtifactSlotsData[slotKey].stats

  static setEffectsObjs = (artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>, stats: ICalculatedStats): ArtifactSetEffects => {
    const result: ArtifactSetEffects = {};
    //accumulate the non-conditional stats
    Object.entries(artifactSheets).forEach(([setKey, setObj]) => {
      const setEffect: Dict<SetNum, BonusStats> = {}
      Object.entries(setObj.setEffects).forEach(([setNumKey, entry]) => {
        const setStats = evalIfFunc(entry.stats, stats)
        if (setStats) setEffect[setNumKey] = deepClone(setStats)
      })
      if (Object.keys(setEffect).length > 0)
        result[setKey] = setEffect;
    })
    Conditional.parseConditionalValues({ artifact: stats.conditionalValues?.artifact }, (conditional, conditionalValue, [, setKey, setNumKey]) => {
      const { stats: condStats } = Conditional.resolve(conditional, stats, conditionalValue)
      result[setKey] ?? (result[setKey] = {})
      result[setKey][setNumKey] ?? (result[setKey][setNumKey] = {})
      mergeStats(result[setKey][setNumKey], condStats)
    })
    return result
  }

  static splitArtifactsBySlot = (databaseObj: IArtifact[]): Dict<SlotKey, IArtifact[]> =>
    Object.fromEntries(allSlotKeys.map(slotKey =>
      [slotKey, databaseObj.filter(art => art.slotKey === slotKey)]))

  //MAIN STATS
  static mainStatValues = (numStar: Rarity, statKey: MainStatKey): readonly number[] => {
    if (statKey.endsWith('_')) // TODO: % CONVERSION
      return ArtifactMainStatsData[numStar][statKey].map(k => k * 100)
    return ArtifactMainStatsData[numStar][statKey]
  }
  static mainStatValue = (key: MainStatKey, numStars: Rarity, level: number): number =>
    Artifact.mainStatValues(numStars, key)[level]

  //SUBSTATS
  static rollInfo = (rarity: Rarity): { low: number, high: number, numUpgrades: number } =>
    ArtifactStarsData[rarity]

  static maxSubstatValues = (substatKey: SubstatKey, numStars = maxStar): number => {
    if (substatKey.endsWith("_")) // TODO: % CONVERSION
      return Math.max(...ArtifactSubstatsData[numStars][substatKey]) * 100
    return Math.max(...ArtifactSubstatsData[numStars][substatKey])
  }

  static maxSubstatRollEfficiency = Object.fromEntries(allRarities.map(rarity =>
    [rarity, 100 * Math.max(...allSubstats.map(substat =>
      Artifact.maxSubstatValues(substat, rarity) /
      Artifact.maxSubstatValues(substat, maxStar)))]))
  static getSubstatKeys = (): readonly SubstatKey[] =>
    allSubstats
  static totalPossibleRolls = (numStars: Rarity): number =>
    ArtifactStarsData[numStars].high + ArtifactStarsData[numStars].numUpgrades
  static rollsRemaining = (level: number, numStars: Rarity) =>
    Math.ceil((numStars * 4 - level) / 4)
  static getSubstatRollData = (substatKey: SubstatKey, numStars: Rarity) => {
    if (substatKey.endsWith("_")) // TODO: % CONVERSION
      return ArtifactSubstatsData[numStars][substatKey].map(v => v * 100)
    return ArtifactSubstatsData[numStars][substatKey]
  }

  static getSubstatRolls = (substatKey: SubstatKey, substatValue: number, numStars: Rarity): number[][] => {
    const rollData = Artifact.getSubstatRollData(substatKey, numStars)
    const table = ArtifactSubstatLookupTable[numStars][substatKey]
    const lookupValue = Math.round(substatKey.endsWith('_')
      ? (substatValue * 10) // TODO: % CONVERSION
      : substatValue)
    return table[lookupValue]?.map(roll => roll.map(i => rollData[i])) ?? []
  }
  static getSubstatEfficiency = (substatKey: SubstatKey | "", rolls: number[]): number => {
    const sum = rolls.reduce((a, b) => a + b, 0)
    const max = substatKey ? Artifact.maxSubstatValues(substatKey) * rolls.length : 0
    return max ? clampPercent((sum / max) * 100) : 0
  }

  //ARTIFACT IN GENERAL
  static getArtifactEfficiency(artifact: IArtifact, filter: Set<SubstatKey>): { currentEfficiency: number, maxEfficiency: number } {
    const { substats, numStars, level } = artifact
    // Relative to max star, so comparison between different * makes sense.
    const totalRolls = Artifact.totalPossibleRolls(maxStar);
    const current = substats.filter(({ key }) => key && filter.has(key)).reduce((sum, { rolls, efficiency }) => sum + ((efficiency ?? 0) * (rolls?.length ?? 0)), 0)

    const rollsRemaining = Artifact.rollsRemaining(level, numStars);
    const emptySlotCount = substats.filter(s => !s.key).length
    const matchedSlotCount = substats.filter(s => s.key && filter.has(s.key)).length
    const unusedFilterCount = filter.size - matchedSlotCount
    let maximum
    if (emptySlotCount && unusedFilterCount) maximum = current + Artifact.maxSubstatRollEfficiency[numStars] * rollsRemaining // Rolls into good empty slot
    else if (matchedSlotCount) maximum = current + Artifact.maxSubstatRollEfficiency[numStars] * (rollsRemaining - emptySlotCount) // Rolls into existing matched slot
    else maximum = current // No possible roll

    const currentEfficiency = current / totalRolls
    const maxEfficiency = maximum / totalRolls
    return { currentEfficiency, maxEfficiency }
  }

  //start with {slotKey:art} end with {setKey:[slotKey]}
  static setToSlots = (artifacts: Dict<SlotKey, IArtifact>): Dict<ArtifactSetKey, SlotKey[]> => {
    const setToSlots: Dict<ArtifactSetKey, SlotKey[]> = {};
    Object.entries(artifacts).forEach(([key, art]) => {
      if (!art) return
      if (setToSlots[art.setKey]) setToSlots[art.setKey]!.push(key)
      else setToSlots[art.setKey] = [key]
    })
    return setToSlots
  }
}
