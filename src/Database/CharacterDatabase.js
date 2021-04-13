import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util";
export default class CharacterDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof CharacterDatabase) throw Error('A static class cannot be instantiated.');
  }
  static initiated = false
  static characterDatabase = {}
  static listener = []
  static charListener = []
  static isInvalid = (char) => !char || !char.characterKey || !char.levelKey
  static getCharacterDatabase = () => deepClone(this.characterDatabase);
  static getCharacterKeyList = () => Object.keys(this.characterDatabase);
  static getIdList = () => Object.keys(this.characterDatabase);
  static populateDatebaseFromLocalStorage = () => {
    if (this.initiated && process.env.NODE_ENV !== "development") return false;
    Object.keys(localStorage).filter(key => key.startsWith("char_")).forEach(key => {
      const [, characterKey] = key.split("char_")
      if (!this.characterDatabase[characterKey]) {
        const character = loadFromLocalStorage(key);
        if (!character) return;
        this.characterDatabase[characterKey] = character;
      }
    })
    this.initiated = true
    this.emitEvent()
    return true
  }
  static update = (char) => {
    if (this.isInvalid(char)) return;
    const dchar = deepClone(char)
    saveToLocalStorage(`char_${char.characterKey}`, dchar);
    this.characterDatabase[char.characterKey] = dchar;
    this.emitEvent()
    this.emitCharEvent(dchar.characterKey, dchar)
  }
  static get = (characterKey, defVal = null) => this.characterDatabase?.[characterKey] ?? defVal

  static remove = (characterKey) => {
    delete this.characterDatabase[characterKey];
    localStorage.removeItem(`char_${characterKey}`);
    this.emitEvent()
  }
  static getArtifactIDFromSlot = (characterKey, slotKey) =>
    this.get(characterKey)?.equippedArtifacts?.[slotKey] ?? null

  static equipArtifact = (characterKey, art) => {
    const char = this.get(characterKey)
    if (!char || !art || !art.slotKey) return
    if (!char.equippedArtifacts) char.equippedArtifacts = {};
    char.equippedArtifacts[art.slotKey] = art.id;
    this.update(char)
  }
  static unequipArtifactOnSlot = (characterKey, slotKey) => {
    const char = this.get(characterKey)
    if (!char || !slotKey) return
    if (!char?.equippedArtifacts?.[slotKey]) return;
    char.equippedArtifacts[slotKey] = "";
    this.update(char)
  }
  static equipArtifactBuild = (characterKey, artifactIds) => {
    const character = this.get(characterKey)
    if (!character) return;
    character.equippedArtifacts = artifactIds
    CharacterDatabase.update(character);
  }
  static unequipAllArtifacts = () => {
    Object.values(this.characterDatabase).forEach(char => {
      char.equippedArtifacts = {}
      this.update(char)
    })
  }
  //helper function for testing
  static clearDatabase = () => {
    this.characterDatabase = {}
    this.initiated = false
    this.emitEvent()
  }
  static registerListener(callback) {
    this.listener.push(callback)
  }
  static unregisterListener(callback) {
    this.listener = this.listener.filter(cb => cb !== callback)
  }
  static emitEvent() {
    this.listener.forEach(cb => cb(this.characterDatabase))
  }
  static registerCharListener(characterKey, callback) {
    if (!this.charListener[characterKey]) this.charListener[characterKey] = [callback]
    else this.charListener[characterKey].push(callback)
  }
  static unregisterCharListener(characterKey, callback) {
    this.charListener[characterKey] = this.charListener[characterKey]?.filter(cb => cb !== callback)
  }
  static emitCharEvent(characterKey, char) {
    this.charListener[characterKey]?.forEach(cb => cb(char))
  }
}
