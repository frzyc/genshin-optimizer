import KeyMap, { cacheValueString } from '../../KeyMap';
import { allSubstatKeys, ICachedArtifact, MainStatKey, SubstatKey } from '../../Types/artifact';
import { allRarities, allSlotKeys, ArtifactRarity, ArtifactSetKey, Rarity, RollColorKey, SlotKey } from '../../Types/consts';
import { clampPercent, objectKeyMap } from '../../Util/Util';
import ArtifactMainStatsData from './artifact_main_gen.json';
import ArtifactSubstatsData from './artifact_sub_gen.json';
import ArtifactSubstatLookupTable from './artifact_sub_rolls_gen.json';

const maxStar: Rarity = 5

export const maxArtifactLevel = {
  1: 4,
  2: 4,
  3: 12,
  4: 16,
  5: 20
} as const

const ArtifactSubstatRollData: StrictDict<Rarity, { low: number, high: number, numUpgrades: number }> = {
  1: { low: 0, high: 0, numUpgrades: 1 },
  2: { low: 0, high: 1, numUpgrades: 2 },
  3: { low: 1, high: 2, numUpgrades: 3 },
  4: { low: 2, high: 3, numUpgrades: 4 },
  5: { low: 3, high: 4, numUpgrades: 5 }
};
export const artifactSandsStatKeys = ["hp_", "def_", "atk_", "eleMas", "enerRech_"] as const
export type ArtifactSandsStatKey = typeof artifactSandsStatKeys[number]

export const artifactGobletStatKeys = ["hp_", "def_", "atk_", "eleMas", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "dendro_dmg_"] as const
export type ArtifactGobletStatKey = typeof artifactGobletStatKeys[number]

export const artifactCircletStatKeys = ["hp_", "def_", "atk_", "eleMas", "critRate_", "critDMG_", "heal_"] as const
export type ArtifactCircletStatKey = typeof artifactCircletStatKeys[number]

const ArtifactSlotsData = {
  flower: { name: "Flower of Life", stats: ["hp"] },
  plume: { name: "Plume of Death", stats: ["atk"] },
  sands: { name: "Sands of Eon", stats: artifactSandsStatKeys },
  goblet: { name: "Goblet of Eonothem", stats: artifactGobletStatKeys },
  circlet: { name: "Circlet of Logos", stats: artifactCircletStatKeys },
} as const

export default class Artifact {
  //do not instantiate.
  constructor() { if (this instanceof Artifact) throw Error('A static class cannot be instantiated.'); }

  //SLOT
  static slotName = (slotKey: SlotKey): string =>
    ArtifactSlotsData[slotKey].name
  static slotMainStats = (slotKey: SlotKey): readonly MainStatKey[] =>
    ArtifactSlotsData[slotKey].stats

  static splitArtifactsBySlot = (databaseObj: ICachedArtifact[]) =>
    objectKeyMap(allSlotKeys, slotKey => databaseObj.filter(art => art.slotKey === slotKey))

  //MAIN STATS
  static mainStatValues = (numStar: Rarity, statKey: MainStatKey): readonly number[] => {
    if (statKey.endsWith('_')) // TODO: % CONVERSION
      return ArtifactMainStatsData[numStar][statKey].map(k => k * 100)
    return ArtifactMainStatsData[numStar][statKey]
  }
  static mainStatValue = (key: MainStatKey, rarity: Rarity, level: number): number =>
    Artifact.mainStatValues(rarity, key)[level]

  //SUBSTATS
  static rollInfo = (rarity: Rarity): { low: number, high: number, numUpgrades: number } =>
    ArtifactSubstatRollData[rarity]

  static substatValue = (substatKey: SubstatKey, rarity = maxStar, type: "max" | "min" | "mid" = "max"): number => {
    const substats = ArtifactSubstatsData[rarity][substatKey]
    const value = type === "max" ? Math.max(...substats) :
      type === "min" ? Math.min(...substats) :
        substats.reduce((a, b) => a + b, 0) / substats.length
    return substatKey.endsWith("_") ? value * 100 : value
  }

