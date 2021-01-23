import { Formulas, OverrideFormulas, StatData } from "./StatData"

//generate a statKey dependency, to reduce build generation calculation on a single stat.
const formulaKeyDependency = {}
const registerDependency = (name, operation) => {
  let testObj = {}
  let dependency = new Set()
  Object.keys(StatData).forEach(k => {
    Object.defineProperty(testObj, k, {
      get: () => {
        dependency.add(k)
        return 0
      }
    })
  })
  operation(testObj)
  formulaKeyDependency[name] = [...dependency]
}
Object.keys(Formulas).forEach(key => registerDependency(key, s => Formulas[key](s)))
Object.keys(OverrideFormulas).forEach(name => registerDependency(name, s => OverrideFormulas[name].formula(s)))

if (process.env.NODE_ENV === "development") console.log(formulaKeyDependency)

function GetDependencies(initialStats, keys = Object.keys(Formulas)) {
  let dependencies = new Set(), { formulaOverrides = [] } = initialStats
  let formulas = new Set([...Object.keys(formulaOverrides), ...Object.keys(Formulas)])
  keys.forEach(key => InsertDependencies(key, formulaOverrides, dependencies))
  return [...dependencies]
}
function InsertDependencies(key, formulaOverrides, dependencies) {
  if (dependencies.has(key)) return

  formulaKeyDependency[key]?.forEach(k => InsertDependencies(k, formulaOverrides, dependencies))
  dependencies.add(key)

  for (const {key: name} of formulaOverrides) {
    if (OverrideFormulas[name].key === key) {
      formulaKeyDependency[name].forEach(k => InsertDependencies(k, formulaOverrides, dependencies))
      dependencies.add(name)
    }
  }
}

export {
  GetDependencies,
}
