import type { AnyNode, Const, NumNode, StrNode, OP as TaggedOP } from '../node'
import { calculation, constant, mapBottomUp } from '../node'
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>
const { arithmetic } = calculation

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

          // Constant-only; replace with `Const` node
          if (!varX.length) return constant(constVal)
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
