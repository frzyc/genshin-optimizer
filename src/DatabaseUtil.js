import ArtifactDatabase from "./Artifact/ArtifactDatabase"
import Character from "./Character/Character";
import CharacterDatabase from "./Character/CharacterDatabase"
import { WeaponLevelKeys } from "./Data/WeaponData";
import Weapon from "./Weapon/Weapon";

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
      if (art.location && !CharacterDatabase.getCharacter(art.location)) {
        art.location = ""
        ArtifactDatabase.updateArtifact(art)
      }
    })

    let chars = CharacterDatabase.getCharacterDatabase();
    Object.values(chars).forEach(char => {
      let valid = true;
      //verify character database equipment validity
      let equippedArtifacts = Object.fromEntries(Object.entries(char.equippedArtifacts).map(([slotKey, artid]) => {
        if (!ArtifactDatabase.getArtifact(artid)) {
          valid = false
          return [slotKey, undefined]
        }
        return [slotKey, artid]
      }))
      if (!valid)
        char.equippedArtifacts = equippedArtifacts

      //weapon stuff was added later, some people might not have a default weapon.
      if (!char.weapon || !char.weapon.key || !char.weapon.levelKey || !char.weapon.refineIndex) {
        valid = false
        char.weapon = {
          key: Object.keys(Weapon.getWeaponsOfType(Character.getWeaponTypeKey(char.characterKey)))[0],
          levelKey: WeaponLevelKeys[0],
          refineIndex: 0,
          overrideMainVal: char.weapon_atk || 0,//use old override values
          overrideSubVal: char.weaponStatVal || 0,//use old override values, might not be the right type of substats...
        }
      }
      if (!valid) {
        CharacterDatabase.updateCharacter(char)
      }
    })
  }
}
export {
  DatabaseInitAndVerify
}