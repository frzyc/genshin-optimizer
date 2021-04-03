import { deepClone } from "./Util"

// DO NOT REMOVE ITEM FROM THESE LISTS
//      ONLY APPEND NEW ENTRIES
// The index of items in this list is used to
// compress the exported data. Removing an item
// from this list will shift subsequent entries.
const slots = [ "flower", "plume", "sands", "goblet", "circlet", ]
const hitModes = [ "hit", "avgHit", "critHit", ]
const reactionModes = [
  null, "hydro_vaporize", "pyro_vaporize", "pyro_melt", "cryo_melt",
]
const stats = [
  "hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_", "heal_",
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


function exportUInt(number, length = 0) {
  if (number < 0) throw new Error(`Cannot export ${number}`)

  var string = ""
  do {
    let remainder = number % 60
    number = Math.floor(number / 60)
    if (remainder < 10) // 0-9
      string += String.fromCharCode(remainder + 48 - 0)
    else if (remainder < 35) // a-y
      string += String.fromCharCode(remainder + 97 - 10)
    else if (remainder < 60) // A-Y
      string += String.fromCharCode(remainder + 65 - 35)
  } while (number > 0)

  if (length > 0) {
    if (string.length > length)
      throw new Error(`Cannot export ${string} for length ${length}`)
    return string.padEnd(length, "0")
  }
  return string
}
function importUInt(string) {
  let result = 0, multiplier = 1

  for (let i = 0; i < string.length; i++) {
    let code = string.charCodeAt(i)

    if (48 <= code && code < 58) // 0-9
      result += multiplier * (code - 48 + 0)
    else if (97 <= code && code < 122) // a-y
      result += multiplier * (code - 97 + 10)
    else if (65 <= code && code < 90) // A-Y
      result += multiplier * (code - 65 + 35)
    else throw new Error(`Cannot parse UInt from ${string}, which contains ${String.fromCharCode(code)}`)

    multiplier *= 60
  }

  return result
}

function exportFixedItem(item, array, length) {
  let index = array.indexOf(item)
  if (index === -1)
    throw new Error(`Cannot find item ${item}`)
  return exportUInt(index, length)
}
const importFixedItem = (string, array) => array[importUInt(string)]

function exportArtifact(artifact) {
  let { setKey, numStars, level, slotKey, mainStatKey, substats } = artifact
  let result = exportFixedItem(setKey, artifactSets, 1) +
    exportUInt(numStars, 1) +
    exportUInt(level, 1) +
    exportFixedItem(mainStatKey, stats, 1) +
    exportFixedItem(slotKey, slots, 1) +
    substats.map(({key, value}) => {
      let factor = key.endsWith("_") ? 10 : 1 // one decimal place for percentage
      let index = stats.indexOf(key)
      return exportUInt(index, 1) + exportUInt(value * factor, 2)
    }).join('')
  return result
}
function importArtifact(string) {
  let setKey = importFixedItem(string.slice(0, 1), artifactSets)
  let numStars = importUInt(string.slice(1, 2))
  let level = importUInt(string.slice(2, 3))
  let mainStatKey = importFixedItem(string.slice(3, 4), stats)
  let slotKey = importFixedItem(string.slice(4, 5), slots)
  let substats = string.slice(5).match(/.{3}/g).map(string => {
    let key = stats[importUInt(string.slice(0, 1))]
    let factor = key.endsWith("_") ? 10 : 1 // one decimal place for percentage
    return { key, value: importUInt(string.slice(1), 2) / factor, }
  })

  return { setKey, numStars, level, slotKey, mainStatKey, substats }
}
function exportWeapon(weapon) {
  let {
    key: k,
    levelKey: l,
    refineIndex: r,
    overrideMainVal: m,
    overrideSubVal: s,
    conditionalNum: c,
  } = weapon
  const result = { k, l, r, c }
  if (m) result.m = m
  if (s) result.s = s
  return result
}
function importWeapon(data) {
  let {
    k: key,
    l: levelKey,
    r: refineIndex,
    m: overrideMainVal = 0,
    s: overrideSubVal = 0,
    c: conditionalNum,
  } = data
  return { key, levelKey, refineIndex, overrideMainVal, overrideSubVal, conditionalNum }
}
function exportCharacter(character) {
  let result = deepClone(character)
  let { characterKey, hitMode, reactionMode, constellation, talentLevelKeys, overrideLevel, autoInfused,
    // Uncompressed
    levelKey, artifactConditionals, baseStatOverrides, weapon, talentConditionals } = result

  return {
    c:
      exportFixedItem(characterKey, characters, 1) +
      exportFixedItem(hitMode, hitModes, 1) +
      exportFixedItem(reactionMode, reactionModes, 1) +
      exportUInt(constellation, 1) +
      exportUInt(overrideLevel, 2) +
      exportUInt(autoInfused ? 1 : 0, 1) +
      exportUInt(talentLevelKeys.auto, 1) +
      exportUInt(talentLevelKeys.skill, 1) +
      exportUInt(talentLevelKeys.burst, 1) +
      'z',
    ac: artifactConditionals,
    bo: baseStatOverrides,
    l: levelKey,
    tc: talentConditionals,
    w: exportWeapon(weapon),
  }
}
function importCharacter(data) {
  const {
    c: string,
    ac: artifactConditionals,
    bo: baseStatOverrides,
    l: levelKey,
    tc: talentConditionals,
    w: weapon,
  } = data

  const talentLevelKeys = {
    auto: importUInt(string.slice(7, 8)),
    skill: importUInt(string.slice(8, 9)),
    burst: importUInt(string.slice(9, 10)),
  }
  return {
    characterKey: importFixedItem(string.slice(0, 1), characters),
    hitMode: importFixedItem(string.slice(1,2), hitModes),
    reactionMode: importFixedItem(string.slice(2, 3), reactionModes),
    constellation: importUInt(string.slice(3, 4)),
    overrideLevel: importUInt(string.slice(4, 6)),
    autoInfused: importUInt(string.slice(6, 7)) === 1,
    levelKey, artifactConditionals, baseStatOverrides, talentLevelKeys, weapon: importWeapon(weapon), talentConditionals,
  }
}

export {
  exportUInt,
  importUInt,
  exportArtifact,
  importArtifact,
  exportCharacter,
  importCharacter,
}
