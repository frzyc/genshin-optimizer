import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util";
var initiated = false
var characterDatabase = {};
var charIdIndex = 1;

export default class CharacterDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof CharacterDatabase) {
      throw Error('A static class cannot be instantiated.');
    }
  }
  static isInvalid = (char) => !char || !char.name || !char.characterKey || !char.levelKey
  static getCharacterDatabase = () => deepClone(characterDatabase);
  static getCharacterIdList = () => Object.keys(characterDatabase);
  static getIdNameList = () => Object.entries(characterDatabase).map(([id, char]) => [id, char.name]);
  static populateDatebaseFromLocalStorage = () => {
    if (initiated) return;
    Object.keys(localStorage).filter(key => key.includes("character_")).forEach(id => {
      if (!characterDatabase[id]) {
        let character = loadFromLocalStorage(id);
        if (!character) return;
        if (this.isInvalid(character)) {
          this.removeCharacterById(id);
          return;
        }
        if (!character.equippedArtifacts) {
          character.equippedArtifacts = {}
          saveToLocalStorage(id, character)
        }
        characterDatabase[id] = character;
      }
    })
    initiated = true
    return true
  }
  static addCharacter = (char) => {
    if (this.isInvalid(char)) return;
    //generate id using charIdIndex
    let id = `character_${charIdIndex++}`
    while (localStorage.getItem(id) !== null)
      id = `character_${charIdIndex++}`
    let dchar = deepClone(char)
    dchar.id = id;
    saveToLocalStorage(id, dchar);
    characterDatabase[id] = dchar;
    return id;
  }
  static updateCharacter = (char) => {
    if (this.isInvalid(char)) return;
    let id = char.id;
    let dchar = deepClone(char)
    saveToLocalStorage(id, dchar);
    characterDatabase[id] = dchar;
  }
  static getCharacter = (id) => id ? characterDatabase[id] : null

  static removeCharacterById = (id) => {
    delete characterDatabase[id];
    localStorage.removeItem(id);
  }
  static getArtifactIDFromSlot = (charid, slotKey) => {
    if (!charid || !slotKey) return null;
    let char = this.getCharacter(charid)
    if (char.equippedArtifacts)
      return char.equippedArtifacts[slotKey]
  }
  static equipArtifact = (charid, art) => {
    let char = this.getCharacter(charid)
    if (!char || !art || !art.slotKey) return
    if (!char.equippedArtifacts)
      char.equippedArtifacts = {};
    char.equippedArtifacts[art.slotKey] = art.id;
    this.updateCharacter(char)
  }
  static unequipArtifactOnSlot = (charid, slotKey) => {
    let char = this.getCharacter(charid)
    if (!char || !slotKey) return
    if (!char.equippedArtifacts || !char.equippedArtifacts[slotKey]) return;
    char.equippedArtifacts[slotKey] = "";
    this.updateCharacter(char)
  }
  static equipArtifactBuild = (characterId, artifactIds) => {
    let character = this.getCharacter(characterId)
    if (!character) return;
    character.equippedArtifacts = {}
    Object.entries(artifactIds).forEach(([key, artid]) =>
      character.equippedArtifacts[key] = artid)
    CharacterDatabase.updateCharacter(character);
  }
}
