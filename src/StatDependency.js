import { Formulas, Modifiers, StatData } from "./StatData"

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
Object.keys(Modifiers).forEach(name => registerDependency(name, s => Modifiers[name].formula({})(s)))

if (process.env.NODE_ENV === "development") console.log(formulaKeyDependency)

function GetDependencies(initialStats, keys = Object.keys(Formulas)) {
  let dependencies = new Set(), { modifiers = {} } = initialStats
  keys.forEach(key => InsertDependencies(key, modifiers, dependencies))
  return [...dependencies]
}
function InsertDependencies(key, modifiers, dependencies) {
  if (dependencies.has(key)) return

  formulaKeyDependency[key]?.forEach(k => InsertDependencies(k, modifiers, dependencies))
  dependencies.add(key)

  for (const name in modifiers) {
    if (Modifiers[name].key === key) {
      formulaKeyDependency[name].forEach(k => InsertDependencies(k, modifiers, dependencies))
      dependencies.add(name)
    }
  }
}

export {
  GetDependencies,
}
