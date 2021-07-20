import { Formulas, StatData } from "./StatData"
import { Modifier } from "./Types/ICalculatedStats"

// Generate a statKey dependency, to reduce build generation calculation on a single stat.
function GetFormulaDependency(formula: (s, c) => number) {
  const dependency: Set<string> = new Set()
  formula(
    new Proxy({}, { get: (target, prop, receiver) => { dependency.add(prop.toString()) } }),
    new Proxy({}, { get: (target, prop, receiver) => { dependency.add(prop.toString()) } }))
  return [...dependency]
}
const formulaKeyDependency = Object.freeze(Object.fromEntries(
  Object.entries(Formulas).map(([key, value]) => [key, GetFormulaDependency(value)])
)) as Dict<string, string[]>

if (process.env.NODE_ENV === "development") {
  let statKeys = Object.keys(StatData)
  Object.entries(formulaKeyDependency).forEach(([formulaKey, dependencies]) =>
    dependencies.forEach(key =>
      !statKeys.includes(key as any) &&
      console.error(`Formula ${formulaKey} depends key ${key} that does not Exist in StatData.`))
  )
  Object.entries(formulaKeyDependency).forEach(([formulaKey, dependencies]) =>
    StatData[formulaKey]?.const && dependencies.forEach(key =>
      !StatData[key as any]?.const &&
      console.error(`Constant formula ${formulaKey} depends on dynamic key ${key}.`)
    )
  )
}

function GetDependencies(modifiers: Modifier = {}, keys = Object.keys(StatData)) {
  let dependencies: Set<string> = new Set()
  keys.forEach(key => InsertDependencies(key, modifiers, dependencies))
  return [...dependencies]
}
function InsertDependencies(key: string, modifiers: Modifier, dependencies: Set<string>) {
  if (dependencies.has(key)) return
  formulaKeyDependency[key]?.forEach(k => InsertDependencies(k, modifiers, dependencies))
  Object.keys(modifiers[key] ?? {}).forEach(k => InsertDependencies(k, modifiers, dependencies))
  dependencies.add(key)
}

//if the optimizationTarget is in the form of {dmg:0.6}, it can be reduced to "dmg" for the purpose to build generation.
const reduceOptimizationTarget = (optimizationTarget) =>
  (typeof optimizationTarget === "object" && Object.keys(optimizationTarget).length === 1 && typeof optimizationTarget[Object.keys(optimizationTarget)[0] as any] === "number") ? Object.keys(optimizationTarget)[0] : optimizationTarget


export {
  GetFormulaDependency,
  GetDependencies,
  reduceOptimizationTarget,
}
