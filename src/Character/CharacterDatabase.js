import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util";

var characterDatabase = {};
var characterIdList = [];
var charIdIndex = 1;

export default class CharacterDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof CharacterDatabase) {
      throw Error('A static class cannot be instantiated.');
    }
  }
  static isInvalid = (char) => !char || !char.name || !char.characterKey || !char.levelKey
  static getIdListFromStorage = () => loadFromLocalStorage("character_id_list");
  static saveIdListToStorage = () => saveToLocalStorage("character_id_list", characterIdList);
  static getCharacterDatabase = () => deepClone(characterDatabase);
  static getCharacterIdList = () => deepClone(characterIdList);
  static populateDatebaseFromLocalStorage = () => {
    if (characterIdList.length > 0) return false;
    charIdIndex = parseInt(localStorage.getItem("character_highest_id"));
    if (isNaN(charIdIndex)) charIdIndex = 0;
    characterIdList = CharacterDatabase.getIdListFromStorage();
    if (characterIdList === null) characterIdList = []
    for (const id of characterIdList) {
      if (!characterDatabase[id]) {
        let character = loadFromLocalStorage(id);
        if (!character) break;
        if (this.isInvalid(character)) {
          this.removeCharacterById(id);
          break;
        }
        if (!character.equippedArtifacts) {
          character.equippedArtifacts = {}
          saveToLocalStorage(id, character)
        }
        characterDatabase[id] = character;
      }
    }
    this.updateIdList();
    return true
  }
  static addCharacter = (char) => {
    if (this.isInvalid(char)) return;
    //generate id using charIdIndex
    let id = `character_${charIdIndex++}`
    localStorage.setItem("character_highest_id", charIdIndex)
    char.id = id;
    char = deepClone(char)
    saveToLocalStorage(id, char);
    characterDatabase[id] = char;
    this.updateCacheData();
    return id;
  }
  static updateCharacter = (char) => {
    if (this.isInvalid(char)) return;
    let id = char.id;
    char = deepClone(char)
    saveToLocalStorage(id, char);
    characterDatabase[id] = char;
    this.updateCacheData();
  }
  static getCharacter = (id) => id ? characterDatabase[id] : null

  static removeCharacterById = (id) => {
    delete characterDatabase[id];
    localStorage.removeItem(id);
    this.updateCacheData();
  }
  static updateCacheData() {
    this.updateIdList();
  }
  static updateIdList() {
    characterIdList = Object.keys(characterDatabase)
    this.saveIdListToStorage();
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
