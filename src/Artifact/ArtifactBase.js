export default class ArtifactBase {
  //do not instantiate.
  constructor() { if (this instanceof ArtifactBase) throw Error('A static class cannot be instantiated.'); }

  //returns {setKey:[slotKey...]}
  static setToSlots = (artifacts) => {
    let setToSlots = {};
    Object.entries(artifacts).forEach(([key, art]) => {
      if (!art) return
      if (setToSlots[art.setKey]) setToSlots[art.setKey].push(key)
      else setToSlots[art.setKey] = [key]
    })
    return setToSlots
  }
}