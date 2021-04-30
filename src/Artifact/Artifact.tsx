import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SlotIcon from '../Components/SlotIcon';
import { ArtifactMainStatsData, ArtifactSlotsData, ArtifactStarsData, ArtifactSubstatsData, ArtifactSubstatsMinMax } from '../Data/ArtifactData';
import ArtifactDatabase from '../Database/ArtifactDatabase';
import CharacterDatabase from '../Database/CharacterDatabase';
import { ArtifactSubstatLookupTable } from '../Data/ArtifactLookupTable';
import Stat from '../Stat';
import { clampPercent, closeEnoughFloat, closeEnoughInt, deepClone, evalIfFunc } from '../Util/Util';
import { IArtifact, MainStatKey, SetEffectEntry, SubstatKey } from '../Types/artifact';
import { SlotKey, Rarity, ArtifactSet, allSlotKeys, SetNum } from '../Types/consts';
import ICalculatedStats from '../Types/ICalculatedStats';
import { ArtifactSheet } from './ArtifactSheet';
import Conditional from '../Conditional/Conditional';

const maxStar: Rarity = 5

export default class Artifact {
  //do not instantiate.
  constructor() { if (this instanceof Artifact) throw Error('A static class cannot be instantiated.'); }

  //SLOT
  static slotName = (slotKey: SlotKey) => slotKey ? ArtifactSlotsData[slotKey].name : ""
  static slotIcon = (slotKey: SlotKey) => <FontAwesomeIcon icon={SlotIcon[slotKey]} key={slotKey} className="fa-fw" />
  static slotNameWithIcon = (slotKey: SlotKey) => {
    let name = Artifact.slotName(slotKey)
    let slotIcon = Artifact.slotIcon(slotKey)
    return <span>{slotIcon} {name}</span>
  }

  static slotMainStats = (slotKey: SlotKey): MainStatKey[] => ArtifactSlotsData[slotKey].stats

