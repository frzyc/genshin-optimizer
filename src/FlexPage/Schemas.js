// DO NOT REMOVE ITEMS FROM THESE LISTS
//        ONLY APPEND NEW ENTRIES
// The index of items in this list is used to
// compress the exported data. Removing an item

import { crawlObject } from "../Util/Util"

// from this list will shift subsequent entries.
const slots = ["flower", "plume", "sands", "goblet", "circlet",]
const hitModes = ["hit", "avgHit", "critHit",]
const reactionModes = [
  null, "hydro_vaporize", "pyro_vaporize", "pyro_melt", "cryo_melt",
]
const stats = [
  "", "hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_", "heal_",
  "physical_dmg_", "anemo_dmg_", "cryo_dmg_", "dendro_dmg_", "electro_dmg_", "geo_dmg_", "hydro_dmg_", "pyro_dmg_",
]
const artifactSets = [
  "Adventurer", "ArchaicPetra", "Berserker", "BlizzardStrayer", "BloodstainedChivalry", "BraveHeart", "CrimsonWitchOfFlames", "DefendersWill", "Gambler", "GladiatorsFinale", "HeartOfDepth", "Instructor", "Lavawalker", "LuckyDog", "MaidenBeloved", "MartialArtist", "NoblesseOblige", "PrayersForDestiny", "PrayersForIllumination", "PrayersForWisdom", "PrayersToSpringtime", "ResolutionOfSojourner", "RetracingBolide", "Scholar", "TheExile", "ThunderingFury", "Thundersoother", "TinyMiracle", "TravelingDoctor", "ViridescentVenerer", "WanderersTroupe",
]
const characterKeys = [
  "albedo", "amber", "barbara", "beidou", "bennett", "chongyun", "diluc", "diona", "fischl", "ganyu", "hutao", "jean", "kaeya", "keqing", "klee", "lisa", "mona", "ningguang", "noelle", "qiqi", "razor", "sucrose", "tartaglia", "traveler_anemo", "traveler_geo", "venti", "xiao", "xiangling", "xingqiu", "xinyan", "zhongli", "rosaria",
]

// Common schemas

const bool = {
  type: "uint", length: 1,
  encode: (bool) => bool ? 1 : 0,
  decode: (int) => int !== 0,
}
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
const artifactSet = fixed(artifactSets)
const slot = fixed(slots)
const characterKey = fixed(characterKeys)
const hitMode = fixed(hitModes)
const reactionMode = fixed(reactionModes)

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
const conditionalV1 = array(object({
  srcKey: string,
  srcKey2: string,
  conditionalNum: uint(1),
}))
const weaponV1 = object({
  key: string,
  levelKey: string,
  refineIndex: uint(1),
  overrideMainVal: float,
  overrideSubVal: float,
  conditionalNum: uint(1),
})
const weaponV2 = object({
  key: string,
  levelKey: string,
  refineIndex: uint(1),
  overrideMainVal: float,
  overrideSubVal: float,
})
const characterV1 = object({
  characterKey,
  hitMode,
  reactionMode,
  constellation: uint(1),
  overrideLevel: uint(2),
  levelKey: string,
  autoInfused: bool,
  talentLevelKeys: object({ auto: uint(1), skill: uint(1), burst: uint(1) }),
  artifactConditionals: conditionalV1,
  baseStatOverrides: sparse(string, float),
  talentConditionals: conditionalV1,
  weapon: weaponV1,
}, {
  decode: (character) => {
    delete character.artifactConditionals
    delete character.talentConditionals
    delete character.weapon.conditionalNum
    character.conditionalValues = {}
    return character
  }
})
const characterV2 = object({
  characterKey,
  hitMode,
  reactionMode,
  constellation: uint(1),
  overrideLevel: uint(2),
  levelKey: string,
  autoInfused: bool,
  talentLevelKeys: object({ auto: uint(1), skill: uint(1), burst: uint(1) }),
  baseStatOverrides: sparse(string, float),
  weapon: weaponV2,
  conditionalValues: array(object({
    path: array(string), value: array(string)
  }), {
    encode: (conditionalValues) => {
      let result = []
      crawlObject(conditionalValues, [], c => Array.isArray(c), (value, path) => {
        result.push({ path, value: value.map(item => item.toString()) })
      })
      return result
    },
    decode: (pathvalues) => {
      let conditionalValues = {}
      for (const { path, value } of pathvalues) {
        let last = path.pop()
        let current = conditionalValues
        for (const key of path) {
          const next = current[key] ?? {}
          current[key] = next
          current = next
        }
        current[last] = value.map(item => isNaN(parseFloat(item)) ? item : parseFloat(item))
      }
      return conditionalValues
    }
  }),
  reserved: array(uint(1)),
}, {
  encode: (value) => { value.reserved = []; return value },
  decode: (value) => { delete value.reserved; return value },
})

const flexV1 = object({
  artifacts: array(artifact),
  character: characterV1,
})
const flexV2 = object({
  artifacts: array(artifact),
  character: characterV2,
})

export const schemas = {
  flexV1, flexV2
}
// For testing purpose only, no need to maintain strict ordering
export const constants = {
  slots, hitModes, reactionModes, stats, artifactSets, characterKeys
}
