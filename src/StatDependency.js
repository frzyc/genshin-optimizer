import { Formulas, StatData } from "./StatData"

//generate a statKey dependency, to reduce build generation calculation on a single stat.
function GetFormulaDependency(formula) {
  const dependency = new Set()
  formula(new Proxy({}, { get: (target, prop, receiver) => { dependency.add(prop) } }))
  return [...dependency]
}
const formulaKeyDependency = Object.freeze(Object.fromEntries(
  Object.keys(Formulas).map(key => [key, GetFormulaDependency(Formulas[key])])
))

if (process.env.NODE_ENV === "development") {
  console.log(formulaKeyDependency)
  let statKeys = Object.keys(StatData)
  Object.entries(formulaKeyDependency).forEach(([formulaKey, dependencies]) =>
    dependencies.forEach(key =>
      !statKeys.includes(key) &&
      console.error("Formula", `"${formulaKey}"`, "has dependency with key", `"${key}"`, "that does not Exist in StatData."))
  )
}

function GetDependencies(modifiers = {}, keys = Object.keys(StatData)) {
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
