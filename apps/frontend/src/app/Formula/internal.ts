import type { AnyNode, Base, NodeData, NumNode, StrNode } from './type'
import { constant } from './utils'

export function deepNodeClone<
  T extends NodeData<NumNode | StrNode | undefined>
>(data: T): T {
  const map = new Map()
  function internal(orig: any) {
    if (typeof orig !== 'object') return orig
    const old = map.get(orig)
    if (old) return old

    const cache: any = Array.isArray(orig)
      ? orig.map((val) => internal(val))
      : Object.fromEntries(
          Object.entries(orig).map(([key, val]) => [
            key,
            key === 'info' ? val : internal(val),
          ])
        )
    map.set(orig, cache)
    return cache
  }
  return internal(data)
}

export function forEachNodes<T extends Base<T> = AnyNode>(
  formulas: T[],
  topDown: (formula: T) => void,
  bottomUp: (formula: T) => void
): void {
  const visiting = new Set<T>(),
    visited = new Set<T>()

  function traverse(formula: T) {
    if (visited.has(formula)) return

    if (visiting.has(formula)) {
      console.error('Found cyclical dependency during formula traversal')
      return
    }
    visiting.add(formula)

    topDown(formula)

    formula.operands.forEach(traverse)

    bottomUp(formula)

    visiting.delete(formula)
    visited.add(formula)
  }

  formulas.forEach(traverse)
}

export function mapFormulas<
  Input extends Base<Input> = AnyNode,
  Interim extends Base<Interim> = Input,
  Output extends Base<Output> = Interim
>(
  formulas: Input[],
  topDownMap: (formula: Input | Interim) => Interim,
  bottomUpMap: (current: Interim | Output, orig: Input | Interim) => Output
): Output[] {
  const visiting = new Set<Input | Interim>()
  const topDownMapped = new Map<Input | Interim, Output>()
  const bottomUpMapped = new Map<Interim, Output>()

  function check(formula: Input | Interim): Output {
    let topDown: Interim | Output | undefined = topDownMapped.get(formula)
    if (topDown) return topDown
    topDown = topDownMap(formula)

    let bottomUp = bottomUpMapped.get(topDown)
    if (bottomUp) return bottomUp

    if (visiting.has(topDown)) {
      console.error('Found cyclical dependency during formula mapping')
      return constant(NaN) as any
    }
    visiting.add(topDown)

    bottomUp = bottomUpMap(traverse(topDown), formula)

    visiting.delete(topDown)

    topDownMapped.set(formula, bottomUp)
    bottomUpMapped.set(topDown, bottomUp)
    return bottomUp
  }

  function traverse(formula: Interim): Interim | Output {
    const operands = formula.operands.map(check)
    return arrayEqual<Interim | Output>(operands, formula.operands)
      ? formula
      : { ...formula, operands }
  }

  const result = formulas.map(check)
  return arrayEqual<Input | Output>(result, formulas)
    ? (formulas as any)
    : result
}

export function customMapFormula<Context, Output, Input extends Base<Input>>(
  formulas: Input[],
  context: Context,
  map: (
    formula: Input,
    context: Context,
    map: (node: Input, context: Context) => Output
  ) => Output
): Output[] {
  const contextMapping = new Map<Context, [Set<Input>, Map<Input, Output>]>()
  function internalMap(formula: Input, context: Context): Output {
    let current = contextMapping.get(context)
    if (!current)
      contextMapping.set(context, (current = [new Set(), new Map()]))
    const [visiting, mapping] = current

    const old = mapping.get(formula)
    if (old) return old

    if (visiting.has(formula))
      throw new Error('Found cyclical dependency during formula mapping')

    visiting.add(formula)
    const newFormula = map(formula, context, internalMap)
    mapping.set(formula, newFormula)
    visiting.delete(formula)

    return newFormula
  }
  return formulas.map((formula) => internalMap(formula, context))
}

function arrayEqual<T>(
  a: readonly T[] | undefined,
  b: readonly T[] | undefined
): boolean {
  if (a === undefined) return b === undefined
  if (b === undefined) return false

  return a.length === b.length && a.every((value, i) => value === b[i])
}
