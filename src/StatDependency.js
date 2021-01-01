import { AttachLazyFormulas, Formulas, StatData } from "./Stat"

//generate a statKey dependency, to reduce build generation calculation on a single stat.
const formulaKeyDependency = {}
const getDependency = (key) => {
  let testObj = {}
  let dependency = []
  Object.keys(StatData).filter(k => k !== key).forEach(k => {
    Object.defineProperty(testObj, k, {
      get: () => {
        dependency.push(k)
        Object.defineProperty(testObj, k, { get: () => 0 })
        return 0
      },
      configurable: true
    })
  })
  AttachLazyFormulas(testObj)
  //use the getter to generate the dependency
  if (typeof testObj[key] === "number")
    formulaKeyDependency[key] = dependency
}
Object.keys(Formulas).forEach(key => getDependency(key))

function DependencyStatKeys(key) {
  let dependencies = formulaKeyDependency[key] || []
  formulaKeyDependency[key]?.forEach(k => dependencies.push(...(formulaKeyDependency[k] || [])))
  dependencies = [...new Set(dependencies)]
  let formulaKeys = Object.keys(Formulas).filter(k => k === key || dependencies.includes(k))
  let statkeys = Object.keys(StatData).filter(k => k === key || dependencies.includes(k))
  return [formulaKeys, statkeys]
}
export {
  DependencyStatKeys,
}