  static maxSubstatRollEfficiency = objectKeyMap(allRarities,
    rarity => 100 * Math.max(...allSubstatKeys.map(substat =>
      Artifact.substatValue(substat, rarity) /
      Artifact.substatValue(substat, maxStar))))

  static totalPossibleRolls = (rarity: Rarity): number =>
    ArtifactSubstatRollData[rarity].high + ArtifactSubstatRollData[rarity].numUpgrades
  static rollsRemaining = (level: number, rarity: Rarity) =>
    Math.ceil((rarity * 4 - level) / 4)
  static getSubstatRollData = (substatKey: SubstatKey, rarity: Rarity) => {
    if (substatKey.endsWith("_")) // TODO: % CONVERSION
      return ArtifactSubstatsData[rarity][substatKey].map(v => v * 100)
    return ArtifactSubstatsData[rarity][substatKey]
  }

  static getSubstatRolls = (substatKey: SubstatKey, substatValue: number, rarity: ArtifactRarity): number[][] => {
    const rollData = Artifact.getSubstatRollData(substatKey, rarity)
    const table = ArtifactSubstatLookupTable[rarity][substatKey]
    const lookupValue = cacheValueString(substatValue, KeyMap.unit(substatKey))
    return table[lookupValue]?.map(roll => roll.map(i => rollData[i])) ?? []
  }
  static getSubstatEfficiency = (substatKey: SubstatKey | "", rolls: number[]): number => {
    const sum = rolls.reduce((a, b) => a + b, 0)
    const max = substatKey ? Artifact.substatValue(substatKey) * rolls.length : 0
    return max ? clampPercent((sum / max) * 100) : 0
  }

  //ARTIFACT IN GENERAL
  static getArtifactEfficiency(artifact: ICachedArtifact, filter: Set<SubstatKey>): { currentEfficiency: number, maxEfficiency: number } {
    const { substats, rarity, level } = artifact
    // Relative to max star, so comparison between different * makes sense.
    const currentEfficiency = substats.filter(({ key }) => key && filter.has(key)).reduce((sum, { efficiency }) => sum + (efficiency ?? 0), 0)

    const rollsRemaining = Artifact.rollsRemaining(level, rarity);
    const emptySlotCount = substats.filter(s => !s.key).length
    const matchedSlotCount = substats.filter(s => s.key && filter.has(s.key)).length
    const unusedFilterCount = filter.size - matchedSlotCount - (filter.has(artifact.mainStatKey as any) ? 1 : 0)
    let maxEfficiency
    if (emptySlotCount && unusedFilterCount) maxEfficiency = currentEfficiency + Artifact.maxSubstatRollEfficiency[rarity] * rollsRemaining // Rolls into good empty slot
    else if (matchedSlotCount) maxEfficiency = currentEfficiency + Artifact.maxSubstatRollEfficiency[rarity] * (rollsRemaining - emptySlotCount) // Rolls into existing matched slot
    else maxEfficiency = currentEfficiency // No possible roll

    return { currentEfficiency, maxEfficiency }
  }

  //start with {slotKey:art} end with {setKey:[slotKey]}
  static setToSlots = (artifacts: Dict<SlotKey, ICachedArtifact>): Dict<ArtifactSetKey, SlotKey[]> => {
    const setToSlots: Dict<ArtifactSetKey, SlotKey[]> = {};
    Object.entries(artifacts).forEach(([key, art]) => {
      if (!art) return
      if (setToSlots[art.setKey]) setToSlots[art.setKey]!.push(key)
      else setToSlots[art.setKey] = [key]
    })
    return setToSlots
  }
  static levelVariant = (level: number) => "roll" + (Math.floor(Math.max(level, 0) / 4) + 1) as RollColorKey
}
