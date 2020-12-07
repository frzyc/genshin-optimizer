import { loadFromLocalStorage, saveToLocalStorage } from "../Util";

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
  static getIdList = () => loadFromLocalStorage("artifact_id_list"); 
  static saveIdList = () => saveToLocalStorage("artifact_id_list", artifactIdList);
  static getartifactIdList = () => artifactIdList;
  static populateDatebaseFromLocalStorage = () => {
    artifactIdList = ArtifactDatabase.getIdList();
    if (artifactIdList === null) artifactIdList = []
    for (const id of artifactIdList)
      artifactDatabase[id] = loadFromLocalStorage(id);
    artIdIndex = parseInt(localStorage.getItem("artifact_highest_id"));
    if (isNaN(artIdIndex)) artIdIndex = 0;
  }
  static addArtifact = (art) => {
    //generate id using artIdIndex
    let id = `artifact_${artIdIndex++}`
    localStorage.setItem("artifact_highest_id", artIdIndex)
    art.id = id;
    saveToLocalStorage(id, art);
    artifactDatabase[id] = art;
    artifactIdList.push(id)
    ArtifactDatabase.saveIdList()
    return id;
  }
  static updateArtifact = (art) => {
    let id = art.id;
    saveToLocalStorage(id, art);
    artifactDatabase[id] = art;
  }
  static getArtifact = (id) => artifactDatabase[id]
  static removeArtifact = (art) => {
    ArtifactDatabase.removeArtifactById(art.id);
  }
  static removeArtifactById = (artId) => {
    delete artifactDatabase[artId];
    localStorage.removeItem(artId);
    let index = artifactIdList.indexOf(artId)
    if (index !== -1) {
      artifactIdList.splice(index, 1);
      ArtifactDatabase.saveIdList();
    }
  }
}
