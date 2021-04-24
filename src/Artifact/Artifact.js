import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SlotIcon from '../Components/SlotIcon';
import Conditional from '../Conditional/Conditional';
import { ArtifactData, ArtifactDataImport, ArtifactMainSlotKeys, ArtifactMainStatsData, ArtifactSlotsData, ArtifactStarsData, ArtifactSubStatsData, ArtifactSubstatsMinMax } from '../Data/ArtifactData';
import ArtifactDatabase from '../Database/ArtifactDatabase';
import CharacterDatabase from '../Database/CharacterDatabase';
import { ArtifactSubstatLookupTable } from '../Data/ArtifactLookupTable';
import Stat from '../Stat';
import { clampPercent, closeEnoughFloat, closeEnoughInt, deepClone } from '../Util/Util';

const maxStar = 5

export default class Artifact {
  //do not instantiate.
  constructor() { if (this instanceof Artifact) throw Error('A static class cannot be instantiated.'); }

  //SETS
  static getDataImport = () => ArtifactDataImport
  static getSetKeys = () => Object.keys(ArtifactData || {})
  static getSetName = (key, defVal = "") => ArtifactData?.[key]?.name || defVal;
  static getSetsByMaxStarEntries = (star) =>
    Object.entries(ArtifactData || {}).filter(([, setobj]) => setobj.rarity[(setobj.rarity.length) - 1] === star)
  static getPieces = (setKey, defVal = {}) => ArtifactData?.[setKey]?.pieces || defVal
  static getPieceName = (setKey, slotKey, defVal = "") => this.getPieces(setKey)[slotKey] || defVal;
  static getPieceIcon = (setKey, slotKey, defVal = null) => ArtifactData?.[setKey]?.icons?.[slotKey] || defVal;

  //SETEFFECT
  static getSetEffectsObj = (setKey, defVal = {}) => ArtifactData?.[setKey]?.setEffects || defVal
  static getArtifactSetNumStats = (setKey, setNumKey, defVal = {}) =>
    deepClone(this.getSetEffectsObj(setKey)?.[setNumKey]?.stats || defVal)
  static getArtifactSetEffectsStats = (setToSlots) => {
    let artifactSetEffect = []
    Object.entries(setToSlots).forEach(([setKey, artArr]) =>
      Object.entries(Artifact.getSetEffectsObj(setKey)).forEach(([setNumKey, value]) =>
        parseInt(setNumKey) <= artArr.length && value.stats && Object.keys(value.stats).length &&
        Object.entries(value.stats).forEach(([key, statVal]) =>
          artifactSetEffect.push({ key, statVal }))))
    return artifactSetEffect
  }
  static getSetEffects = (setToSlots) => {
    let artifactSetEffect = {}
    Object.entries(setToSlots).forEach(([setKey, artArr]) => {
      let setNumKeys = Object.keys(this.getSetEffectsObj(setKey)).filter(setNumKey => parseInt(setNumKey) <= artArr.length)
      if (setNumKeys.length)
        artifactSetEffect[setKey] = setNumKeys
    })
    return artifactSetEffect
  }

  static getSetEffectText = (setKey, setNumKey, stats, defVal = "") => {
    let setEffectText = this.getSetEffectsObj(setKey)?.[setNumKey]?.text
    if (!setEffectText) return defVal
    if (typeof setEffectText === "function")
      return setEffectText(stats)
    else if (setEffectText)
      return setEffectText
    return defVal
  }
  static getSetEffectConditionals = (setKey, setNumKey, defVal = null) => {
    const setEffect = this.getSetEffectsObj(setKey)?.[setNumKey]
    if (setEffect?.conditional || setEffect?.conditionals) {
      return {
        ...setEffect?.conditional && { default: setEffect?.conditional },
        ...setEffect?.conditionals && setEffect?.conditionals
      }
    }
    return defVal
  }

  //SLOT
  static getSlotKeys = () => Object.keys(ArtifactSlotsData || {})
  static getSlotName = (slotKey, defVal = "") => ArtifactSlotsData?.[slotKey]?.name || defVal
  static getSlotIcon = (slotKey, defVal = "") =>
    (slotKey && SlotIcon[slotKey]) ? <FontAwesomeIcon icon={SlotIcon[slotKey]} key={slotKey} className="fa-fw" /> : defVal
  static getSlotMainStatKeys = (slotKey, defVal = []) => ArtifactSlotsData?.[slotKey]?.stats || defVal

  static getSlotNameWithIcon = (slotKey, defVal = "") => {
    if (!slotKey) return defVal;
    let name = this.getSlotName(slotKey)
    if (!name) return defVal;
    let slotIcon = this.getSlotIcon(slotKey)
    if (!slotIcon) return defVal;
    return (<span>{slotIcon} {name}</span>)
  }
  static splitArtifactsBySlot = (databaseObj) =>
    Object.fromEntries(this.getSlotKeys().map(slotKey =>
      [slotKey, Object.values(databaseObj).filter(art => art.slotKey === slotKey)]))

  //STARS
  static getStars = () => Object.keys(ArtifactStarsData || {}).map(s => parseInt(s))
  static getRarityArr = (setKey, defVal = []) => ArtifactData?.[setKey]?.rarity || defVal

