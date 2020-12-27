export default class ArtifactConditionals {
  constructor() { if (this instanceof ArtifactConditionals) throw Error('A static class cannot be instantiated.'); }
  static getConditionalNum(artifactConditionals, setKey, setNumKey) {
    if (artifactConditionals)
      return artifactConditionals.find(charConditional =>
        charConditional.setKey === setKey && charConditional.setNumKey === setNumKey)?.conditionalNum || 0
  }
  static setConditional(artifactConditionals, setKey, setNumKey, conditionalNum) {
    if (!artifactConditionals) artifactConditionals = []
    let index = artifactConditionals.findIndex(artCond => artCond.setKey === setKey && artCond.setNumKey === setNumKey)
    if (!conditionalNum && index >= 0) {
      //setting conditionalNum to 0 deletes the element
      artifactConditionals.splice(index, 1);
    } else {
      let newArtCond = { setKey, setNumKey, conditionalNum }
      if (index >= 0)
        artifactConditionals[index] = newArtCond
      else
        artifactConditionals.push(newArtCond)
    }
    return artifactConditionals
  }
}