import { ICharacter } from "../Types/character";
import { CharacterKey } from "../Types/consts";
import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util";
export default class CharacterDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof CharacterDatabase) throw Error('A static class cannot be instantiated.');
  }
  static initiated = false
  static characterDatabase: Dict<CharacterKey, ICharacter> = {}
  static listener: any[] = []
  static charListener: any[] = []
  static isInvalid = (char) => !char || !char.characterKey || !char.levelKey //TODO: is this useful since we use typescript?
  static getCharacterDatabase = () => deepClone(CharacterDatabase.characterDatabase);
  static getCharacterKeyList = (): CharacterKey[] => Object.keys(CharacterDatabase.characterDatabase);
  static getIdList = () => Object.keys(CharacterDatabase.characterDatabase);
  static populateDatebaseFromLocalStorage = () => {
    if (CharacterDatabase.initiated && process.env.NODE_ENV !== "development") return false;
    Object.keys(localStorage).filter(key => key.startsWith("char_")).forEach(key => {
      const [, characterKey] = key.split("char_")
      if (!CharacterDatabase.characterDatabase[characterKey]) {
        const character = loadFromLocalStorage(key);
        if (!character) return;
        CharacterDatabase.characterDatabase[characterKey] = character;
      }
    })
    CharacterDatabase.initiated = true
    CharacterDatabase.emitEvent()
    return true
  }
  static update = (char) => {
    if (CharacterDatabase.isInvalid(char)) return;
    const dchar = deepClone(char)
    saveToLocalStorage(`char_${char.characterKey}`, dchar);
    CharacterDatabase.characterDatabase[char.characterKey] = dchar;
    CharacterDatabase.emitEvent()
    CharacterDatabase.emitCharEvent(dchar.characterKey, dchar)
  }
  static get = (characterKey: string): ICharacter | undefined => CharacterDatabase.characterDatabase[characterKey]

  static remove = (characterKey) => {
    delete CharacterDatabase.characterDatabase[characterKey];
    localStorage.removeItem(`char_${characterKey}`);
    CharacterDatabase.emitEvent()
  }
  static getArtifactIDFromSlot = (characterKey, slotKey) =>
    CharacterDatabase.get(characterKey)?.equippedArtifacts?.[slotKey] ?? null

  static equipArtifactOnSlot = (characterKey, slotKey, artid) => {
    const char = CharacterDatabase.get(characterKey)
    if (!char) return
    char.equippedArtifacts[slotKey] = artid;
    CharacterDatabase.update(char)
  }
  static equipArtifactBuild = (characterKey, artifactIds) => {
    const character = CharacterDatabase.get(characterKey)
    if (!character) return;
    character.equippedArtifacts = artifactIds
    CharacterDatabase.update(character);
  }
  static unequipAllArtifacts = () => {
    Object.values(CharacterDatabase.characterDatabase).forEach(char => {
      char.equippedArtifacts = {}
      CharacterDatabase.update(char)
    })
  }
  //helper function for testing
  static clearDatabase = () => {
    CharacterDatabase.characterDatabase = {}
    CharacterDatabase.initiated = false
    CharacterDatabase.emitEvent()
  }
  static registerListener(callback) {
    CharacterDatabase.listener.push(callback)
  }
  static unregisterListener(callback) {
    CharacterDatabase.listener = CharacterDatabase.listener.filter(cb => cb !== callback)
  }
  static emitEvent() {
    CharacterDatabase.listener.forEach(cb => cb(CharacterDatabase.characterDatabase))
  }
  static registerCharListener(characterKey, callback) {
    if (!CharacterDatabase.charListener[characterKey]) CharacterDatabase.charListener[characterKey] = [callback]
    else CharacterDatabase.charListener[characterKey].push(callback)
  }
  static unregisterCharListener(characterKey, callback) {
    CharacterDatabase.charListener[characterKey] = CharacterDatabase.charListener[characterKey]?.filter(cb => cb !== callback)
  }
  static emitCharEvent(characterKey, char) {
    CharacterDatabase.charListener[characterKey]?.forEach(cb => cb(char))
  }
}
