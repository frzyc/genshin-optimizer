import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util";
import Artifact from "./Artifact";

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
    artIdIndex = parseInt(localStorage.getItem("artifact_highest_id"));
    if (isNaN(artIdIndex)) artIdIndex = 0;
    artifactIdList = ArtifactDatabase.getIdListFromStorage();
    if (artifactIdList === null) artifactIdList = []
    for (const id of artifactIdList)
      if (!artifactDatabase[id]) {
        artifactDatabase[id] = loadFromLocalStorage(id);
        if (Artifact.isInvalidArtifact(artifactDatabase[id]))
          this.removeArtifactById(id);
      }
  }
  static getArtifact = (id) => id ? artifactDatabase[id] : null
  static removeArtifact = (art) => {
    this.removeArtifactById(art.id);
  }
  static addArtifact = (art) => {
    if (Artifact.isInvalidArtifact(art)) return;
    //generate id using artIdIndex
    let id = `artifact_${artIdIndex++}`
    localStorage.setItem("artifact_highest_id", artIdIndex)
    art.id = id;
    art = deepClone(art)
    saveToLocalStorage(id, art);
    artifactDatabase[id] = art;
    this.updateCacheData();
    return id;
  }
  static updateArtifact = (art) => {
    if (Artifact.isInvalidArtifact(art)) return;
    let id = art.id;
    art = deepClone(art)
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
  static moveToNewLocation = (artid, location) => {
    if (!artid) return;
    let art = this.getArtifact(artid)
    if (!art || art.location === location) return;
    art.location = location;
    this.updateArtifact(art);
  }
  static swapLocations = (artA, artB) => {
    let locA = artA.location
    let locB = artB.location
    this.moveToNewLocation(artA.id, locB)
    this.moveToNewLocation(artB.id, locA)
  }
  static swapLocationsById = (artAid, artBid) =>
    this.swapLocations(this.getArtifact(artAid), this.getArtifact(artBid))

}
