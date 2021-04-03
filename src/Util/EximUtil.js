
// DO NOT REMOVE ITEM FROM THESE LISTS
//      ONLY APPEND NEW ENTRIES
// The index of items in this list is used to
// compress the exported data. Removing an item
// from this list can will shift all the data.
const slotKeys = [
  "flower", "plume", "sands", "goblet", "circlet",
]
const stats = [
  "hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_", "heal_",

  "physical_dmg_", "anemo_dmg_", "cryo_dmg_", "dendro_dmg_", "electro_dmg_", "geo_dmg_", "hydro_dmg_", "pyro_dmg_",
]
const artifactSets = [
  "Adventurer", "ArchaicPetra", "Berserker", "BlizzardStrayer", "BloodstainedChivalry", "BraveHeart", "CrimsonWitchOfFlames", "DefendersWill", "Gambler", "GladiatorsFinale", "HeartOfDepth", "Instructor", "Lavawalker", "LuckyDog", "MaidenBeloved", "MartialArtist", "NoblesseOblige", "PrayersForDestiny", "PrayersForIllumination", "PrayersForWisdom", "PrayersToSpringtime", "ResolutionOfSojourner", "RetracingBolide", "Scholar", "TheExile", "ThunderingFury", "Thundersoother", "TinyMiracle", "TravelingDoctor", "ViridescentVenerer", "WanderersTroupe",
]

function exportUInt(number, length = 0) {
  var string = ""

  if (number < 0) {
    throw new Error(`Cannot export ${number}`)
  }

  do {
    let remainder = number % 60
    if (remainder < 10) {
      string += String.fromCharCode(remainder + 48 - 0) // 0-9
    } else if (remainder < 35) {
      string += String.fromCharCode(remainder + 97 - 10) // a-y
    } else if (remainder < 60) {
      string += String.fromCharCode(remainder + 65 - 35) // A-Y
    }
    number = Math.floor(number / 60)
  } while (number > 0)

  if (length > 0) {
    if (string.length > length) {
      throw new Error(`Cannot export ${string} for length ${length}`)
    }
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

const exportFixedItem = (item, array, length) => exportUInt(array.indexOf(item), length)
const importFixedItem = (string, array) => array[importUInt(string)]

function exportArtifact(artifact) {
  let { setKey, numStars, level, slotKey, mainStatKey, substats } = artifact
  let result = exportFixedItem(setKey, artifactSets, 1) +
    exportUInt(numStars, 1) +
    exportUInt(level, 1) +
    exportFixedItem(mainStatKey, stats, 1) +
    exportFixedItem(slotKey, slotKeys, 1) +
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
  let slotKey = importFixedItem(string.slice(4, 5), slotKeys)
  let substats = string.slice(5).match(/.{3}/g).map(string => {
    let key = stats[importUInt(string.slice(0, 1))]
    let factor = key.endsWith("_") ? 10 : 1 // one decimal place for percentage
    return { key, value: importUInt(string.slice(1), 2) / factor, }
  })

  return { setKey, numStars, level, slotKey, mainStatKey, substats }
}

export {
  exportUInt,
  importUInt,
  exportArtifact,
  importArtifact,
}
