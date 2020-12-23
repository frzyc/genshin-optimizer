import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util";
var initiated = false
var artifactDatabase = {};
var artIdIndex = 1;
export default class ArtifactDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof ArtifactDatabase) {
      throw Error('A static class cannot be instantiated.');
    }
  }
  static isInvalid = (art) =>
    !art || !art.setKey || !art.numStars || !art.slotKey || !art.mainStatKey
  static getArtifactDatabase = () => deepClone(artifactDatabase);
  static getArtifactIdList = () => Object.keys(artifactDatabase);
  static populateDatebaseFromLocalStorage = () => {
    if (initiated) return;
    artIdIndex = parseInt(localStorage.getItem("artifact_highest_id"));
    if (isNaN(artIdIndex)) artIdIndex = 0;
    Object.keys(localStorage).filter(key => key.includes("artifact_")).forEach(id => {
      if (!artifactDatabase[id]) {
        let art = loadFromLocalStorage(id)
        if (!art) return;
        if (this.isInvalid(art)) {
          this.removeArtifactById(id);
          return;
        }
        artifactDatabase[id] = art;
      }
    })
    initiated = true
    return true
  }
  static getArtifact = (id) => id ? artifactDatabase[id] : null
  static removeArtifact = (art) => {
    this.removeArtifactById(art.id);
  }
  static addArtifact = (art) => {
    if (this.isInvalid(art)) return;
    //generate id using artIdIndex
    let id = `artifact_${artIdIndex++}`
    localStorage.setItem("artifact_highest_id", artIdIndex)
    art.id = id;
    let dart = deepClone(art)
    saveToLocalStorage(id, dart);
    artifactDatabase[id] = dart;
    return id;
  }
  static updateArtifact = (art) => {
    if (this.isInvalid(art)) return;
    let id = art.id;
    let dart = deepClone(art)
    saveToLocalStorage(id, dart);
    artifactDatabase[id] = dart;
  }
  static removeArtifactById = (artId) => {
    delete artifactDatabase[artId];
    localStorage.removeItem(artId);
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
