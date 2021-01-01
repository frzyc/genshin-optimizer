import { AttachLazyFormulas, Formulas, StatData } from "./Stat"

//generate a statKey dependency, to reduce build generation calculation on a single stat.
const formulaKeyDependency = {}
const getDependency = (key) => {
  let testObj = {}
  let depdendency = []
  Object.keys(StatData).filter(k => k !== key).forEach(k => {
    Object.defineProperty(testObj, k, {
      get: () => {
        depdendency.push(k)
        Object.defineProperty(testObj, k, { get: () => 0 })
        return 0
      },
      configurable: true
    })
  })
  AttachLazyFormulas(testObj)
  // eslint-disable-next-line
  let _ = testObj[key] //use the getter to generate the dependency
  formulaKeyDependency[key] = depdendency
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
