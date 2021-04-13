// DO NOT REMOVE ITEMS FROM THESE LISTS
//        ONLY APPEND NEW ENTRIES
// The index of items in this list is used to
// compress the exported data. Removing an item
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
const conditional = array(
  object({
    srcKey: string,
    srcKey2: string,
    conditionalNum: uint(1),
  }), {
  // Add this here because someone is being naughty.
  encode: (array) => array.filter(({ srcKey2 }) => srcKey2?.match(/^[a-z0-9\-_]+$/i))
  }
)
const weapon = object({
  key: string,
  levelKey: string,
  refineIndex: uint(1),
  overrideMainVal: float,
  overrideSubVal: float,
  conditionalNum: uint(1),
})
const character = object({
  characterKey,
  hitMode,
  reactionMode,
  constellation: uint(1),
  overrideLevel: uint(2),
  levelKey: string,
  autoInfused: bool,
  talentLevelKeys: object({ auto: uint(1), skill: uint(1), burst: uint(1) }),
  artifactConditionals: conditional,
  baseStatOverrides: sparse(string, float),
  talentConditionals: conditional,
  weapon,
})

const flex = object({
  artifacts: array(artifact),
  character,
})

export const schemas = {
  flex
}
// For testing purpose only, no need to maintain strict ordering
export const constants = {
  slots, hitModes, reactionModes, stats, artifactSets, characterKeys
}