  //MAIN STATS
  static getMainStatKeys = () => deepClone(ArtifactMainSlotKeys)
  static getMainStatValues = (numStar, statKey, defVal = []) =>
    ArtifactMainStatsData?.[numStar]?.[statKey] || defVal

  static getMainStatValue = (key, numStars, level, defVal = 0) => {
    let main = this.getMainStatValues(numStars, key)[level]
    if (main) return main
    else if (key?.includes("_dmg_")) // because in the database its still stored as ele_dmg_
      return this.getMainStatValue("ele_dmg_", numStars, level, defVal)
    return defVal
  }

  //SUBSTATS
  static getBaseSubRollNumLow = (numStars, defVal = 0) => ArtifactStarsData?.[numStars]?.subsBaselow || defVal
  static getBaseSubRollNumHigh = (numStars, defVal = 0) => ArtifactStarsData?.[numStars]?.subBaseHigh || defVal
  static getNumUpgradesOrUnlocks = (numStars, defVal = 0) => ArtifactStarsData?.[numStars]?.numUpgradesOrUnlocks || defVal
  static getSubstatAllMax = (statKey, numStars = maxStar, defVal = 0) => ArtifactSubstatsMinMax?.[statKey]?.max[numStars] ?? defVal
  static getSubStatKeys = () => Object.keys(ArtifactSubStatsData || {})
  static subStatCloseEnough = (key, value1, value2) => {
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
  static getSubstatRollData = (subStatKey, numStars) => ArtifactSubStatsData?.[subStatKey]?.[numStars] ?? []
  static getSubstatRolls = (subStatKey, subStatValue, numStars) => {
    if (!numStars || !subStatKey || typeof subStatValue !== "number" || !subStatValue) return []
    let rollData = this.getSubstatRollData(subStatKey, numStars)
    if (!rollData.length) return []

    let table = ArtifactSubstatLookupTable[subStatKey][numStars]
    let lookupValue = subStatValue.toFixed(1)

    if (table[lookupValue])
      return table[lookupValue].map(roll => roll.map(i => rollData[i]))
    else return [] // Lookup fails
  }
  static getSubstatEfficiency = (subStatKey, rolls) => {
    const sum = rolls.reduce((a, b) => a + b, 0)
    const max = this.getSubstatAllMax(subStatKey) * rolls.length
    return max ? clampPercent((sum / max) * 100) : 0
  }

  //ARTIFACT IN GENERAL
  static substatsValidation(state) {
    const { numStars, level, substats } = state, errors = []

    const allSubstatRolls = []
    let total = 0
    substats.forEach((substat, index) => {
      const { key, value } = substat, substatRolls = Artifact.getSubstatRolls(key, value, numStars)

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
      let substat = substats.find(substat => substat.rolls.length > 1)
      if (substat && substats.some((substat) => !substat.rolls.length))
        return [`Substat ${Stat.getStatNameWithPercent(substat.key)} has > 1 roll, but not all substats are unlocked.`]
    }

    const minimum = Artifact.getBaseSubRollNumLow(numStars) + Math.floor(level / 4)
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
      const total = substats.reduce((accu, current) => accu + current.rolls.length, 0)
      if (total < minimum)
        errors.push(`${numStars}-star artifact (level ${level}) should have at least ${minimum} rolls. It currently has ${total} rolls.`)
      else {
        errors.push(`${numStars}-star artifact (level ${level}) should have no more than ${maximum - remaining} rolls. It currently has ${total} rolls.`)
      }
    } else {
      // Found valid build, filling missing data
      for (const substat of substats)
        substat.accurateValue = substat.rolls.reduce((sum, cur) => sum + cur, 0)
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
  static setToSlots = (artifacts) => {
    let setToSlots = {};
    Object.entries(artifacts).forEach(([key, art]) => {
      if (!art) return
      if (setToSlots[art.setKey]) setToSlots[art.setKey].push(key)
      else setToSlots[art.setKey] = [key]
    })
    return setToSlots
  };

  static getAllArtifactSetEffectsObj = stats => {
    let ArtifactSetEffectsObj = {};
    //accumulate the non-conditional stats
    Object.entries(ArtifactData).forEach(([setKey, setObj]) => {
      let setEffect = {}
      if (setObj.setEffects)
        Object.entries(setObj.setEffects).forEach(([setNumKey, setEffectObj]) => {
          if (Object.keys(setEffectObj.stats || {}).length > 0)
            setEffect[setNumKey] = deepClone(setEffectObj.stats)
        })
      if (Object.keys(setEffect).length > 0)
        ArtifactSetEffectsObj[setKey] = setEffect;
    })
    Conditional.parseConditionalValues({ artifact: stats?.conditionalValues?.artifact }, (conditional, conditionalValue, [, setKey]) => {
      const { setNumKey } = conditional
      const { stats: condStats } = Conditional.resolve(conditional, stats, conditionalValue)
      ArtifactSetEffectsObj[setKey] ?? (ArtifactSetEffectsObj[setKey] = {})
      ArtifactSetEffectsObj[setKey][setNumKey] ?? (ArtifactSetEffectsObj[setKey][setNumKey] = {})
      Object.entries(condStats).forEach(([statKey, value]) =>
        ArtifactSetEffectsObj[setKey][setNumKey][statKey] = (ArtifactSetEffectsObj[setKey][setNumKey][statKey] ?? 0) + value)
    })
    return ArtifactSetEffectsObj
  }

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
