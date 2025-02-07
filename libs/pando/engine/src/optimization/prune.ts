import type { AnyNode, NumNode, OP as TaggedOP } from '../node'
import { calculation, constant, mapBottomUp, max, min, traverse } from '../node'
import { assertUnreachable } from '../util'
import { combineConst } from './simplify'
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>
const { arithmetic } = calculation

type BuildComponent = Record<string, number>
type Builds = BuildComponent[][]
type Tonicity = { inc: boolean; dec: boolean }
type Range = { min: number; max: number }

type Ranges = Map<AnyNode<OP>, Range>
type Tonicities = Map<string, Tonicity>

export type CustomInfo = {
  range: (r: Range[]) => Range
  tonicity: (r: Range[]) => Tonicity[]
}
export const customInfo: Record<string, CustomInfo> = {}

export function prune<I extends OP>(
  nodes: NumNode<I>[],
  builds: Builds,
  cat: string,
  _minimum: number[],
  _keepTop: number
): { nodes: NumNode<I>[]; builds: Builds } {
  // TODO: add more optimization routines
  nodes = pruneNodeRange(nodes, getRanges(nodes, cat, builds))
  nodes = combineConst(nodes)
  return { nodes, builds }
}

function pruneNodeRange<I extends OP>(
  n: NumNode<I>[],
  ranges: Ranges
): NumNode<I>[] {
  return mapBottomUp(n, (n, old) => {
    {
      const { min, max } = ranges.get(old)!
      if (min === max) return n.op === 'const' ? n : constant(min)
    }
    switch (n.op) {
      case 'thres': {
        const [value, threshold] = old.br.map((n) => ranges.get(n)!)
        if (value.min >= threshold.max) return n.x[0]
        else if (value.max < threshold.min) return n.x[1]
        const [ge, lt] = old.x.map((n) => ranges.get(n)!)
        if (ge.max === lt.min && lt.max === ge.min && isFinite(ge.min))
          return constant(ge.max)
        break
      }
      case 'min': {
        const threshold = ranges.get(old)!.max
        const x = old.x.filter((n) => ranges.get(n)!.min <= threshold)
        if (x.length != n.x.length)
          return min(...(x as NumNode<I>[])) as NumNode<I>
        break
      }
      case 'max': {
        const threshold = ranges.get(old)!.min
        const x = old.x.filter((n) => ranges.get(n)!.max >= threshold)
        if (x.length != n.x.length)
          return max(...(x as NumNode<I>[])) as NumNode<I>
        break
      }
    }
    return n
  })
}

function getRanges(n: AnyNode<OP>[], cat: string, builds: Builds): Ranges {
  const result = new Map<AnyNode<OP>, Range>()
  traverse(n, (n, visit) => {
    n.x.forEach(visit)
    n.br.forEach(visit)
    const ranges = n.x.map((n) => result.get(n)!)
    const mins = ranges.map((r) => r.min)
    const maxs = ranges.map((r) => r.max)

    function cornerRange(
      op: keyof typeof arithmetic,
      [x0, x1]: [Range, Range]
    ): Range {
      const calc = arithmetic[op]
      const vals = [
        calc([x0.min, x1.min], undefined),
        calc([x0.min, x1.max], undefined),
        calc([x0.max, x1.min], undefined),
        calc([x0.max, x1.max], undefined),
      ]
      return { min: Math.min(...vals), max: Math.max(...vals) }
    }

    let r = { min: NaN, max: NaN }
    switch (n.op) {
      case 'const':
        if (typeof n.ex === 'number') r.min = r.max = n.ex
        break
      case 'subscript':
        r.min = Math.min(...(n.ex as number[]))
        r.max = Math.max(...(n.ex as number[]))
        break
      case 'sum':
        r.min = mins.reduce((a, b) => a + b, 0)
        r.max = maxs.reduce((a, b) => a + b, 0)
        break
      case 'prod':
        r = { min: 1, max: 1 }
        r = ranges.reduce((r, xr) => cornerRange(n.op, [r, xr]), r)
        break
      case 'min':
      case 'max':
        r = { min: Math[n.op](...mins), max: Math[n.op](...maxs) }
        break
      case 'match':
      case 'thres':
      case 'lookup':
        r = { min: Math.min(...mins), max: Math.max(...maxs) }
        break
      case 'custom':
        r = customInfo[n.ex]!.range(ranges)
        break
      case 'sumfrac':
        // If `x + c` touches 0, the sum-frac is degenerate
        if (mins[0] + mins[1] > 0 || maxs[0] + maxs[1] < 0)
          r = cornerRange(n.op, ranges as [Range, Range])
        break
      case 'read': {
        r.min = r.max = 0
        const key = n.tag[cat]!
        for (const candidates of builds) {
          const subr = { min: Infinity, max: -Infinity }
          for (const { [key]: val = 0 } of candidates) {
            if (val < subr.min) subr.min = val
            if (val > subr.max) subr.max = val
          }
          r.min += subr.min
          r.max += subr.max
        }
        break
      }
      default:
        assertUnreachable(n)
    }
  })
  return result
}

