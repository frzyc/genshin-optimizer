import { loadFromLocalStorage, saveToLocalStorage } from "../Util";

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
  static getIdList = () => loadFromLocalStorage("character_id_list"); 
  static saveIdList = () => saveToLocalStorage("character_id_list", characterIdList);
  static getCharacterIdList = () => characterIdList;
  static populateDatebaseFromLocalStorage = () => {
    characterIdList = CharacterDatabase.getIdList();
    if (characterIdList === null) characterIdList = []
    for (const id of characterIdList)
      characterDatabase[id] = loadFromLocalStorage(id);
    charIdIndex = parseInt(localStorage.getItem("character_highest_id"));
    if (isNaN(charIdIndex)) charIdIndex = 0;
  }
  static addCharacter = (char) => {
    //generate id using charIdIndex
    let id = `character_${charIdIndex++}`
    localStorage.setItem("character_highest_id", charIdIndex)
    char.id = id;
    saveToLocalStorage(id, char);
    characterDatabase[id] = char;
    characterIdList.push(id)
    CharacterDatabase.saveIdList()
    return id;
  }
  static updateCharacter = (char) => {
    let id = char.id;
    saveToLocalStorage(id, char);
    characterDatabase[id] = char;
  }
  static getCharacter = (id) => characterDatabase[id]
  static removeCharacter = (char) => {
    CharacterDatabase.removeCharacterById(char.id);
  }
  static removeCharacterById = (id) => {
    delete characterDatabase[id];
    localStorage.removeItem(id);
    let index = characterIdList.indexOf(id)
    if (index !== -1) {
      characterIdList.splice(index, 1);
      CharacterDatabase.saveIdList();
    }
  }

}
