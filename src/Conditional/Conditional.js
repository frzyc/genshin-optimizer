import { ArtifactData, ArtifactDataImport } from "../Data/ArtifactData"
import { CharacterDataImport, CharacterData } from "../Data/CharacterData"
import { WeaponData, WeaponDataImport } from "../Data/WeaponData";
import { deepClone, layeredAssignment, objMultiplication, objPathValue } from "../Util/Util"

export default class Conditional {
  constructor() { if (this instanceof Conditional) throw Error('A static class cannot be instantiated.'); }
  static canShow = (conditional, stats) => conditional?.canSHow && !conditional?.canSHow(stats) ? false : true
  static resolve = (conditional, stats, conditionalValue, defVal = { stats: {}, fields: [], conditionalValue: [] }) => {
    if (!conditionalValue) conditionalValue = objPathValue(stats.conditionalValues, conditional.keys)
    if (!conditionalValue) conditionalValue = conditional.trigger?.(stats)
    const [stacks, stateKey] = (conditionalValue ?? [])
    if (!stacks) return defVal
    if (stateKey) {//complex format
      if (conditional.states?.[stateKey]) conditional = conditional.states?.[stateKey]
      else return defVal
    }
    let conditionalStats = conditional.stats
    if (typeof conditionalStats === "function") conditionalStats = conditionalStats(stats)
    if (conditionalStats) defVal.stats = objMultiplication(deepClone(conditionalStats), stacks)
    if (conditional.fields) defVal.fields = conditional.fields
    defVal.conditionalValue = conditionalValue
    return defVal
  }
  static get = (keys, defVal = {}) => objPathValue(this, keys) ?? defVal
  //where callback is a function ([key1,key2,key3], conditionalValue, conditional) //TODO: make this work with any number of layers
  static parseConditionalValues = (conditionalValues, callback) => {
    if (typeof conditionalValues !== "object") return
    Object.entries(conditionalValues).forEach(([key1, key1Obj]) => {
      if (typeof key1Obj !== "object") return
      Object.entries(key1Obj).forEach(([key2, key2Obj]) => {
        if (typeof key2Obj !== "object") return
        Object.entries(key2Obj).forEach(([key3, conditionalValue]) => {
          const keys = [key1, key2, key3]
          const conditional = this.get(keys, null)
          conditionalValue && conditional && callback([key1, key2, key3], conditionalValue, conditionalValue)
        })
      })
    })
  }
}

//general parsing of conditionals, and adding it to Conditional //TODO: make this work with any number of layers
function addConditional(source, key1) {
  Object.entries(source).forEach(([key2, key2Obj]) => {
    Object.entries(key2Obj.conditionals ?? {}).forEach(([key3, conditional]) => {
      const keys = [key1, key2, key3]
      conditional.keys = keys
      if (conditional.states) {//complex format
        Object.entries(conditional.states).forEach(([stateKey, state]) => {
          state.maxStack = state.maxStack ?? 1 //maxStack of 1 by default
        })
      } else //simple format
        conditional.maxStack = conditional.maxStack ?? 1 //maxStack of 1 by default
      layeredAssignment(Conditional, keys, conditional)
    })
  })
}

//attach character conditionals to Conditional
Promise.resolve(CharacterDataImport).then(() => {
  addConditional(CharacterData, "character")
})
Promise.resolve(ArtifactDataImport).then(() => {
  addConditional(ArtifactData, "artifact")
  //attach metadata prop setNumKey to the conditional
  Object.values(ArtifactData).forEach(setObj =>
    Object.entries(setObj.setEffects).forEach(([setNumKey, setNumObj]) => {
      if (setNumObj.conditional) setNumObj.conditional.setNumKey = setNumKey
    }))
})
Promise.resolve(WeaponDataImport).then(() => {
  addConditional(WeaponData, "weapon")
})