function _getTonicities(
  n: NumNode<OP>[],
  cat: string,
  ranges: Ranges
): Tonicities {
  const t = new Map<AnyNode<OP>, Tonicity>()
  const marked: { node: AnyNode<OP>; inc: boolean }[] = []
  const result = new Map<string, Tonicity>()

  function mark(node: AnyNode<OP>, inc: boolean) {
    if (!t.has(node)) t.set(node, { inc: false, dec: false })
    const ton = t.get(node)!
    if (inc) {
      if (!ton.inc) {
        ton.inc = true
        marked.push({ node, inc })
      }
    } else {
      if (!ton.dec) {
        ton.dec = true
        marked.push({ node, inc })
      }
    }
  }

  // Cannot use `traverse` because each node is visited twice, once for `inc` and once for `dec`
  n.forEach((n) => mark(n, true))
  while (marked.length) {
    const { node, inc } = marked.pop()!
    switch (node.op) {
      case 'read':
        result.set(node.tag[cat]!, t.get(node)!)
        break
      case 'const':
      case 'subscript':
        break
      case 'sum':
      case 'min':
      case 'max':
        node.x.forEach((n) => mark(n, inc))
        break
      case 'match':
        node.x.forEach((n) => mark(n, inc))
        node.br.forEach((n) => mark(n, true))
        node.br.forEach((n) => mark(n, false))
        break
      case 'thres': {
        node.x.forEach((n) => mark(n, inc))
        const ge = ranges.get(node.x[0])!
        const lt = ranges.get(node.x[1])!
        // if `br` is not marked, both branches are equal
        if (ge.max > lt.min) {
          mark(node.br[0], inc)
          mark(node.br[1], !inc)
        }
        if (ge.min < lt.max) {
          mark(node.br[0], !inc)
          mark(node.br[1], inc)
        }
        break
      }
      case 'sumfrac': {
        const [x, c] = node.x.map((n) => ranges.get(n)!)
        // if `x` is not marked, `c == 0` and `node == 1`
        if (c.min < 0) mark(node.x[0], !inc)
        if (c.max > 0) mark(node.x[0], inc)
        // if `c` is not marked, `x == 0` and `node == 0`
        if (x.min < 0) mark(node.x[1], inc)
        if (x.max > 0) mark(node.x[1], !inc)
        break
      }
      case 'lookup':
        node.x.forEach((n) => mark(n, inc))
        node.br.forEach((n) => mark(n, true))
        node.br.forEach((n) => mark(n, false))
        break
      case 'prod': {
        const r = ranges.get(node)!
        if (r.min < 0 && r.max > 0) {
          // unsupported zero-crossing
          node.x.forEach((n) => mark(n, true))
          node.x.forEach((n) => mark(n, false))
        } else {
          const pos = r.min >= 0
          const neg = r.max <= 0
          node.x.forEach((n) => {
            const nr = ranges.get(n)!
            const npos = nr.min >= 0
            const nneg = nr.max <= 0
            if ((pos && npos) || (neg && nneg)) mark(n, inc)
            if ((pos && nneg) || (neg && npos)) mark(n, !inc)
          })
        }
        break
      }
      case 'custom':
        customInfo[node.ex]
          .tonicity(node.x.map((n) => ranges.get(n)!))
          .forEach((t, i) => {
            if (t.inc) mark(node.x[i], inc)
            if (t.dec) mark(node.x[i], !inc)
          })
        break
      default:
        assertUnreachable(node)
    }
  }
  return result
}
