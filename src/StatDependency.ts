import Formula from "./Formula"
import { getStage, numStages } from "./ProcessFormula"
import { Formulas, StatData } from "./StatData"
import { IBaseStat } from "./Types/character"
import { Modifier } from "./Types/stats"

// Generate a statKey dependency, to reduce build generation calculation on a single stat.
function GetFormulaDependency(formula: (s) => number) {
  const dependency: Set<string> = new Set()
  formula(new Proxy({}, { get: (target, prop, receiver) => { dependency.add(prop.toString()) } }))
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

function GetDependencies(baseStat: IBaseStat, modifiers: Modifier = {}, keys = Object.keys(StatData)): Dependencies {
  const found = new Set<string>()
  const dependencies = [...Array(numStages)].map(_ => new Set<string>())
  keys.forEach(key => InsertDependencies(baseStat, key, modifiers, dependencies, found))
  return dependencies.flatMap(dep => [...dep])
}
function InsertDependencies(baseStat: IBaseStat, key: string, modifiers: Modifier, dependencies: Set<string>[], found: Set<string>) {
  if (found.has(key)) return
  found.add(key)

  formulaKeyDependency[key]?.forEach(k => InsertDependencies(baseStat, k, modifiers, dependencies, found));
  (modifiers[key] ?? []).forEach(path => Formula.getCurrent(path, baseStat)[1].forEach(k =>
    InsertDependencies(baseStat, k, modifiers, dependencies, found)))
  dependencies[getStage(key)].add(key)
}

type Dependencies = string[]

export {
  GetFormulaDependency,
  GetDependencies,
}
