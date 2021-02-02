import Artifact from "./Artifact/Artifact";
import ArtifactDatabase from "./Artifact/ArtifactDatabase";
import CharacterDatabase from "./Character/CharacterDatabase";

function DatabaseInitAndVerify() {
  //this will only run if neither of the database has been initated.
  if (!CharacterDatabase.populateDatebaseFromLocalStorage() & !ArtifactDatabase.populateDatebaseFromLocalStorage()) return
  //since one of the database has been initiated, we verify the linking of artifacts and characters
  let arts = ArtifactDatabase.getArtifactDatabase();
  Object.values(arts).forEach(art => {
    let valid = true
    if (art.location) {
      const locationChar = CharacterDatabase.getCharacter(art.location)
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
    if (!art.maximumEfficiency) {
      Artifact.substatsValidation(art)
      valid = false
    }
    if (!valid)
      ArtifactDatabase.updateArtifact(art)
  })

  let chars = CharacterDatabase.getCharacterDatabase();
  Object.values(chars).forEach(character => {
    let valid = true;
    //verify character database equipment validity
    Object.entries(character.equippedArtifacts).forEach(([slotKey, artid]) => {
      const equippedArt = ArtifactDatabase.getArtifact(artid)
      if (equippedArt && equippedArt.location !== character.id) //the artifact doesnt have the right location...
        ArtifactDatabase.moveToNewLocation(artid, character.id)
      if (!equippedArt) {
        valid = false
        character.equippedArtifacts[slotKey] = ""
      }
    })

    //conditional format was refactored. this makes sure there is no error when using old DB.
    character.artifactConditionals = character.artifactConditionals?.filter?.(cond => {
      if (!cond.srcKey || !cond.srcKey2) {
        valid = false
        return false
      }
      return true
    }) ?? []

    //check for dmgMode
    if (!character.dmgMode) {
      character.dmgMode = "dmg"
      valid = false
    }
    if (!valid) {
      CharacterDatabase.updateCharacter(character)
    }
  })
}
export {
  DatabaseInitAndVerify
};

