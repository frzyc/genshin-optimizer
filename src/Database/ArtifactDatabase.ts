import { IArtifact } from "../Types/artifact";
import { CharacterKey } from "../Types/consts";
import { deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util";
var initiated = false
var artifactDatabase: Dict<string, IArtifact> = {};
var artIdIndex = 1;
const artListener: Dict<string, UpdateCallback[]> = {}
var listener: any[] = []
export default class ArtifactDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof ArtifactDatabase) throw Error('A static class cannot be instantiated.')
  }

  static isInvalid = (art) =>
    !art || !art.setKey || !art.numStars || !art.slotKey || !art.mainStatKey || art.substats?.some(substat => substat.key && !substat.value) //TODO: is this necessary now that we are using typescript?
  static getArtifactDatabase = () => artifactDatabase;
  static getIdList = () => Object.keys(artifactDatabase);
  static populateDatebaseFromLocalStorage = () => {
    if (initiated && process.env.NODE_ENV !== "development") return false
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
  static get = (id: string | undefined) => artifactDatabase[id!]
  static removeArtifact = (art: IArtifact) => {
    ArtifactDatabase.removeArtifactById(art.id!)
  }
  static update = (art: IArtifact) => {
    if (ArtifactDatabase.isInvalid(art)) return
    let id = art.id;
    if (!id) { // If it does not have any id, generate one
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
  static removeArtifactById = (artId: string | undefined) => {
    delete artifactDatabase[artId!];
    localStorage.removeItem(artId!);
    ArtifactDatabase.emitEvent()
  }

  static moveToNewLocation = (artid: string | undefined, location: CharacterKey | "" = "") => {
    const art = ArtifactDatabase.get(artid)
    if (!art || art.location === location) return;
    art.location = location;
    ArtifactDatabase.update(art);
  }
  static setLocked = (artid: string | undefined, lock = false) => {
    const art = ArtifactDatabase.get(artid)
    if (!art || art.lock === lock) return;
    art.lock = lock;
    ArtifactDatabase.update(art);
  }
  static swapLocations = (artA: IArtifact, artB: IArtifact) => {
    const locA = artA.location, locB = artB.location
    ArtifactDatabase.moveToNewLocation(artA.id!, locB)
    ArtifactDatabase.moveToNewLocation(artB.id!, locA)
  }
  static swapLocationsById = (artAid: string, artBid: string) =>
    ArtifactDatabase.swapLocations(ArtifactDatabase.get(artAid)!, ArtifactDatabase.get(artBid)!)
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
  static registerListener(callback: UpdateCallback) {
    listener.push(callback)
  }
  static unregisterListener(callback: UpdateCallback) {
    listener = listener.filter(cb => cb !== callback)
  }
  static emitEvent() {
    listener.forEach(cb => cb(artifactDatabase))
  }
  static registerArtListener(id: string, callback: UpdateCallback) {
    if (!artListener[id]) artListener[id] = [callback]
    else artListener[id]!.push(callback)
  }
  static unregisterArtListener(id: string, callback: UpdateCallback) {
    artListener[id] = artListener[id]?.filter(cb => cb !== callback)
  }
  static emitArtEvent(id: string, art: IArtifact) {
    artListener[id]?.forEach(cb => cb(art))
  }
}

type UpdateCallback = (art: IArtifact) => void