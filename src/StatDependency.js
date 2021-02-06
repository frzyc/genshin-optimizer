import { Formulas, StatData } from "./StatData"

//generate a statKey dependency, to reduce build generation calculation on a single stat.
const formulaKeyDependency = {}
const GetFormulaDependency = (formula) => {
  const dependency = new Set()
  formula(new Proxy({}, { get: (target, prop, receiver) => dependency.add(prop) }))
  return [...dependency]
}
Object.keys(Formulas).forEach(key => formulaKeyDependency[key] = GetFormulaDependency(s => Formulas[key](s)))

if (process.env.NODE_ENV === "development") {
  console.log(formulaKeyDependency)
  let statKeys = Object.keys(StatData)
  Object.entries(formulaKeyDependency).forEach(([formulaKey, dependencies]) =>
    dependencies.forEach(key =>
      !statKeys.includes(key) &&
      console.error("Formula", `"${formulaKey}"`, "has dependency with key", `"${key}"`, "that does not Exist in StatData."))
  )
}

function GetDependencies(modifiers = {}, keys = Object.keys(Formulas)) {
  let dependencies = new Set()
  keys.forEach(key => InsertDependencies(key, modifiers, dependencies))
  return [...dependencies]
}
function InsertDependencies(key, modifiers, dependencies) {
  if (dependencies.has(key)) return
  formulaKeyDependency[key]?.forEach(k => InsertDependencies(k, modifiers, dependencies))
  Object.keys(modifiers[key] ?? {}).forEach(k => InsertDependencies(k, modifiers, dependencies))
  dependencies.add(key)
}

export {
  GetFormulaDependency,
  GetDependencies,
}
