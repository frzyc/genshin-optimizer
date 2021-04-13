import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util";
var initiated = false
var artifactDatabase = {};
var artIdIndex = 1;
const artListener = {}
var listener = []
export default class ArtifactDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof ArtifactDatabase) throw Error('A static class cannot be instantiated.');

  }
  static isInvalid = (art) =>
    !art || !art.setKey || !art.numStars || !art.slotKey || !art.mainStatKey || art.substats?.some(substat => substat.key && !substat.value)
  static getArtifactDatabase = () => artifactDatabase;
  static getIdList = () => Object.keys(artifactDatabase);
  static populateDatebaseFromLocalStorage = () => {
    if (initiated && process.env.NODE_ENV !== "development") return false;
    Object.keys(localStorage).filter(key => key.startsWith("artifact_")).forEach(id => {
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
    this.emitEvent()
    return true
  }
  static get = (id) => artifactDatabase[id] ?? null
  static removeArtifact = (art) => {
    this.removeArtifactById(art.id);
  }
  static update = (art) => {
    if (this.isInvalid(art)) return;
    let id = art.id;
    if (!id) {//if does not have id, generate ID
      do {
        id = `artifact_${artIdIndex++}`
      } while (localStorage.getItem(id) !== null)
      art.id = id
    }
    let dart = deepClone(art)
    saveToLocalStorage(id, dart);
    artifactDatabase[id] = dart;
    this.emitEvent()
    this.emitArtEvent(id, dart)
  }
  static removeArtifactById = (artId) => {
    delete artifactDatabase[artId];
    localStorage.removeItem(artId);
    this.emitEvent()
  }

  static moveToNewLocation = (artid, location = "") => {
    const art = this.get(artid)
    if (!art || art.location === location) return;
    art.location = location;
    this.update(art);
  }
  static setLocked = (artid, lock = false) => {
    const art = this.get(artid)
    if (!art || art.lock === lock) return;
    art.lock = lock;
    this.update(art);
  }
  static swapLocations = (artA, artB) => {
    let locA = artA.location
    let locB = artB.location
    this.moveToNewLocation(artA.id, locB)
    this.moveToNewLocation(artB.id, locA)
  }
  static swapLocationsById = (artAid, artBid) =>
    this.swapLocations(this.get(artAid), this.get(artBid))
  static unequipAllArtifacts = () => {
    Object.values(artifactDatabase).forEach(art => {
      art.location = ""
      this.update(art)
    })
  }
  //helper function for testing
  static clearDatabase = () => {
    artifactDatabase = {}
    initiated = false
    artIdIndex = 1
    this.emitEvent()
  }
  static registerListener(callback) {
    listener.push(callback)
  }
  static unregisterListener(callback) {
    listener = listener.filter(cb => cb !== callback)
  }
  static emitEvent() {
    listener.forEach(cb => cb(artifactDatabase))
  }
  static registerArtListener(id, callback) {
    if (!artListener[id]) artListener[id] = [callback]
    else artListener[id].push(callback)
  }
  static unregisterArtListener(id, callback) {
    artListener[id] = artListener[id]?.filter(cb => cb !== callback)
  }
  static emitArtEvent(id, art) {
    artListener[id]?.forEach(cb => cb(art))
  }
}