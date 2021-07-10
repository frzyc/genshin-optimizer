import ArtifactDatabase from "./ArtifactDatabase";
import CharacterDatabase from "./CharacterDatabase";
import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util";
import { allSlotKeys } from "../Types/consts";
import { ICharacter } from "../Types/character";
import { ascensionMaxLevel } from "../Data/CharacterData";

const CurrentDatabaseVersion = 5

function DatabaseInitAndVerify() {
  const dbVersion = getDatabaseVersion()
  //edit the data before the database is populated

  if (dbVersion < 3) {
    const state = loadFromLocalStorage("CharacterDisplay.state")
    if (state) {
      if (Array.isArray(state.elementalFilter)) state.elementalFilter = ""
      if (Array.isArray(state.weaponFilter)) state.weaponFilter = ""
      saveToLocalStorage("CharacterDisplay.state", state)
    }
  }

  if (dbVersion < 4) {
    //merged both travelers in the system. So need to convert & merge. Keep anemo, and delete geo.
    const traveler = loadFromLocalStorage("char_traveler_anemo") as ICharacter
    if (traveler) {
      localStorage.removeItem("char_traveler_anemo")
      localStorage.removeItem("char_traveler_geo")
      traveler.elementKey = "anemo"
      traveler.characterKey = "traveler"
      saveToLocalStorage("char_traveler", traveler)
    }
  }

  //this will only run if neither of the database has been initated.
  const charDBJustPopualted = CharacterDatabase.populateDatebaseFromLocalStorage(),
    artDBJustPopualted = ArtifactDatabase.populateDatebaseFromLocalStorage()
  if (!charDBJustPopualted && !artDBJustPopualted) return

  Object.values(deepClone(ArtifactDatabase.getArtifactDatabase())).forEach((art: any) => {
    let valid = true

    // remove mainStatVal
    if (art.mainStatVal) {
      delete art.mainStatVal
      valid = false
    }

    //verify the linking of artifacts and characters
    if (art.location) {
      const locationChar = CharacterDatabase.get(art.location)
      if (locationChar) {
        let artInSlotId = CharacterDatabase.getArtifactIDFromSlot(art.location, art.slotKey)
        if (!artInSlotId) {//character doesnt seem to show this artifact equipped...
          CharacterDatabase.equipArtifactOnSlot(art.location, art.slotKey, art.id)
        } else if (artInSlotId !== art.id) {//character has a different artifact equipped, invalidate this location
          art.location = ""
          valid = false
        }
      } else {
        art.location = ""
        valid = false
      }
    }

    if (dbVersion < 3) {
      //remove cached efficiency & rolls
      delete art.currentEfficiency
      delete art.maximumEfficiency
      art?.substats?.forEach((substat: any, i: any) => {
        delete substat.efficiency
        delete substat.rolls
      })
      valid = false
    }

    if (dbVersion < 4) {
      //move traveler_anemo artifacts to traveler, and remove geo artifacts
      if (art.location === "traveler_anemo") {
        art.location = "traveler"
        valid = false
      } else if (art.location === "traveler_geo") {
        art.location = ""
        valid = false
      }
    }
    //Update any invalid artifacts in DB
    if (!valid) ArtifactDatabase.update(art)
  })

  let chars = CharacterDatabase.getCharacterDatabase();
  Object.values(chars).forEach((character: any) => {
    let valid = true;
    const { characterKey } = character
    //verify character database equipment validity
    if (!character.equippedArtifacts || !Object.keys(character.equippedArtifacts).length) {
      character.equippedArtifacts = Object.fromEntries(allSlotKeys.map(sk => [sk, ""]))
      valid = false
    }
    Object.entries(character.equippedArtifacts).forEach(([slotKey, artid]) => {
      const equippedArt = ArtifactDatabase.get(artid)
      if (equippedArt && equippedArt.location !== characterKey) //the artifact doesnt have the right location...
        ArtifactDatabase.moveToNewLocation(artid, characterKey)
      if (artid && !equippedArt) {
        valid = false
        character.equippedArtifacts[slotKey as any] = ""
      }
    })

    if (dbVersion < 3) {
      delete character.artifactConditional
      delete character.talentCondtiional
      delete character.autoInfused
      if (character.buildSetting) {
        const { artifactsAssumeFull = false, ascending = false, mainStat = ["", "", ""], setFilters = [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }], useLockedArts = false } = character.buildSetting ?? {}
        delete character.buildSetting
        character.buildSettings = { mainStatAssumptionLevel: artifactsAssumeFull ? 20 : 0, ascending, mainStatKeys: mainStat, setFilters, useLockedArts }
      }
      delete character.weapon?.conditionalNum
      valid = false
    }
    if (dbVersion < 5 && character.levelKey) {
      const levelKey = character.levelKey
      const [, lvla] = levelKey.split("L")
      const level = parseInt(lvla)
      const ascension = ascensionMaxLevel.findIndex(ascenML => level <= ascenML)
      const addAsc = lvla.includes("A")
      if (level < 0 || level > 90 || ascension < 0) {
        character.level = 1
        character.ascension = 0
      } else {
        character.level = level
        character.ascension = ascension + (addAsc ? 1 : 0)
      }
      delete character.levelKey
      delete character.baseStatOverrides?.characterLevel
      delete character.baseStatOverrides?.characterHP
      delete character.baseStatOverrides?.characterATK
      delete character.baseStatOverrides?.characterDEF
      valid = false
    }

    //update any invalid characters in DB
    if (!valid) CharacterDatabase.update(character)
  })
  setDatabaseVersion(CurrentDatabaseVersion)
}
const getDatabaseVersion = (defVal = 0) =>
  parseInt(loadFromLocalStorage("db_ver") ?? defVal)

