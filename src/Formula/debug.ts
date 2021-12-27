import { assertUnreachable } from "../Util/Util"
import { Node } from "./type"

export function formulaString(formula: Node): string {
  const { operation } = formula
  switch (operation) {
    case "const": return `${formula.value}` // TODO: case "string":
    case "read": return `Read[${formula.key}]`
    case "data": return `Context${formulaString(formula.operands[0])}`
    case "subscript": return `Lookup${formulaString(formula.operands[0])}` // TODO: case "stringSubscript":
    case "min": case "max":
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
    case "input": return "INPUT" // TODO: input case
    default: assertUnreachable(operation)
  }
}
