import type { AnyNode, Const, NumNode, StrNode, OP as TaggedOP } from '../node'
import { calculation, constant, mapBottomUp } from '../node'
import { ArrayMap, assertUnreachable } from '../util'
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>
const { arithmetic } = calculation

/** Simplify `n` */
export function simplify<I extends OP>(n: NumNode<I>[]): NumNode<I>[]
export function simplify<I extends OP>(n: StrNode<I>[]): StrNode<I>[]
export function simplify<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[]
export function simplify<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[] {
  n = flatten(n)
  n = combineConst(n)
  n = deduplicate(n)
  return n
}

/** Combine nested `sum`/`prod`/`min`/`max`, e.g., turn `sum(..., sum(...))` into `sum(...)` */
export function flatten<I extends OP>(n: NumNode<I>[]): NumNode<I>[]
export function flatten<I extends OP>(n: StrNode<I>[]): StrNode<I>[]
export function flatten<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[]
export function flatten<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[] {
  return mapBottomUp(n, (n) => {
    const { op } = n
    switch (op) {
      case 'sum':
      case 'prod':
      case 'min':
      case 'max':
        if (n.x.some((x) => x.op === op)) {
          const x = n.x.flatMap((x) => (x.op === op ? x.x : [x]))
          if (x.length === 1) return x[0] as NumNode<I>
          return { ...n, x } as NumNode<I>
        }
    }
    return n
  })
}

/** Combine constants in `sum`/`prod`/`min`/`max`, e.g., turn `sum(1, 2, ...)` into `sum(3, ...)` */
export function combineConst<I extends OP>(n: NumNode<I>[]): NumNode<I>[]
export function combineConst<I extends OP>(n: StrNode<I>[]): StrNode<I>[]
export function combineConst<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[]
export function combineConst<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[] {
  return mapBottomUp(n, (n) => {
    const { op } = n
    switch (op) {
      case 'sum':
      case 'prod':
      case 'min':
      case 'max': {
        const constX = n.x.filter((x) => x.op === 'const') as Const<number>[]
        if (constX.length > 1) {
          const varX = n.x.filter((x) => x.op !== 'const') as NumNode<I>[]
          const constVal = arithmetic[op](
            constX.map((x) => x.ex),
            n.ex
          )

          // Vacuous const part; don't add the unnecessary const term
          if (constVal === arithmetic[op]([], n.ex))
            return { ...n, x: varX } as NumNode<I>
          return { ...n, x: [constant(constVal), ...varX] } as NumNode<I>
        }
      }
    }
    return n
  })
}

/** Reuse nodes if they share the same computation with another node */
export function deduplicate<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[] {
  type Key = string | number | undefined | string[] | number[]
  const nodeIds = new Map<AnyNode<I>, number>()
  const nodeByKey = new ArrayMap<Key, AnyNode<I>>()
  return mapBottomUp(n, (n) => {
    const { op } = n
    const xIds = n.x.map((n) => nodeIds.get(n)!)
    const brIds = n.br.map((n) => nodeIds.get(n)!)
    let key: Key[]
    switch (op) {
      case 'read': {
        const cats = Object.keys(n.tag!).sort()
        key = [op, n.ex, ...cats, ...cats.map((cat) => n.tag![cat])]
        break
      }
      case 'sum':
      case 'prod':
      case 'min':
      case 'max':
        key = [op, ...xIds.sort()]
        break
      case 'thres':
      case 'custom':
      case 'sumfrac':
      case 'lookup':
      case 'subscript':
      case 'const':
        key = [op, n.ex, ...xIds, ...brIds]
        break
      case 'match':
        key = [op, n.ex, ...xIds, ...brIds.sort()]
        break
      default:
        assertUnreachable(op)
    }

    const ref = nodeByKey.ref(key)
    if ('value' in ref) return ref.value!
    ref.value = n
    nodeIds.set(n, nodeIds.size)
    return n
  })
}
