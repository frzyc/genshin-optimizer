import { clamp } from "./Util";

export default class ConditionalsUtil {
  constructor() { if (this instanceof ConditionalsUtil) throw Error('A static class cannot be instantiated.'); }
  static getConditionalNum(conditionals, srcKeyObj) {
    let { srcKey, srcKey2 } = srcKeyObj
    if (conditionals)
      return conditionals.find(cond => cond.srcKey === srcKey && (!srcKey2 || (srcKey2 && cond.srcKey2 === srcKey2)))?.conditionalNum || 0
  }
  static setConditional(conditionals, srcKeyObj, conditionalNum) {
    let { srcKey, srcKey2 } = srcKeyObj
    if (!conditionals) conditionals = []
    let index = conditionals.findIndex(cond => cond.srcKey === srcKey && (!srcKey2 || (srcKey2 && cond.srcKey2 === srcKey2)))
    if (!conditionalNum && index >= 0) {
      //setting conditionalNum to 0 deletes the element
      conditionals.splice(index, 1);
    } else if (!conditionalNum && index < 0) { //nothing to change
      return conditionals
    } else {
      let newCond = { srcKey, conditionalNum }
      if (srcKey2) newCond.srcKey2 = srcKey2
      if (index >= 0)
        conditionals[index] = newCond
      else
        conditionals.push(newCond)
    }
    return conditionals
  }
  static getConditionalProp(conditional, fieldName, conditionalNum, defVal = [{}, 0]) {
    if (Array.isArray(conditional)) {
      //multiconditional
      let selectedConditionalNum = conditionalNum
      let selectedConditional = null
      for (const curConditional of conditional) {
        if (selectedConditionalNum > curConditional.maxStack) selectedConditionalNum -= curConditional.maxStack
        else {
          selectedConditional = curConditional;
          break;
        }
      }
      if (!selectedConditional) return defVal
      let stacks = clamp(selectedConditionalNum, 1, selectedConditional.maxStack)
      return [selectedConditional[fieldName], stacks]
    } else {
      //condtional with stacks
      let stacks = clamp(conditionalNum, 1, conditional.maxStack)
      return [conditional[fieldName], stacks]
    }
  }
}