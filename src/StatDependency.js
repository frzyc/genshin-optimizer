import { AttachLazyFormulas, Formulas, OverrideFormulas, StatData } from "./StatData"

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
if (process.env.NODE_ENV === "development") console.log(formulaKeyDependency)

function DependencyFormulaKeys(key, formulaOverrides = []) {
  let dependencies = GetDependencyStats(key, formulaOverrides) || []
  let formulaKeys = [], included = new Set()
  let formulas = new Set([...Object.keys(formulaOverrides), ...Object.keys(Formulas)])

  for (const key of dependencies.reverse()) {
    if (included.has(key)) continue
    included.add(key)
    if (formulas.has(key))
      formulaKeys.push(key)
  }

  return formulaKeys
}
function GetDependencyStats(key, formulaOverrides = []) {
  let dependencies = [key]
  let keyDependencies = null
  for (const formulaOverride of formulaOverrides)
    if (OverrideFormulas[formulaOverride?.key]?.key === key)
      keyDependencies = OverrideFormulas[formulaOverride?.key]?.dependency
  keyDependencies = keyDependencies || formulaKeyDependency[key]
  keyDependencies?.forEach(k => {
    let subdependencies = GetDependencyStats(k, formulaOverrides)
    dependencies.push(...subdependencies)
  })
  return dependencies
}
export {
  DependencyFormulaKeys,
  GetDependencyStats,
}