  static setEffectsObjs = (artifactSheets: StrictDict<ArtifactSet, ArtifactSheet>, stats: ICalculatedStats): Dict<ArtifactSet, Dict<SetNum, SetEffectEntry>> => {
    let result: Dict<ArtifactSet, Dict<SetNum, SetEffectEntry>> = {};
    //accumulate the non-conditional stats
    Object.entries(artifactSheets).forEach(([setKey, setObj]) => {
      let setEffect: Dict<SetNum, SetEffectEntry> = {}
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
  static mainStatValues = (numStar, statKey, defVal = []) =>
    ArtifactMainStatsData?.[numStar]?.[statKey] || defVal

  static mainStatValue = (key, numStars, level): number | undefined => {
    let main = Artifact.mainStatValues(numStars, key)[level]
    if (main) return main
    else if (key?.includes("_dmg_")) // because in the database its still stored as ele_dmg_
      return Artifact.mainStatValue("ele_dmg_", numStars, level)
  }

  //SUBSTATS
  static rollInfo = (rarity: Rarity): { low: number, high: number, numUpgrades: number } => {
    const data = ArtifactStarsData[rarity]!
    return { low: data.subsBaselow, high: data.subBaseHigh, numUpgrades: data.numUpgradesOrUnlocks }
  }

  static maxSubstatValues = (statKey, numStars = maxStar, defVal = 0) => ArtifactSubstatsMinMax?.[statKey]?.max[numStars] ?? defVal
  static getSubstatKeys = (): SubstatKey[] => Object.keys(ArtifactSubstatsData) as SubstatKey[]
  static substatCloseEnough = (key, value1, value2) => {
    if (Stat.getStatUnit(key) === "%")
      return closeEnoughFloat(value1, value2)
    else
      return closeEnoughInt(value1, value2)
  }
  static totalPossibleRolls = (numStars) => ArtifactStarsData[numStars] ?
    (ArtifactStarsData[numStars].subBaseHigh + ArtifactStarsData[numStars].numUpgradesOrUnlocks) : 0;
  static rollsRemaining = (level, numStars) =>
    Math.ceil((numStars * 4 - level) / 4);
  static numberOfSubstatUnlocked = (state) =>
    state.substats.reduce((sum, cur) =>
      sum + (cur && cur.value ? 1 : 0), 0);
  static getSubstatRollData = (substatKey, numStars) => ArtifactSubstatsData?.[substatKey]?.[numStars] ?? []
  static getSubstatRolls = (substatKey: SubstatKey, substatValue: number, numStars: number): number[][] => {
    if (!numStars || !substatKey || typeof substatValue !== "number" || !substatValue) return []
    let rollData = Artifact.getSubstatRollData(substatKey, numStars)
    if (!rollData.length) return []

    let table = ArtifactSubstatLookupTable[substatKey][numStars]
    let lookupValue = substatValue.toFixed(1)

    if (table[lookupValue])
      return table[lookupValue].map(roll => roll.map(i => rollData[i]))
    else return [] // Lookup fails
  }
  static getSubstatEfficiency = (substatKey, rolls) => {
    const sum = rolls.reduce((a, b) => a + b, 0)
    const max = Artifact.maxSubstatValues(substatKey) * rolls.length
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
    function tryAllSubstats(rolls, maxRolls, total) {
      if (rolls.length === allSubstatRolls.length) {
        if (total + remaining <= maximum && total >= minimum && maxRolls < minimumMaxRolls) {
          minimumMaxRolls = maxRolls
          for (const { index, roll } of rolls) {
            substats[index].rolls = roll
            substats[index].efficiency = Artifact.getSubstatEfficiency(substats[index].key, roll)
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
    } else {
      // Found valid build, filling missing data
      for (const substat of substats)
        substat.accurateValue = substat.rolls!.reduce((sum, cur) => sum + cur, 0)
      const { currentEfficiency, maximumEfficiency } = Artifact.getArtifactEfficiency(substats, numStars, level)
      state.currentEfficiency = currentEfficiency
      state.maximumEfficiency = maximumEfficiency
    }

    return errors
  }
  static getArtifactEfficiency(substats, numStars, level) {
    if (!numStars) return { currentEfficiency: 0, maximumEfficiency: 0 }
    // Relative to max star, so comparison between different * makes sense.
    let totalRolls = Artifact.totalPossibleRolls(maxStar);
    let rollsRemaining = Artifact.rollsRemaining(level, numStars);
    let current = substats.reduce((sum, { key, accurateValue }) => sum + (key ? (accurateValue / ArtifactSubstatsMinMax[key].max[maxStar]) : 0), 0)
    let maximum = current + rollsRemaining
    let currentEfficiency = current * 100 / totalRolls
    let maximumEfficiency = maximum * 100 / totalRolls
    return { currentEfficiency, maximumEfficiency }
  }

  //start with {slotKey:art} end with {setKey:[slotKey]}
  static setToSlots = (artifacts: Dict<SlotKey, IArtifact>): Dict<ArtifactSet, SlotKey[]> => {
    let setToSlots = {};
    Object.entries(artifacts).forEach(([key, art]) => {
      if (!art) return
      if (setToSlots[art.setKey]) setToSlots[art.setKey].push(key)
      else setToSlots[art.setKey] = [key]
    })
    return setToSlots
  };

  //database manipulation
  static equipArtifactOnChar(artifactId, characterKey) {
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
      CharacterDatabase.equipArtifact(intendedLocation, art)

    if (currentLocation) {
      if (artifactToSwapWith)
        CharacterDatabase.equipArtifact(currentLocation, artifactToSwapWith)
      else
        CharacterDatabase.unequipArtifactOnSlot(currentLocation, slotKey)
    }
  }
  static unequipArtifact(artifactId) {
    const art = ArtifactDatabase.get(artifactId)
    if (!art || !art.location) return
    const location = art.location
    const slotKey = art.slotKey
    CharacterDatabase.unequipArtifactOnSlot(location, slotKey)
    ArtifactDatabase.moveToNewLocation(artifactId)
  }
}
