import charFormulas from './Data/Characters/formula'
import { objPathValue } from './Util/Util';
export default class Formula {
  constructor() { if (this instanceof Formula) throw Error('A static class cannot be instantiated.'); }
  static get = (keys, defVal = null) => objPathValue(this, keys) ?? defVal
}

function addFormula(src, key) {
  Formula[key] = src
  attachKeys(src, [key])
}

function attachKeys(obj, keys) {
  if (typeof obj === "function") obj.keys = [...keys]
  else obj && typeof obj === "object" && Object.entries(obj).forEach(([key, val]) => attachKeys(val, [...keys, key]))
}

addFormula(charFormulas, "character")