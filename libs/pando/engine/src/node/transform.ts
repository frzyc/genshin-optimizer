import { type DedupTag, DedupTags, type Tag } from '../tag'
import { assertUnreachable, customOps } from '../util'
import type { Calculator } from './calc'
import { constant, read } from './construction'
import { arithmetic, branching } from './formula'
import type {
  AnyNode,
  BaseRead,
  Const,
  NumNode,
  StrNode,
  OP as TaggedOP,
} from './type'

/**
 * Most of functions here cache the calculation/traversal, and will skip any nodes
 * that they visit more than once. This caching will not work on nodes containing
 * `Tag`-related nodes. So they are disallowed by default here, as reflected in
 * this `OP` redeclaration.
 */
type OP = Exclude<TaggedOP, 'tag' | 'dtag' | 'vtag'>
export type NumTagFree = NumNode<OP>
export type StrTagFree = StrNode<OP>
export type AnyTagFree = AnyNode<OP>

/**
 * Apply all tag-related nodes from `n` calculation and replace `Read` nodes where
 * `dynTag(tag)` is not truthy. The replaced `Read` nodes are not evaluated further.
 *
 * The resulting nodes becomes "Tag"-free and can be evaluated without the need for
 * a calculator, given appropriate values for the replaced `Read` nodes.
 */
export function detach(
  n: NumNode[],
  calc: Calculator,
  dynTag: (_: Tag) => Tag | undefined
): NumTagFree[]
export function detach(
  n: StrNode[],
  calc: Calculator,
  dynTag: (_: Tag) => Tag | undefined
): StrTagFree[]
export function detach(
  n: AnyNode[],
  calc: Calculator,
  dynTag: (_: Tag) => Tag | undefined
): AnyTagFree[]
export function detach(
  n: AnyNode[],
  calc: Calculator,
  dynTag: (_: Tag) => Tag | undefined
): AnyTagFree[] {
  type Cache = DedupTag<AnyTagFree[]>
  function detachRead(cache: Cache, ex: BaseRead['ex']): AnyTagFree[] {
    if (cache.val) return cache.val
    const dyn = dynTag(cache.tag)
    cache.val = dyn
      ? [read(dyn, ex)]
      : calc.nodes.subset(cache.id).flatMap((n) => {
          return n.op !== 'reread'
            ? map(n, cache)
            : detachRead(cache.with(n.tag), ex)
        })
    return cache.val
  }
  function fold(
    x: NumTagFree[],
    op: Exclude<keyof typeof arithmetic, 'unique'>,
    ex: any
  ): NumTagFree {
    if (x.every((x) => x.op === 'const'))
      return constant(
        arithmetic[op](
          x.map((x) => x.ex),
          ex
        )
      )
    return { op, x, br: [] }
  }

  function map(n: NumNode, cache: Cache): NumTagFree
  function map(n: StrNode, cache: Cache): StrTagFree
  function map(n: AnyNode, cache: Cache): AnyTagFree
  function map(n: AnyNode, cache: Cache): AnyTagFree {
    const { op } = n
    switch (op) {
      case 'const':
        return n
      case 'read': {
        const newCache = cache.with(n.tag)
        const ex = n.ex ?? calc.defaultAccu(newCache.tag) ?? 'unique'
        const x = detachRead(newCache, ex)
        if (ex === 'unique') return x[0] ?? constant(undefined as any)
        return fold(x as NumTagFree[], ex, n.ex)
      }
      case 'sum':
      case 'prod':
      case 'min':
      case 'max':
      case 'sumfrac': {
        const x = n.x.map((x) => map(x, cache))
        return fold(x, op, n.ex)
      }
      case 'thres':
      case 'match':
      case 'lookup': {
        // We don't eagerly fold `x`. If all `br` can be folded,
        // we can short-circuit and fold only the chosen branch.
        const br = n.br.map((br) =>
          map(br, cache)
        ) as unknown as Const<string>[]
        if (br.every((n) => n.op === 'const')) {
          const branchID = branching[n.op](
            br.map((br) => br.ex),
            n.ex
          )
          return map(n.x[branchID]!, cache)
        }
        return { ...n, x: n.x.map((x) => map(x, cache)), br } as AnyTagFree
      }
      case 'subscript': {
        const index = map(n.br[0]!, cache)
        if (index.op === 'const') return constant(n.ex[index.ex]!)
        return { ...n, br: [index] }
      }
      case 'vtag':
        return constant(cache.tag[n.ex] ?? '')
      case 'tag':
        return map(n.x[0]!, cache.with(n.tag))
      case 'dtag': {
        const tags = n.br.map((br) => map(br, cache)) as Const<string>[]
        if (tags.some((x) => x.op !== 'const'))
          throw new Error('Dynamic tag must be resolvable during detachment')
        const newCache = cache.with(
          Object.fromEntries(tags.map((tag, i) => [n.ex[i], tag.ex]))
        )
        return map(n.x[0]!, newCache)
      }
      case 'custom':
        return { ...n, x: n.x.map((x) => map(x, cache)) }
      default:
        assertUnreachable(op)
    }
  }
  return n.map((n) => map(n, new DedupTags(calc.cache.keys).at({})))
}

