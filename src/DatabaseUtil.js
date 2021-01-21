import Artifact from "./Artifact/Artifact";
import ArtifactDatabase from "./Artifact/ArtifactDatabase";
import CharacterDatabase from "./Character/CharacterDatabase";

function DatabaseInitAndVerify() {
  //remove the old error/prone id lists, if it still exists
  localStorage.removeItem("artifact_id_list")
  localStorage.removeItem("character_id_list")

  //this will only run if neither of the database has been initated.
  if (CharacterDatabase.populateDatebaseFromLocalStorage() |
    ArtifactDatabase.populateDatebaseFromLocalStorage()) {
    //since one of the database has been initiated, we verify the linking of artifacts and characters
    let arts = ArtifactDatabase.getArtifactDatabase();
    Object.values(arts).forEach(art => {
      let valid = true
      if (art.location && !CharacterDatabase.getCharacter(art.location)) {
        art.location = ""
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
      if (!art.maximumEfficiency) {
        //calculate rolls & efficiency for caching
        for (const substat of art.substats) {
          let { key, value } = substat
          substat.rolls = Artifact.getSubstatRolls(key, value, art.numStars)
          substat.efficiency = Artifact.getSubstatEfficiency(key, art.numStars, substat.rolls)
        }
        let { currentEfficiency, maximumEfficiency } = Artifact.getArtifactEfficiency(art.substats, art.numStars, art.level)
        art.currentEfficiency = currentEfficiency
        art.maximumEfficiency = maximumEfficiency
        valid = false
      }
      if (!valid)
        ArtifactDatabase.updateArtifact(art)
    })

    let chars = CharacterDatabase.getCharacterDatabase();
    Object.values(chars).forEach(character => {
      let valid = true;
      //verify character database equipment validity
      let equippedArtifacts = Object.fromEntries(Object.entries(character.equippedArtifacts).map(([slotKey, artid]) => {
        if (!ArtifactDatabase.getArtifact(artid)) {
          valid = false
          return [slotKey, undefined]
        }
        return [slotKey, artid]
      }))
      if (!valid)
        character.equippedArtifacts = equippedArtifacts

      //conditional format was refactored. this makes sure there is no error when using old DB.
      if (character.artifactConditionals) character.artifactConditionals = character.artifactConditionals.filter(cond => {
        if (!cond.srcKey || !cond.srcKey2) {
          valid = false
          return false
        }
        return true
      })

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
}
export {
  DatabaseInitAndVerify
};
