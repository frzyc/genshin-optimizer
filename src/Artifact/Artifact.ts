import { ArtifactMainStatsData, ArtifactSlotsData, ArtifactStarsData, ArtifactSubstatMaxRollEfficiency, ArtifactSubstatMaxRolls, ArtifactSubstatsData } from '../Data/ArtifactData';
import ArtifactDatabase from '../Database/ArtifactDatabase';
import CharacterDatabase from '../Database/CharacterDatabase';
import { ArtifactSubstatLookupTable } from '../Data/ArtifactLookupTable';
import Stat from '../Stat';
import { clampPercent, closeEnoughFloat, closeEnoughInt, deepClone, evalIfFunc } from '../Util/Util';
import { CompressMainStatKey, IArtifact, MainStatKey, StatDict, SubstatKey } from '../Types/artifact';
import { SlotKey, Rarity, ArtifactSetKey, allSlotKeys, SetNum, CharacterKey } from '../Types/consts';
import ICalculatedStats from '../Types/ICalculatedStats';
import { ArtifactSheet } from './ArtifactSheet';
import Conditional from '../Conditional/Conditional';

const maxStar: Rarity = 5

export default class Artifact {
  //do not instantiate.
  constructor() { if (this instanceof Artifact) throw Error('A static class cannot be instantiated.'); }

  //SLOT
  static slotName = (slotKey: SlotKey) => slotKey ? ArtifactSlotsData[slotKey].name : ""

  static slotMainStats = (slotKey: SlotKey): MainStatKey[] => ArtifactSlotsData[slotKey].stats

  static setEffectsObjs = (artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>, stats: ICalculatedStats): Dict<ArtifactSetKey, Dict<SetNum, StatDict>> => {
    let result: Dict<ArtifactSetKey, Dict<SetNum, StatDict>> = {};
    //accumulate the non-conditional stats
    Object.entries(artifactSheets).forEach(([setKey, setObj]) => {
      let setEffect: Dict<SetNum, StatDict> = {}
      Object.entries(setObj.setEffects).forEach(([setNumKey, setEffectObj]) => {
        const setStats = evalIfFunc(setEffectObj.stats, stats)
        if (setStats) setEffect[setNumKey] = deepClone(setStats)
      })
      if (Object.keys(setEffect).length > 0)
        result[setKey] = setEffect;
    })
    Conditional.parseConditionalValues({ artifact: stats.conditionalValues?.artifact }, (conditional, conditionalValue, [, setKey]) => {
      const { setNumKey } = conditional
      const { stats: condStats } = Conditional.resolve(conditional, stats, conditionalValue)
      result[setKey] ?? (result[setKey] = {})
      result[setKey][setNumKey] ?? (result[setKey][setNumKey] = {})
      Object.entries(condStats).forEach(([statKey, value]) =>
        result[setKey][setNumKey][statKey] = (result[setKey][setNumKey][statKey] ?? 0) + value)
    })
    return result
  }

  static splitArtifactsBySlot = (databaseObj: Dict<string, IArtifact>): Dict<SlotKey, IArtifact[]> =>
    Object.fromEntries(allSlotKeys.map(slotKey =>
      [slotKey, Object.values(databaseObj).filter(art => art.slotKey === slotKey)]))

  //MAIN STATS
  static mainStatValues = (numStar: Rarity, statKey: MainStatKey, defVal = []) => {
    if (statKey.endsWith("_dmg_") && statKey !== "physical_dmg_")
      return ArtifactMainStatsData[numStar]["ele_dmg_"]
    return ArtifactMainStatsData[numStar][statKey as CompressMainStatKey] || defVal
  }

  static mainStatValue = (key: MainStatKey, numStars: Rarity, level: number): number | undefined =>
    Artifact.mainStatValues(numStars, key)[level]

  //SUBSTATS
  static rollInfo = (rarity: Rarity): { low: number, high: number, numUpgrades: number } => {
    const data = ArtifactStarsData[rarity]!
    return { low: data.subsBaselow, high: data.subBaseHigh, numUpgrades: data.numUpgradesOrUnlocks }
  }

