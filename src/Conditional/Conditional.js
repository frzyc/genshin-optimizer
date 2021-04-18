import { ArtifactData, ArtifactDataImport } from "../Data/ArtifactData"
import { CharacterDataImport, CharacterData } from "../Data/CharacterData"
import { WeaponData, WeaponDataImport } from "../Data/WeaponData";
import { fieldProcessing } from "../Util/FieldUtil";
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

  //where callback is a function (conditional, conditionalValue, keys)
  static parseConditionalValues = (conditionalValues, callback) => {
    function crawlConditionalValues(obj, keys, cb) {
      if (Array.isArray(obj)) cb(obj, keys)
      else obj && typeof obj === "object" && Object.entries(obj).forEach(([key, val]) => crawlConditionalValues(val, [...keys, key], cb))
    }
    crawlConditionalValues(conditionalValues, [], (conditionalValue, keys) => {
      const conditional = this.get(keys, null)
      conditionalValue && conditional && callback(conditional, conditionalValue, keys)
    })
  }
}

//general parsing of conditionals, and adding it to Conditional 
function addConditional(source, key) {
  function findConditionals(obj, keys, callback) {
    if (keys.length > 10) return
    if (obj?.conditionals) Object.entries(obj.conditionals).forEach(([condKey, conditional]) => callback(conditional, [...keys, condKey]))
    else obj && typeof obj === "object" && Object.entries(obj).forEach(([key, val]) => findConditionals(val, [...keys, key], callback))
  }
  findConditionals(source, [key], (conditional, keys) => {
    conditional.keys = keys
    if (conditional.states) {//complex format
      Object.values(conditional.states).forEach(state => {
        state.maxStack = state.maxStack ?? 1 //maxStack of 1 by default
        state.fields?.forEach?.(fieldProcessing)
      })
    } else { //simple format
      conditional.maxStack = conditional.maxStack ?? 1 //maxStack of 1 by default
      conditional.fields?.forEach?.(fieldProcessing)
    }
    layeredAssignment(Conditional, keys, conditional)
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