export function mapBottomUp<I extends OP, O extends OP>(
  n: NumNode<I>[],
  map: (_: AnyNode<I>, old: AnyNode<I>) => AnyNode<O>
): NumNode<O>[]
export function mapBottomUp<I extends OP, O extends OP>(
  n: StrNode<I>[],
  map: (_: AnyNode<I>, old: AnyNode<I>) => AnyNode<O>
): StrNode<O>[]
export function mapBottomUp<I extends OP, O extends OP>(
  n: AnyNode<I>[],
  map: (_: AnyNode<I>, old: AnyNode<I>) => AnyNode<O>
): AnyNode<O>[]
export function mapBottomUp<I extends OP, O extends OP>(
  n: AnyNode<I>[],
  map: (_: AnyNode<I>, old: AnyNode<I>) => AnyNode<O>
): AnyNode<O>[] {
  const cache = new Map<AnyNode<I>, AnyNode<O>>()

  function internal(n: AnyNode<I>): AnyNode<O> {
    const old = cache.get(n)
    if (old) return old

    const prev = n
    const x = dedupMapArray(n.x, internal)
    const br = dedupMapArray(n.br, internal)
    if (n.x !== x || n.br !== br) n = { ...n, x, br } as any

    const result = map(n, prev)
    cache.set(n, result)
    return result
  }
  return dedupMapArray(n, internal)
}

export function map<I extends TaggedOP, O>(
  n: AnyNode<I>[],
  map: (n: AnyNode<I>, map: (n: AnyNode<I>) => O) => O
): O[] {
  const cache = new Map<AnyNode<I>, O>()

  function internal(n: AnyNode<I>): O {
    const old = cache.get(n)
    if (old) return old

    const result = map(n, internal)
    cache.set(n, result)
    return result
  }

  return dedupMapArray(n, internal)
}

export function traverse<P extends TaggedOP>(
  n: AnyNode<P>[],
  visit: (n: AnyNode<P>, visit: (n: AnyNode<P>) => void) => void
) {
  const visited = new Set<AnyNode<P>>()

  function internal(n: AnyNode<P>) {
    if (visited.has(n)) return
    visit(n, internal)
    visited.add(n)
  }
  n.forEach(internal)
}

function dedupMapArray<I, O>(x: I[], map: (_: I) => O): O[] {
  const newX = x.map(map)
  return x.every((x, i) => (x as any) === newX[i]) ? (x as any) : newX
}

/**
 * Generates a custom function, "cuz speed".
 *
 * @param n
 * @param dynTagCat
 * @param slotCount
 * @param initial
 * @param header
 * @returns a custom function that accepts an array `_` of data.
 *
 * NOTE: `slotCount` === `_.length` for optimization reasons.
 */
export function compile(
  n: NumTagFree[],
  dynTagCat: string,
  slotCount: number
): (_: Record<string, number>[]) => number[]
export function compile(
  n: StrTagFree[],
  dynTagCat: string,
  slotCount: number
): (_: Record<string, string>[]) => string[]
export function compile(
  n: AnyTagFree[],
  dynTagCat: string,
  slotCount: number
): (_: Record<string, any>[]) => any[]
export function compile(
  n: AnyTagFree[],
  dynTagCat: string,
  slotCount: number
): (_: Record<string, any>[]) => any[] {
  const { str, names } = executionStr(n, 'x', ({ tag }) => {
    const arr = [...new Array(slotCount)].map(
      (_, i) => `(b[${i}]['${tag[dynTagCat]}']??0)`
    )
    return `+(${arr.join('+')}+0)`
  })
  const results = n.map((n) => names.get(n)!)
  const body = `'use strict';const ${str};return[${results}]`
  return new Function(`b`, body) as any
}

