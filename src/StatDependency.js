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
  Object.entries(modifiers).forEach(([key, modifier]) =>
    keys.includes(key) && Object.keys(modifier).map(mkey => InsertDependencies(mkey, dependencies)))
  keys.forEach(key => InsertDependencies(key, dependencies))
  return [...dependencies]
}
function InsertDependencies(key, dependencies = new Set()) {
  if (dependencies.has(key)) return
  formulaKeyDependency[key]?.forEach(k => InsertDependencies(k, dependencies))
  dependencies.add(key)
  return dependencies
}

export {
  GetFormulaDependency,
  GetDependencies,
  InsertDependencies
}
