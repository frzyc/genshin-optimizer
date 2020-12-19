import ArtifactDatabase from "./Artifact/ArtifactDatabase"
import CharacterDatabase from "./Character/CharacterDatabase"

function DatabaseInitAndVerify() {
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
    //verify character database equipment validity
    let chars = CharacterDatabase.getCharacterDatabase();
    Object.values(chars).forEach(char => {
      let valid = true;
      let equippedArtifacts = Object.fromEntries(Object.entries(char.equippedArtifacts).map(([slotKey, artid]) => {
        if (!ArtifactDatabase.getArtifact(artid)) {
          valid = false
          return [slotKey, undefined]
        }
        return [slotKey, artid]
      }))
      if (!valid) {
        char.equippedArtifacts = equippedArtifacts
        CharacterDatabase.updateCharacter()
      }
    })
  }
}
export {
  DatabaseInitAndVerify
}