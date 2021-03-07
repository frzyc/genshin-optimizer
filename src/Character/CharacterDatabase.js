import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util";
var initiated = false
var characterDatabase = {};

export default class CharacterDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof CharacterDatabase) throw Error('A static class cannot be instantiated.');
  }
  static isInvalid = (char) => !char || !char.characterKey || !char.levelKey
  static getCharacterDatabase = () => deepClone(characterDatabase);
  static getCharacterKeyList = () => Object.keys(characterDatabase);
  static getIdNameList = () => Object.entries(characterDatabase).map(([id, char]) => [id, char.name]);
  static populateDatebaseFromLocalStorage = () => {
    if (initiated && process.env.NODE_ENV !== "development") return false;
    Object.keys(localStorage).filter(key => key.startsWith("char_")).forEach(key => {
      let [, characterKey] = key.split("char_")
      if (!characterDatabase[characterKey]) {
        let character = loadFromLocalStorage(key);
        if (!character) return;
        characterDatabase[characterKey] = character;
      }
    })
    initiated = true
    return true
  }
  static updateCharacter = (char) => {
    if (this.isInvalid(char)) return;
    const dchar = deepClone(char)
    saveToLocalStorage(`char_${char.characterKey}`, dchar);
    characterDatabase[char.characterKey] = dchar;
  }
  static get = (characterKey) => characterDatabase?.[characterKey] ?? null

  static remove = (characterKey) => {
    delete characterDatabase[characterKey];
    localStorage.removeItem(`char_${characterKey}`);
  }
  static getArtifactIDFromSlot = (characterKey, slotKey) =>
    this.get(characterKey)?.equippedArtifacts?.[slotKey] ?? null

  static equipArtifact = (characterKey, art) => {
    const char = this.get(characterKey)
    if (!char || !art || !art.slotKey) return
    if (!char.equippedArtifacts) char.equippedArtifacts = {};
    char.equippedArtifacts[art.slotKey] = art.id;
    this.updateCharacter(char)
  }
  static unequipArtifactOnSlot = (characterKey, slotKey) => {
    const char = this.get(characterKey)
    if (!char || !slotKey) return
    if (!char?.equippedArtifacts?.[slotKey]) return;
    char.equippedArtifacts[slotKey] = "";
    this.updateCharacter(char)
  }
  static equipArtifactBuild = (characterKey, artifactIds) => {
    const character = this.get(characterKey)
    if (!character) return;
    character.equippedArtifacts = artifactIds
    CharacterDatabase.updateCharacter(character);
  }
  //helper function for testing
  static clearDatabase = () => {
    characterDatabase = {}
    initiated = false
  }
}