  static maxSubstatValues = (statKey: SubstatKey, numStars = maxStar): number => ArtifactSubstatMaxRolls[numStars]![statKey]
  static maxSubstatRollEfficiency = (numStar: Rarity): number => ArtifactSubstatMaxRollEfficiency[numStar]
  static getSubstatKeys = (): SubstatKey[] => Object.keys(ArtifactSubstatsData) as SubstatKey[]
  static substatCloseEnough = (key: SubstatKey, value1: number, value2: number): boolean => {
    if (Stat.getStatUnit(key) === "%")
      return closeEnoughFloat(value1, value2)
    else
      return closeEnoughInt(value1, value2)
  }
  static totalPossibleRolls = (numStars: Rarity) => ArtifactStarsData[numStars] ?
    (ArtifactStarsData[numStars]!.subBaseHigh + ArtifactStarsData[numStars]!.numUpgradesOrUnlocks) : 0;
  static rollsRemaining = (level: number, numStars: Rarity) =>
    Math.ceil((numStars * 4 - level) / 4);
  static getSubstatRollData = (substatKey: SubstatKey | "", numStars: Rarity) => ArtifactSubstatsData[substatKey]?.[numStars] ?? []
  static getSubstatRolls = (substatKey: SubstatKey, substatValue: number, numStars: Rarity): number[][] => {
    if (!numStars || !substatKey || typeof substatValue !== "number" || !substatValue) return []
    let rollData = Artifact.getSubstatRollData(substatKey, numStars)
    if (!rollData.length) return []

    let table = ArtifactSubstatLookupTable[substatKey][numStars]
    let lookupValue = substatValue.toFixed(1)

    if (table[lookupValue])
      return table[lookupValue].map(roll => roll.map(i => rollData[i]))
    else return [] // Lookup fails
  }
  static getSubstatEfficiency = (substatKey: SubstatKey | "", rolls: number[]): number => {
    const sum = rolls.reduce((a, b) => a + b, 0)
    const max = substatKey ? Artifact.maxSubstatValues(substatKey) * rolls.length : 0
    return max ? clampPercent((sum / max) * 100) : 0
  }

