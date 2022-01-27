import { assertUnreachable } from "../Util/Util"
import { NumNode, StrNode } from "./type"

export function formulaString(formula: NumNode | StrNode): string {
  const { operation } = formula
  switch (operation) {
    case "const": return `${formula.value}`
    case "read": return `Read[${formula.path}]`
    case "data": return `Context${formulaString(formula.operands[0])}`
    case "subscript": return `Lookup${formulaString(formula.operands[0])}`
    case "min": case "max": case "prio":
      return `${operation}( ${formula.operands.map(formulaString).join(", ")} )`
    case "add":
      return `( ${formula.operands.map(formulaString).join(" + ")} )`
    case "mul":
      return `( ${formula.operands.map(formulaString).join(" * ")} )`
    case "sum_frac":
      const [x, c] = formula.operands.map(formulaString)
      return `( ${x} / ( ${x} + ${c} ) )`
    case "threshold_add":
      const [value, threshold, addition] = formula.operands.map(formulaString)
      return `( ${value} >= ${threshold} ? ${addition} : 0 )`
    case "res":
      return `Res${formulaString(formula.operands[0])}`
    case "match":
      return `Match(${formula.operands.map(formulaString).join(", ")})`
    case "lookup":
      return `Lookup${formulaString(formula.operands[0])}`
    default: assertUnreachable(operation)
  }
}
