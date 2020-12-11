import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util";

var artifactDatabase = {};
var artifactIdList = [];
var artIdIndex = 1;
export default class ArtifactDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof ArtifactDatabase) {
      throw Error('A static class cannot be instantiated.');
    }
  }
  static getIdListFromStorage = () => loadFromLocalStorage("artifact_id_list");
  static saveIdListToStorage = () => saveToLocalStorage("artifact_id_list", artifactIdList);
  static getArtifactDatabase = () => deepClone(artifactDatabase);
  static getArtifactIdList = () => deepClone(artifactIdList);
  static populateDatebaseFromLocalStorage = () => {
    if (artifactIdList.length > 0) return;
    artifactIdList = ArtifactDatabase.getIdListFromStorage();
    if (artifactIdList === null) artifactIdList = []
    for (const id of artifactIdList)
      if (!artifactDatabase[id])
        artifactDatabase[id] = loadFromLocalStorage(id);
    artIdIndex = parseInt(localStorage.getItem("artifact_highest_id"));
    if (isNaN(artIdIndex)) artIdIndex = 0;
  }
  static getArtifact = (id) => artifactDatabase[id]
  static removeArtifact = (art) => {
    this.removeArtifactById(art.id);
  }
  static addArtifact = (art) => {
    //generate id using artIdIndex
    let id = `artifact_${artIdIndex++}`
    localStorage.setItem("artifact_highest_id", artIdIndex)
    art.id = id;
    saveToLocalStorage(id, art);
    artifactDatabase[id] = art;
    this.updateCacheData();
    return id;
  }
  static updateArtifact = (art) => {
    let id = art.id;
    saveToLocalStorage(id, art);
    artifactDatabase[id] = art;
    this.updateCacheData();
  }
  static removeArtifactById = (artId) => {
    delete artifactDatabase[artId];
    localStorage.removeItem(artId);
    this.updateCacheData();
  }

  static updateCacheData() {
    this.updateIdList();
  }
  static updateIdList() {
    artifactIdList = Object.keys(artifactDatabase)
    this.saveIdListToStorage();
  }
}
