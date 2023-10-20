import { assertUnreachable } from '../Util/Util'
import { forEachNodes } from './internal'
import { constant, sum, prod, threshold, frac, max, min } from './utils'
import type { ReadNode } from './type'
import type { OptNode } from './optimization'

/** Checks whether a formula `f` is constant with respect to variable `x`. */
export function zero_deriv(
  f: OptNode,
  binding: (readNode: ReadNode<number>) => string,
  x: string
): boolean {
  let ret = true
  forEachNodes(
    [f],
    (_) => {},
    (f) => {
      const { operation } = f
      switch (operation) {
        case 'read':
          if (f.type !== 'number' || (f.accu && f.accu !== 'add'))
            throw new Error(`Unsupported [${operation}] node in zero_deriv`)
          if (binding(f) === x) ret = false
      }
    }
  )
  return ret
}

/**
 * Takes a derivative of function `f` with respect to variable `x`.
 * Does not perform any algebraic simplifications or grouping.
 *
 * Notes:
 * - sum_frac f(a, b) = a / (a + b) has a strange form; would be simplified with a proper division node.
 * - mul does not group higher powers.
 * - thresh() and res() throw if you try to differentiate branching arguments.
 */
export function ddx(
  f: OptNode,
  binding: (readNode: ReadNode<number>) => string,
  x: string
): OptNode {
  const { operation } = f
  switch (operation) {
    case 'read': {
      if (f.type !== 'number' || (f.accu && f.accu !== 'add'))
        throw new Error(`Unsupported [${operation}] node in d/dx`)
      const name = binding(f)
      if (name === x) return constant(1)
      return constant(0)
    }
    case 'const':
      return constant(0)
    case 'res':
      if (!zero_deriv(f, binding, x))
        throw new Error(`[${operation}] node takes only constant inputs. ${f}`)
      return constant(0)

    case 'add':
      return sum(...f.operands.map((fi) => ddx(fi, binding, x)))
    case 'mul': {
      const ops = f.operands.map((fi, i) =>
        prod(ddx(fi, binding, x), ...f.operands.filter((v, ix) => ix !== i))
      )
      return sum(...ops)
    }
    case 'sum_frac': {
      const a = f.operands[0]
      const da = ddx(a, binding, x)
      const b = sum(...f.operands.slice(1))
      const db = ddx(b, binding, x)
      const denom = prod(sum(...f.operands), sum(...f.operands))
      const numerator = sum(prod(b, da), prod(-1, a, db))
      return frac(numerator, sum(prod(-1, numerator), denom))
    }

    case 'min':
    case 'max': {
      let out = ddx(f.operands[0], binding, x)
      for (let i = 1; i < f.operands.length; i++) {
        const op_i = f.operands[i]
        if (operation === 'min') {
          const cmp_i = min(...f.operands.slice(0, i))
          out = threshold(op_i, cmp_i, out, ddx(op_i, binding, x))
        } else if (operation === 'max') {
          const cmp_i = max(...f.operands.slice(0, i))
          out = threshold(op_i, cmp_i, ddx(op_i, binding, x), out)
        }
      }
      return out
    }
    case 'threshold': {
      const [value, thr, pass, fail] = f.operands
      if (!zero_deriv(value, binding, x) || !zero_deriv(thr, binding, x))
        throw new Error(
          `[${operation}] node must branch on constant inputs. ${f}`
        )
      return threshold(value, thr, ddx(pass, binding, x), ddx(fail, binding, x))
    }
    default:
      assertUnreachable(operation)
  }
}