const setDatabaseVersion = (version: number) =>
  saveToLocalStorage("db_ver", version)

function createDatabaseObj() {
  const characterDatabase = CharacterDatabase.getCharacterDatabase()
  const artifactDatabase = ArtifactDatabase.getArtifactDatabase()
  const artifactDisplay = loadFromLocalStorage("ArtifactDisplay.state") ?? {}
  const characterDisplay = loadFromLocalStorage("CharacterDisplay.state") ?? {}
  const buildsDisplay = loadFromLocalStorage("BuildsDisplay.state") ?? {}

  return {
    version: getDatabaseVersion(),
    characterDatabase,
    artifactDatabase,
    artifactDisplay,
    characterDisplay,
    buildsDisplay,
  }
}

function loadDatabaseObj({ version = 0, characterDatabase, artifactDatabase, artifactDisplay, characterDisplay, buildsDisplay, }) {
  clearDatabase()
  //load from obj charDB,artDB
  Object.entries(characterDatabase).forEach(([charKey, char]) => saveToLocalStorage(`char_${charKey}`, char))
  Object.entries(artifactDatabase).forEach(([id, art]) => saveToLocalStorage(id, art))
  //override version
  setDatabaseVersion(version)
  saveToLocalStorage("ArtifactDisplay.state", artifactDisplay)
  saveToLocalStorage("CharacterDisplay.state", characterDisplay)
  saveToLocalStorage("BuildsDisplay.state", buildsDisplay)

  DatabaseInitAndVerify()
}
function clearDatabase() {
  //delete all characters and artifacts
  Object.keys(localStorage).filter(key => key.startsWith("char_") || key.startsWith("artifact_")).forEach(id =>
    localStorage.removeItem(id))
  localStorage.removeItem("db_ver")
  localStorage.removeItem("ArtifactDisplay.state")
  localStorage.removeItem("CharacterDisplay.state")
  localStorage.removeItem("BuildsDisplay.state")
  //clear the database to validate again
  CharacterDatabase.clearDatabase()
  ArtifactDatabase.clearDatabase()
}
export {
  DatabaseInitAndVerify,
  createDatabaseObj,
  loadDatabaseObj,
  clearDatabase,
  CurrentDatabaseVersion
};
