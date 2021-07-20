import { ascensionMaxLevel } from "../Data/CharacterData"
import { allSlotKeys, allElements, allArtifactSets, allHitModes, allReactionModes, allCharacterKeys } from "../Types/consts"
import { crawlObject } from "../Util/Util"
import { uintToString, stringToUInt } from "./CodingUtil"

// DO NOT REMOVE ITEMS FROM THESE LISTS
//        ONLY APPEND NEW ENTRIES
// The index of items in this list is used to
// compress the exported data. Removing an item
// from this list will shift subsequent entries.
const elements = ['', ...allElements] as const
const stats = [
  "", "hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_", "heal_",
  "physical_dmg_", "anemo_dmg_", "cryo_dmg_", "dendro_dmg_", "electro_dmg_", "geo_dmg_", "hydro_dmg_", "pyro_dmg_",
] as const

// Common schemas

const uint = (length) => ({ type: "uint", length })
const float = {
  type: "string",
  encode: (value) => value.toString().replace(/\./g, '_'),
  decode: (string) => parseFloat(string.replace(/_/g, '.')),
}
const string = { type: "string" }
const array = (defaultSchema, other = {}) => ({ type: "array", defaultSchema, ...other })
const object = (schemas, other = {}) => ({ type: "object", schemas, ...other })
const sparse = (keySchema, valueSchema, keys = null) => ({ type: "sparse", keys, keySchema, valueSchema })

// Fixed schema

const fixed = (list, length = 1) => ({
  type: "uint", length,
  encode: (item) => list.indexOf(item),
  decode: (index) => list[index],
})
const stat = fixed(stats)
const artifactSet = fixed(allArtifactSets)
const slot = fixed(allSlotKeys)
const characterKey = fixed(allCharacterKeys)
const hitMode = fixed(allHitModes)
const reactionMode = fixed([null, ...allReactionModes])
const element = fixed(elements)

// Complex schemas

const artifact = object({
  setKey: artifactSet,
  numStars: uint(1),
  level: uint(2),
  mainStatKey: stat,
  slotKey: slot,
  substats: array(
    object({
      key: stat,
      value: uint(2),
    }, {
      encode: ({ key, value }) => {
        let factor = key.endsWith("_") ? 10 : 1 // one decimal place for percentage
        return { key, value: value * factor }
      },
      decode: ({ key, value }) => {
        let factor = key.endsWith("_") ? 10 : 1 // one decomal place for percentage
        return { key, value: value / factor }
      }
    })
  )
})
const conditionalValues = array(object({
  path: array(string), value: array(string)
}), {
  encode: (conditionalValues) => {
    let result: { path, value }[] = []
    crawlObject(conditionalValues, [], c => Array.isArray(c), (value, path) => {
      result.push({ path, value: value.map(item => item.toString()) })
    })
    result.filter(({ path }) => {
      switch (path[0]) {
        case "character":
          path[0] = "c"
          path[1] = uintToString(allCharacterKeys.indexOf(path[1]))
          break
        case "weapon":
          path[0] = "w"
          break
        case "artifact":
          path[0] = "a"
          path[1] = uintToString(allArtifactSets.indexOf(path[1]))
          break
        default: return false
      }
      return true
    })
    return result
  },
  decode: (pathvalues) => {
    const conditionalValues = { weapon: {}, artifact: {}, character: {} }
    for (const { path, value } of pathvalues) {
      switch (path[0]) {
        case "c":
          path[0] = "character"
          path[1] = allCharacterKeys[stringToUInt(path[1])]
          break
        case "w":
          path[0] = "weapon"
          break
        case "a":
          path[0] = "artifact"
          path[1] = allArtifactSets[stringToUInt(path[1])]
          break
        default:
          continue
      }
      const last = path.pop()
      let current = conditionalValues
      for (const key of path) {
        const next = current[key] ?? {}
        current[key] = next
        current = next
      }
      value[0] = parseFloat(value[0])
      current[last] = value
    }
    return conditionalValues
  }
})
const weaponV2 = object({
  key: string,
  levelKey: string,
  refineIndex: uint(1),
  overrideMainVal: float,
  overrideSubVal: float,
}, {
  encode: value => {
    const level = value.level
    const ascIndex = ascensionMaxLevel.findIndex(maxLevel => level <= maxLevel)
    const ascension = ascIndex < value.ascension ? "A" : ""
    value.levelKey = `L${level}${ascension}`
    value.overrideMainVal = 0
    value.overrideSubVal = 0
    return value
  }, decode: object => {
    const levelKey = object.levelKey
    delete object.levelKey
    delete object.overrideMainVal
    delete object.overrideSubVal
    const [, lvla] = levelKey.split("L")
    const level = parseInt(lvla)
    const ascension = ascensionMaxLevel.findIndex(maxLevel => level <= maxLevel)
    const addAsc = lvla.includes("A")
    if (level < 0 || level > 90 || ascension < 0) {
      object.level = 1
      object.ascension = 0
    } else {
      object.level = level
      object.ascension = ascension + (addAsc ? 1 : 0)
    }
    return object
  }
})
const characterV2 = object({
  characterKey,
  hitMode,
  reactionMode,
  constellation: uint(1),
  overrideLevel: uint(2),
  levelKey: string,
  infusionAura: element,
  talentLevelKeys: object({ auto: uint(1), skill: uint(1), burst: uint(1) }),
  baseStatOverrides: sparse(string, float),
  weapon: weaponV2,
  conditionalValues,
  reserved: array(uint(1)),
}, {
  encode: (value) => {
    const roundedLevel = Math.round(value.level / 10) * 10 // Nearest level
    const maxLevel = ascensionMaxLevel[value.ascension]
    value.levelKey = `L${roundedLevel}${roundedLevel === maxLevel ? "" : "A"}`
    if (roundedLevel === value.level) value.overrideLevel = 0
    else value.overrideLevel = value.level

    if (value.characterKey === "traveler")
      value.reserved = [elements.indexOf(value.elementKey)]
    else
      value.reserved = []
    return value
  },
  decode: (value) => {
    const isAscended = value.levelKey.slice(-1) === "A"
    const levelString = isAscended ? value.levelKey.slice(1, -1) : value.levelKey.slice(1)
    value.level = parseInt(levelString)
    switch (value.level) {
      case 1: value.ascension = 0; break
      case 20: value.ascension = 0; break
      case 40: value.ascension = 1; break
      case 50: value.ascension = 2; break
      case 60: value.ascension = 3; break
      case 70: value.ascension = 4; break
      case 80: value.ascension = 5; break
      case 90: value.ascension = 6; break
    }
    if (isAscended) {
      value.ascension += 1
    }
    if (value.baseStatOverrides.characterLevel) {
      value.level = value.baseStatOverrides.characterLevel
      delete value.baseStatOverrides.characterLevel
    }
    if (value.baseStatOverrides.weaponLevel) {
      value.weapon.level = value.baseStatOverrides.weaponLevel
      delete value.baseStatOverrides.weaponLevel
    }
    if (value.overrideLevel) {
      value.level = value.overrideLevel
    }
    delete value.overrideLevel
    delete value.levelKey

    if (value.characterKey === "traveler") {
      value.elementKey = elements[value.reserved[0]] ?? "anemo"
    }
    delete value.reserved
    return value
  },
})

const flexV2 = object({
  artifacts: array(artifact),
  character: characterV2,
})

export const schemas = {
  flexV2
}
// For testing purpose only, no need to maintain strict ordering
export const constants = {
  reactionModes: [null, ...allReactionModes], stats
}
