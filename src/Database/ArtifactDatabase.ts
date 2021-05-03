import { IArtifact } from "../Types/artifact";
import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util";
var initiated = false
var artifactDatabase: { [id: string]: IArtifact } = {};
var artIdIndex = 1;
const artListener = {}
var listener: any[] = []
export default class ArtifactDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof ArtifactDatabase) throw Error('A static class cannot be instantiated.');

  }
  static isInvalid = (art) =>
    !art || !art.setKey || !art.numStars || !art.slotKey || !art.mainStatKey || art.substats?.some(substat => substat.key && !substat.value) //TODO: is this necessary now that we are using typescript?
  static getArtifactDatabase = () => artifactDatabase;
  static getIdList = () => Object.keys(artifactDatabase);
  static populateDatebaseFromLocalStorage = () => {
    if (initiated && process.env.NODE_ENV !== "development") return false;
    Object.keys(localStorage).filter(key => key.startsWith("artifact_")).forEach(id => {
      if (!artifactDatabase[id]) {
        let art = loadFromLocalStorage(id)
        if (!art) return;
        if (ArtifactDatabase.isInvalid(art)) {
          ArtifactDatabase.removeArtifactById(id);
          return;
        }
        artifactDatabase[id] = art;
      }
    })
    initiated = true
    ArtifactDatabase.emitEvent()
    return true
  }
  static get = (id) => artifactDatabase[id] ?? null
  static removeArtifact = (art) => {
    ArtifactDatabase.removeArtifactById(art.id);
  }
  static update = (art) => {
    if (ArtifactDatabase.isInvalid(art)) return;
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
    ArtifactDatabase.emitEvent()
    ArtifactDatabase.emitArtEvent(id, dart)
    return id
  }
  static removeArtifactById = (artId) => {
    delete artifactDatabase[artId];
    localStorage.removeItem(artId);
    ArtifactDatabase.emitEvent()
  }

  static moveToNewLocation = (artid, location = "") => {
    const art = ArtifactDatabase.get(artid)
    if (!art || art.location === location) return;
    art.location = location;
    ArtifactDatabase.update(art);
  }
  static setLocked = (artid, lock = false) => {
    const art = ArtifactDatabase.get(artid)
    if (!art || art.lock === lock) return;
    art.lock = lock;
    ArtifactDatabase.update(art);
  }
  static swapLocations = (artA, artB) => {
    let locA = artA.location
    let locB = artB.location
    ArtifactDatabase.moveToNewLocation(artA.id, locB)
    ArtifactDatabase.moveToNewLocation(artB.id, locA)
  }
  static swapLocationsById = (artAid, artBid) =>
    ArtifactDatabase.swapLocations(ArtifactDatabase.get(artAid), ArtifactDatabase.get(artBid))
  static unequipAllArtifacts = () => {
    Object.values(artifactDatabase).forEach(art => {
      art.location = ""
      ArtifactDatabase.update(art)
    })
  }
  //helper function for testing
  static clearDatabase = () => {
    artifactDatabase = {}
    initiated = false
    artIdIndex = 1
    ArtifactDatabase.emitEvent()
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