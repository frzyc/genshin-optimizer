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

function DependencyStatKeys(key, formulaOverrides = []) {
  let dependencies = GetDependencyStats(key, formulaOverrides) || []
  //add any formula override dependencies
  formulaOverrides.forEach(formulaOverride => {
    let { key, dependency = [] } = OverrideFormulas[formulaOverride.key] || {}
    if (!dependencies.includes(key)) return
    dependencies.push(...dependency)
  })
  dependencies = [...new Set(dependencies)]
  let formulaKeys = Object.keys(Formulas).filter(k => k === key || dependencies.includes(k))
  let statkeys = Object.keys(StatData).filter(k => k === key || dependencies.includes(k))
  return { formulaKeys, statkeys }
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
  DependencyStatKeys,
  GetDependencyStats,
}