  //ARTIFACT IN GENERAL
  static substatsValidation(state: IArtifact) {
    const { numStars, level, substats } = state, errors: string[] = []

    const allSubstatRolls: { index: number, substatRolls: number[][] }[] = []
    let total = 0
    substats.forEach((substat, index) => {
      const { key, value } = substat, substatRolls = key ? Artifact.getSubstatRolls(key, value, numStars) : []

      if (substatRolls.length) {
        const possibleLengths = new Set(substatRolls.map(roll => roll.length))
        if (possibleLengths.size !== 1)
          allSubstatRolls.push({ index, substatRolls })
        else
          total += substatRolls[0].length

        substat.rolls = substatRolls[0]
        substat.efficiency = Artifact.getSubstatEfficiency(key, substat.rolls)
      } else {
        if (substat.key)
          errors.push(`Invalid substat ${Stat.getStatNameWithPercent(substat.key)}`)

        substat.rolls = []
        substat.efficiency = 0
      }
    })

    if (errors.length) return errors
    {
      let substat = substats.find(substat => (substat.rolls?.length ?? 0) > 1)
      if (substat && substats.some((substat) => !substat.rolls?.length))
        return [`Substat ${Stat.getStatNameWithPercent(substat.key)} has > 1 roll, but not all substats are unlocked.`]
    }

    const { low } = Artifact.rollInfo(numStars)
    const minimum = low + Math.floor(level / 4)
    const remaining = Artifact.rollsRemaining(level, numStars);
    const maximum = Artifact.totalPossibleRolls(numStars);

    let minimumMaxRolls = Infinity
    function tryAllSubstats(rolls: { index: number, roll: number[] }[], maxRolls: number, total: number) {
      if (rolls.length === allSubstatRolls.length) {
        if (total + remaining <= maximum && total >= minimum && maxRolls < minimumMaxRolls) {
          minimumMaxRolls = maxRolls
          for (const { index, roll } of rolls) {
            const key = substats[index].key
            substats[index].rolls = roll
            substats[index].efficiency = Artifact.getSubstatEfficiency(key, roll)
          }
        }

        return
      }

      const { index, substatRolls } = allSubstatRolls[rolls.length]
      for (const roll of substatRolls) {
        rolls.push({ index, roll })
        tryAllSubstats(rolls, Math.max(maxRolls, roll.length), total + roll.length)
        rolls.pop()
      }
    }

    tryAllSubstats([], 0, total)

    if (!isFinite(minimumMaxRolls)) {
      // No build found
      const total = substats.reduce((accu, current) => accu + (current.rolls?.length ?? 0), 0)
      if (total < minimum)
        errors.push(`${numStars}-star artifact (level ${level}) should have at least ${minimum} rolls. It currently has ${total} rolls.`)
      else {
        errors.push(`${numStars}-star artifact (level ${level}) should have no more than ${maximum - remaining} rolls. It currently has ${total} rolls.`)
      }
    }

    return errors
  }
  static getArtifactEfficiency(artifact: IArtifact, filter: Set<SubstatKey>) {
    const { substats, numStars, level } = artifact
    // Relative to max star, so comparison between different * makes sense.
    const totalRolls = Artifact.totalPossibleRolls(maxStar);
    const current = substats.filter(({ key }) => key && filter.has(key)).reduce((sum, { rolls, efficiency }) => sum + ((efficiency ?? 0) * (rolls?.length ?? 0)), 0)

    const rollsRemaining = Artifact.rollsRemaining(level, numStars);
    const emptySlotCount = substats.filter(s => !s.key).length
    const matchedSlotCount = substats.filter(s => s.key && filter.has(s.key)).length
    const unusedFilterCount = filter.size - matchedSlotCount
    let maximum
    if (emptySlotCount && unusedFilterCount) maximum = current + Artifact.maxSubstatRollEfficiency(numStars) * rollsRemaining // Rolls into good empty slot
    else if (matchedSlotCount) maximum = current + Artifact.maxSubstatRollEfficiency(numStars) * (rollsRemaining - emptySlotCount) // Rolls into existing matched slot
    else maximum = current // No possible roll

    const currentEfficiency = current / totalRolls
    const maximumEfficiency = maximum / totalRolls
    return { currentEfficiency, maximumEfficiency }
  }

  //start with {slotKey:art} end with {setKey:[slotKey]}
  static setToSlots = (artifacts: Dict<SlotKey, IArtifact>): Dict<ArtifactSetKey, SlotKey[]> => {
    let setToSlots: Dict<ArtifactSetKey, SlotKey[]> = {};
    Object.entries(artifacts).forEach(([key, art]) => {
      if (!art) return
      if (setToSlots[art.setKey]) setToSlots[art.setKey]!.push(key)
      else setToSlots[art.setKey] = [key]
    })
    return setToSlots
  };

  //database manipulation
  static equipArtifactOnChar(artifactId: string | undefined, characterKey: CharacterKey) {
    let art = ArtifactDatabase.get(artifactId);
    if (!art) return;
    let currentLocation = art.location;
    let intendedLocation = (characterKey || "")
    if (currentLocation === intendedLocation) return;
    let slotKey = art.slotKey
    let artifactToSwapWithid = CharacterDatabase.getArtifactIDFromSlot(intendedLocation, slotKey)
    let artifactToSwapWith = ArtifactDatabase.get(artifactToSwapWithid)

    //update artifact
    if (artifactToSwapWith) ArtifactDatabase.swapLocations(art, artifactToSwapWith)
    else ArtifactDatabase.moveToNewLocation(art.id, intendedLocation)

    //update Character
    if (intendedLocation)
      CharacterDatabase.equipArtifactOnSlot(intendedLocation, art.slotKey, art.id)

    if (currentLocation) {
      CharacterDatabase.equipArtifactOnSlot(currentLocation, slotKey, artifactToSwapWith?.id ?? "")
    }
  }
  static unequipArtifact(artifactId: string | undefined) {
    const art = ArtifactDatabase.get(artifactId)
    if (!art || !art.location) return
    const location = art.location
    const slotKey = art.slotKey
    CharacterDatabase.equipArtifactOnSlot(location, slotKey, "")
    ArtifactDatabase.moveToNewLocation(artifactId)
  }
}
