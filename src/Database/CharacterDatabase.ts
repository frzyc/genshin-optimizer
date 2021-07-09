import { ICharacter } from "../Types/character";
import { CharacterKey, SlotKey } from "../Types/consts";
import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util";

export default class CharacterDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof CharacterDatabase) throw Error('A static class cannot be instantiated.');
  }
  static initiated = false
  static characterDatabase: Dict<CharacterKey | "", ICharacter> = {}
  static listener: any[] = []
  static charListener: Dict<CharacterKey, ((char: ICharacter) => void)[]> = {}
  static getCharacterDatabase = () => deepClone(CharacterDatabase.characterDatabase);
  static getCharacterKeyList = (): CharacterKey[] => (Object.keys(CharacterDatabase.characterDatabase) as any).filter(k => k)
  static getIdList = () => Object.keys(CharacterDatabase.characterDatabase);
  static populateDatebaseFromLocalStorage = () => {
    if (CharacterDatabase.initiated && process.env.NODE_ENV !== "development") return false;
    Object.keys(localStorage).filter(key => key.startsWith("char_")).forEach(key => {
      const [, characterKey] = key.split("char_") as [any, CharacterKey]
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
  static update = (char: ICharacter, emit = true) => {
    const dchar = deepClone(char)
    saveToLocalStorage(`char_${char.characterKey}`, dchar);
    CharacterDatabase.characterDatabase[char.characterKey] = dchar;
    if (emit) {
      CharacterDatabase.emitEvent()
      CharacterDatabase.emitCharEvent(dchar.characterKey, dchar)
    }
  }
  static get = (characterKey: CharacterKey | ""): ICharacter | undefined => CharacterDatabase.characterDatabase[characterKey]

  static remove = (characterKey: CharacterKey | "") => {
    delete CharacterDatabase.characterDatabase[characterKey];
    localStorage.removeItem(`char_${characterKey}`);
    CharacterDatabase.emitEvent()
  }
  static getArtifactIDFromSlot = (characterKey: CharacterKey, slotKey: SlotKey) =>
    CharacterDatabase.get(characterKey)?.equippedArtifacts?.[slotKey] ?? null

  static equipArtifactOnSlot = (characterKey: CharacterKey, slotKey: SlotKey, artid: string) => {
    const char = CharacterDatabase.get(characterKey)
    if (!char) return
    char.equippedArtifacts[slotKey] = artid;
    CharacterDatabase.update(char)
  }
  static equipArtifactBuild = (characterKey: CharacterKey | "", artifactIds: StrictDict<SlotKey, string>) => {
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
  static registerListener(callback: () => void) {
    CharacterDatabase.listener.push(callback)
  }
  static unregisterListener(callback: () => void) {
    CharacterDatabase.listener = CharacterDatabase.listener.filter(cb => cb !== callback)
  }
  static emitEvent() {
    CharacterDatabase.listener.forEach(cb => cb(CharacterDatabase.characterDatabase))
  }
  static registerCharListener(characterKey: CharacterKey, callback: (char: ICharacter) => void) {
    if (!CharacterDatabase.charListener[characterKey]) CharacterDatabase.charListener[characterKey] = [callback]
    else CharacterDatabase.charListener[characterKey]!.push(callback)
  }
  static unregisterCharListener(characterKey: CharacterKey, callback: (char: ICharacter) => void) {
    CharacterDatabase.charListener[characterKey] = CharacterDatabase.charListener[characterKey]?.filter(cb => cb !== callback)
  }
  static emitCharEvent(characterKey: CharacterKey, char: ICharacter) {
    CharacterDatabase.charListener[characterKey]?.forEach(cb => cb(char))
  }
}