export function compileDiff(
  n: AnyTagFree,
  dynTagCat: string,
  diffTags: string[],
  slotCount: number
): (_: Record<string, any>[]) => any[] {
  const { str, names } = executionStr([n], 'x', ({ tag }) => {
    const arr = [...new Array(slotCount)].map(
      (_, i) => `(b[${i}]['${tag[dynTagCat]}']??0)`
    )
    return `+(${arr.join('+')}+0)`
  })
  let body = `'use strict';const ${str}`
  for (const [name, f] of Object.entries(customOps))
    body += `,g${name}=${f.diff?.toString()}`
  body += `,d=(t)=>{const _=0`
  const discrete = new Set<string>() // values that must be discrete
  traverse([n], (n, visit) => {
    const { op } = n
    n.x.forEach(visit)
    n.br.forEach(visit)
    const x = n.x.map((x) => names.get(x)!)
    const br = n.br.map((n) => names.get(n)!)
    const dx = x.map((x) => `d${x}`)
    const out = names.get(n)
    const dout = `d${out}`

    switch (op) {
      case 'const':
        body += `,${dout}=0`
        break
      case 'sum':
        body += `,${dout}=`
        if (dx.length) body += dx.join('+')
        else body += 0
        break
      case 'prod':
        body += `,_0${out}=1`
        x.forEach((x, i) => (body += `,_${i + 1}${out}=_${i}${out}*${x}`))
        body += `,${dout}=`
        // _{i}{out} = prefix product upto (but excluding) x[i]
        // a_{i+1} = d/dx _{i+1}{out} = (d/dx _{i}{out}) * x[i] + dx[i] * _{i}{out}
        body += dx.reduce((a, dx, i) => `(${a}*${x[i]}+${dx}*_${i}${out})`, '0')
        break
      case 'min':
      case 'max':
        body += `,${dout}=[${dx}][[${x}].indexOf(${out})]`
        break
      case 'sumfrac':
        // d/dx x/(x+c) = c/(x+c)^2, d/dc x/(x+c) = -x/(x+c)^2
        body += `,_${dout}=${x[0]}+${x[1]}` // x + c
        body += `,${dout}=(${x[1]}*${dx[0]}-${x[0]}*${dx[1]})/_${dout}/_${dout}`
        break
      case 'match':
        body += `,${dout}=${br[0]}===${br[1]}?${dx[0]}:${dx[1]}`
        discrete.add(br[0])
        discrete.add(br[1])
        break
      case 'thres':
        body += `,${dout}=${br[0]}>=${br[1]}?${dx[0]}:${dx[1]}`
        discrete.add(br[0])
        discrete.add(br[1])
        break
      case 'read':
        body += `,${dout}='${n.tag[dynTagCat]!}'===t?1:0`
        break
      case 'subscript':
        body += `,${dout}=0`
        discrete.add(br[0])
        break
      case 'custom':
        body += `,${dout}=g${n.ex}([${x}],[${dx}])`
        break
      case 'lookup':
        // `JSON.stringify` on `Record<string, number>`
        body += `,${dout}=([${dx}])[(${JSON.stringify(n.ex)})[${br[0]}]??0]`
        discrete.add(br[0])
        break
      default:
        assertUnreachable(op)
    }
  })
  if (discrete.size) {
    body += `;if (${[...discrete].map((out) => `d${out}`).join('||')})`
    body += `throw new Error(\`'\${t}' must be discrete\`)`
  }
  body += `;return d${names.get(n)}}`
  body += `;return[${diffTags.map((t) => `d('${t}')`)}]`
  return new Function(`b`, body) as any
}

/**
 * Returns a JS code that represents computation of `n`. The value of each
 * node `n` is written to a variable with the name `names.get(n)`. Variables
 * prefixed with `prefix`, and read nodes are computed using `readStr`.
 */
export function executionStr(
  n: AnyTagFree[],
  prefix: string,
  readStr: (_: BaseRead) => string
): { str: string; names: Map<AnyTagFree, string> } {
  let body = `${prefix}=undefined`
  for (const [name, f] of Object.entries(customOps))
    body += `,${prefix}_${name}=${f.calc.toString()}`
  const names = new Map<AnyTagFree, string>()
  traverse(n, (n, visit) => {
    const { op } = n
    n.x.forEach(visit)
    n.br.forEach(visit)
    const x = n.x.map((x) => names.get(x)!)
    const br = n.br.map((n) => names.get(n)!)
    const out = `${prefix}${names.size}`
    names.set(n, out)
    body += `,${out}=`

    switch (op) {
      case 'const':
        // TODO: handle cases when `n.ex` contains escaped characters
        body += typeof n.ex !== 'string' ? n.ex : `'${n.ex}'`
        break
      case 'sum':
      case 'prod':
        if (x.length) body += x.join(op == 'sum' ? '+' : '*')
        else body += op == 'sum' ? 0 : 1
        break
      case 'min':
      case 'max':
        body += `Math.${op}(${x})`
        break
      case 'sumfrac':
        body += `${x[0]}/(${x[0]}+${x[1]})`
        break
      case 'match':
        body += `${br[0]}===${br[1]}?${x[0]}:${x[1]}`
        break
      case 'thres':
        body += `${br[0]}>=${br[1]}?${x[0]}:${x[1]}`
        break
      case 'read': {
        body += `(${readStr(n)})`
        break
      }
      case 'subscript':
        // `JSON.stringify` on `number[] | string[]`
        body += `${JSON.stringify(n.ex)}[${br[0]}]`
        break
      case 'custom':
        body += `${prefix}_${n.ex}([${x}])`
        break
      case 'lookup':
        // `JSON.stringify` on `Record<string, number>`
        body += `([${x}])[(${JSON.stringify(n.ex)})[${br[0]}]??0]`
        break
      default:
        assertUnreachable(op)
    }
  })
  return { str: body, names }
}
