import { assertUnreachable } from '../util'
import { calculation, constant, mapBottomUp } from '../node'
import type {
    AnyNode,
    Const,
    NumNode,
    StrNode,
    OP as TaggedOP,
} from '../node'
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>
const { arithmetic, branching } = calculation

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

/** Replace all nodes with constant values with Const nodes */
export function applyConst<I extends OP>(n: NumNode<I>[]): NumNode<I>[]
export function applyConst<I extends OP>(n: StrNode<I>[]): StrNode<I>[]
export function applyConst<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[]
export function applyConst<I extends OP>(n: AnyNode<I>[]): AnyNode<I>[] {
    return mapBottomUp(n, (n) => {
        const { op } = n
        switch (op) {
            case 'sum':
            case 'prod':
            case 'min':
            case 'max':
            case 'sumfrac':
                if (n.x.every((x) => x.op === 'const'))
                    return constant(
                        arithmetic[op](
                            n.x.map((x) => x.ex),
                            n.ex
                        )
                    )
                break
            case 'lookup':
            case 'thres':
            case 'match':
                if (n.br.every((br) => br.op === 'const')) {
                    const index = branching[op](
                        n.br.map((br) => br.ex),
                        n.ex
                    )
                    return n.x[index]
                }
                if (n.x.every((x) => x.op === 'const' && x.ex === n.x[0]!.ex))
                    return n.x[0]
                break
            case 'subscript':
                if (n.br[0]!.op === 'const') return n.ex[n.br[0]!.ex!]
                break
            case 'const':
            case 'read':
            case 'custom':
                break
            default:
                assertUnreachable(op)
        }
        return n
    })
}
