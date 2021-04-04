// DO NOT REMOVE ITEMS FROM THESE LISTS
//        ONLY APPEND NEW ENTRIES
// The index of items in this list is used to
// compress the exported data. Removing an item
// from this list will shift subsequent entries.
const slots = [ "flower", "plume", "sands", "goblet", "circlet", ]
const hitModes = [ "hit", "avgHit", "critHit", ]
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
const characters = [
  "albedo", "amber", "barbara", "beidou", "bennett", "chongyun", "diluc", "diona", "fischl", "ganyu", "hutao", "jean", "kaeya", "keqing", "klee", "lisa", "mona", "ningguang", "noelle", "qiqi", "razor", "sucrose", "tartaglia", "traveler_anemo", "traveler_geo", "venti", "xiao", "xiangling", "xingqiu", "xinyan", "zhongli",
]

// For testing purpose only, no need to maintain strict ordering
export const constants = {
  slots, hitModes, reactionModes, stats, artifactSets, characters
}

export const artifactSchema = {
  type: "object",
  schemas: {
    setKey: { type: "fixed", list: artifactSets, length: 1 },
    numStars: { type: "uint", length: 1 },
    level: { type: "uint", length: 2 },
    mainStatKey: { type: "fixed", list: stats, length: 1 },
    slotKey: { type: "fixed", list: slots, length: 1 },
    substats: {
      type: "array",
      defaultSchema: {
        type: "object",
        schemas: {
          key: { type: "fixed", list: stats, length: 1 },
          value: { type: "uint", length: 2 },
        },
        encode: ({key, value}) => {
          let factor = key.endsWith("_") ? 10 : 1 // one decimal place for percentage
          return { key, value: value * factor }
        },
        decode: ({key, value}) => {
          let factor = key.endsWith("_") ? 10 : 1 // one decomal place for percentage
          return { key, value: value / factor }
        },
      },
    }
  }
}
const conditionalScheme = {
  type: "array",
  defaultSchema: {
    type: "object",
    schemas: {
      srcKey: { type: "string" },
      srcKey2: { type: "string" },
      conditionalNum: { type: "uint", length: 1 },
    }
  }
}
const weaponSchema = {
  type: "object",
  schemas: {
    key: { type: "string" },
    levelKey: { type: "string" },
    refineIndex: { type: "uint", length: 1 },
    overrideMainVal: { type: "uint" },
    overrideSubVal: { type: "uint" },
    conditionalNum: { type: "uint", length: 1 },
  }
}
export const characterSchema = {
  type: "object",
  schemas: {
    characterKey: { type: "fixed", list: characters, length: 1 },
    hitMode: { type: "fixed", list: hitModes, length: 1 },
    reactionMode: { type: "fixed", list: reactionModes, length: 1 },
    constellation: { type: "uint", length: 1 },
    overrideLevel: { type: "uint", length: 2 },
    levelKey: { type: "string" },
    autoInfused: {
      type: "uint", length: 1,
      encode: (bool) => bool ? 1 : 0,
      decode: (int) => int === 1,
    },
    talentLevelKeys: {
      type: "object",
      schemas: { auto: null, skill: null, burst: null },
      defaultSchema: { type: "uint", length: 1, }
    },
    artifactConditionals: conditionalScheme,
    baseStatOverrides: {
      type: "object",
      schemas: { k: null, v: null },
      defaultSchema: { type: "array", defaultSchema: { type: "string" } },
      encode: (object) => ({
        // Change the format so that we can safely encode
        k: Object.keys(object),
        v: Object.values(object).map((value) =>
          value.toString().replace(/\./g, '_')
        ),
      }),
      decode: ({k, v}) => Object.fromEntries(k.map((key, i) =>
        [ key, parseInt(v[i].replace(/_/g, '.')) ]))
    },
    talentConditionals: conditionalScheme,
    weapon: weaponSchema,
  }
}
