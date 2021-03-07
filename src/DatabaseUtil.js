import Artifact from "./Artifact/Artifact";
import ArtifactDatabase from "./Artifact/ArtifactDatabase";
import CharacterDatabase from "./Character/CharacterDatabase";
import { changes as v2change, dmgModeToHitMode } from "./dbV2KeyMap";
import { loadFromLocalStorage, saveToLocalStorage } from "./Util/Util";

function DatabaseInitAndVerify() {
  const dbVersion = getDatabaseVersion()
  //edit the data before the database is populated
  if (dbVersion < 2) {
    //made characters unique, so need to convert character_{NUMBER} to char_{characterKey}. Will only save the 1st instance of a character.
    Object.keys(localStorage).filter(key => key.startsWith("character_")).forEach(key => {
      const character = loadFromLocalStorage(key);
      const { characterKey, equippedArtifacts = {} } = character
      const dbKey = `char_${characterKey}`
      if (localStorage.getItem(dbKey) === null) {
        //if there is no character saved, create a new character
        const { id, name, dmgMode, ...rest } = character
        if (Array.isArray(rest?.buildSetting?.mainStat))
          rest.buildSetting.mainStat = rest.buildSetting.mainStat.map(stat => stat in v2change ? v2change[stat] : stat)
        if (typeof rest?.buildSetting?.statFilters === "object")
          rest.buildSetting.statFilters = Object.fromEntries(Object.entries(rest.buildSetting.statFilters).map(([stat, value]) => [stat in v2change ? v2change[stat] : stat, value]))
        rest.hitMode = dmgModeToHitMode[dmgMode] ?? Object.keys(dmgModeToHitMode)[0]
        saveToLocalStorage(dbKey, rest)
        //equip to the new character
        Object.values(equippedArtifacts).forEach(artid => {
          const art = loadFromLocalStorage(artid);
          if (!art) return
          art.location = characterKey
          saveToLocalStorage(artid, art)
        });
      } else {
        //if the character does exist, "move" the artifacts equipped to inventory
        Object.values(equippedArtifacts).forEach(artid => {
          const art = loadFromLocalStorage(artid);
          if (!art) return
          art.location = ""
          saveToLocalStorage(artid, art)
        });
      }
      //delete the old database
      localStorage.removeItem(key)
    })
    //reset the ArtifactDisplay keys
    const ArtifactDisplayState = loadFromLocalStorage("ArtifactDisplay.state")
    if (ArtifactDisplayState) {
      if (ArtifactDisplayState.filterMainStatKey in v2change)
        ArtifactDisplayState.filterMainStatKey = v2change[ArtifactDisplayState.filterMainStatKey]
      ArtifactDisplayState.filterSubstats = ArtifactDisplayState.filterSubstats.map(stat => stat in v2change ? v2change[stat] : stat)
      saveToLocalStorage("ArtifactDisplay.state", ArtifactDisplayState)
    }
  }

  //this will only run if neither of the database has been initated.
  const charDBJustPopualted = CharacterDatabase.populateDatebaseFromLocalStorage(),
    artDBJustPopualted = ArtifactDatabase.populateDatebaseFromLocalStorage()
  if (!charDBJustPopualted && !artDBJustPopualted) return

  Object.values(ArtifactDatabase.getArtifactDatabase()).forEach(art => {
    let valid = true

    //verify the linking of artifacts and characters
    if (art.location) {
      const locationChar = CharacterDatabase.get(art.location)
      if (locationChar) {
        let artInSlotId = CharacterDatabase.getArtifactIDFromSlot(art.location, art.slotKey)
        if (!artInSlotId) {//character doesnt seem to show this artifact equipped...
          CharacterDatabase.equipArtifact(art.location, art)
        } else if (artInSlotId !== art.id) {//character has a different artifact equipped, invalidate this location
          art.location = ""
          valid = false
        }
      } else {
        art.location = ""
        valid = false
      }
    }

    if (dbVersion < 1) {
      //generate artifact efficiency again for artifacts
      Artifact.substatsValidation(art)
      valid = false

      //there was a bug that saved the numStars as strings. convert to number.
      if (typeof art.numStars === "string") {
        art.numStars = parseInt(art.numStars)
        valid = false
      }

      //the set keys were changed to camelcase, need to convert for old databases.
      let keyMapping = {
        "Wanderer's Troupe": "WanderersTroupe",
        "Viridescent Venerer": "ViridescentVenerer",
        "Thundering Fury": "ThunderingFury",
        "Retracing Bolide": "RetracingBolide",
        "Noblesse Oblige": "NoblesseOblige",
        "Maiden Beloved": "MaidenBeloved",
        "Gladiator's Finale": "GladiatorsFinale",
        "Crimson Witch of Flames": "CrimsonWitchOfFlames",
        "Bloodstained Chivalry": "BloodstainedChivalry",
        "Archaic Petra": "ArchaicPetra",
        "Brave Heart": "BraveHeart",
        "Tiny Miracle": "TinyMiracle",
        "Defender's Will": "DefendersWill",
        "Martial Artist": "MartialArtist",
        "Resolution of Sojourner": "ResolutionOfSojourner",
        "The Exile": "TheExile",
        "Traveling Doctor": "TravelingDoctor",
        "Lucky Dog": "LuckyDog",
        "Prayers of Wisdom": "PrayersForWisdom",
        "Prayers of Springtime": "PrayersToSpringtime",
        "Prayers of Illumination": "PrayersForIllumination",
        "Prayers of Destiny": "PrayersForDestiny",
      }
      if (keyMapping[art.setKey]) {
        art.setKey = keyMapping[art.setKey]
        valid = false
      }
      //key names were changed. convert old DB
      if (art?.mainStatKey?.endsWith?.("ele_dmg")) {
        art.mainStatKey = art.mainStatKey.replace("ele_dmg", "ele_dmg_bonus")
        valid = false
      }
      //key names were changed. convert old DB
      if (art?.mainStatKey === "phy_dmg") {
        art.mainStatKey = "phy_dmg_bonus"
        valid = false
      }
    }

    if (dbVersion < 2) {
      if (art.mainStatKey in v2change) {
        art.mainStatKey = v2change[art.mainStatKey]
        valid = false
      }
      art?.substats?.forEach((obj, i) => {
        if (obj.key in v2change) {
          art.substats[i].key = v2change[obj.key]
          valid = false
        }
      })
    }

    //Update any invalid artifacts in DB
    if (!valid) ArtifactDatabase.updateArtifact(art)
  })

  let chars = CharacterDatabase.getCharacterDatabase();
  Object.values(chars).forEach(character => {
    let valid = true;
    const { characterKey } = character
    //verify character database equipment validity
    Object.entries(character.equippedArtifacts).forEach(([slotKey, artid]) => {
      const equippedArt = ArtifactDatabase.get(artid)
      if (equippedArt && equippedArt.location !== characterKey) //the artifact doesnt have the right location...
        ArtifactDatabase.moveToNewLocation(artid, characterKey)
      if (!equippedArt) {
        valid = false
        character.equippedArtifacts[slotKey] = ""
      }
    })

    if (dbVersion < 1) {
      //conditional format was refactored. this makes sure there is no error when using old DB.
      character.artifactConditionals = character.artifactConditionals?.filter?.(cond => {
        if (!cond.srcKey || !cond.srcKey2) {
          valid = false
          return false
        }
        return true
      }) ?? []

      //check for dmgMode
      if (!character.hitMode) {
        character.hitMode = "hit"
        valid = false
      }
    }

    //update any invalid characters in DB
    if (!valid) CharacterDatabase.updateCharacter(character)
  })
  setDatabaseVersion(2)
}
const getDatabaseVersion = (defVal = 0) =>
  parseInt(loadFromLocalStorage("db_ver") ?? defVal)

const setDatabaseVersion = (version) =>
  saveToLocalStorage("db_ver", version)

export {
  DatabaseInitAndVerify
};
