import { artifactImport } from "../Artifact/ArtifactSheet";
import { charImport } from "../Character/CharacterSheet";
import { fieldProcessing } from "../Util/FieldUtil";
import { crawlObject, deepClone, layeredAssignment, objMultiplication, objPathValue } from "../Util/Util";
import { weaponImport } from "../Weapon/WeaponSheet";

const processed = Promise.all([
  charImport.then(sheets => addConditional(sheets, "character")), //attach character conditionals to Conditional
  weaponImport.then(sheets => addConditional(sheets, "weapon")), //attach weapon conditionals to Conditional
  artifactImport.then(sheets => addConditional(sheets, "artifact")) //attach artifact conditionals to Conditional
])

export default class Conditional {
  constructor() { if (this instanceof Conditional) throw Error('A static class cannot be instantiated.'); }
  static processed = processed
  static conditionals = { artifact: {}, character: {}, weapon: {} } //where all the conditionals are stored
  static canShow = (conditional, stats) => conditional?.canShow?.(stats)
  static resolve = (conditional, stats, conditionalValue, defVal = { stats: {}, fields: [], conditionalValue: [] }) => {
    if (!conditionalValue) conditionalValue = objPathValue(stats.conditionalValues, conditional.keys)
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
  static get = (keys, defVal = {}) => objPathValue(Conditional.conditionals, keys) ?? defVal

  //where callback is a function (conditional, conditionalValue, keys)
  static parseConditionalValues = (conditionalValues, callback) => {
    crawlObject(conditionalValues, [], c => Array.isArray(c), (conditionalValue, keys) => {
      const conditional = Conditional.get(keys, null as any)
      conditionalValue && conditional && callback(conditional, conditionalValue, keys)
    })
  }
}

//general parsing of conditionals, and add it to Conditional
function addConditional(source, key) {
  function findConditionals(obj, keys, callback) {
    if (keys.length > 10) return
    if (obj?.conditionals) Object.entries(obj.conditionals).forEach(([condKey, conditional]) => callback(conditional, [...keys, condKey]))
    else obj && typeof obj === "object" && Object.entries(obj).forEach(([key, val]) => findConditionals(val, [...keys, key], callback))
  }
  findConditionals(source, [key], (conditional, keys) => {
    conditional.keys = keys
    if (typeof conditional.canShow !== "function") conditional.canShow = () => true
    if (conditional.states) {//complex format
      Object.values(conditional.states).forEach((state: any) => {
        state.maxStack = state.maxStack ?? 1 //maxStack of 1 by default
        state.fields?.forEach?.(fieldProcessing)
      })
    } else { //simple format
      conditional.maxStack = conditional.maxStack ?? 1 //maxStack of 1 by default
      conditional.fields?.forEach?.(fieldProcessing)
    }
    layeredAssignment(Conditional.conditionals, keys, conditional)
  })
}

