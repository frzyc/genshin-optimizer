import type { TagMapSubsetCache, TagMapSubsetValues } from '../tag'
import { assertUnreachable } from '../util'
import type { Calculator } from './calc'
import { constant } from './construction'
import { arithmetic, branching } from './formula'
import type {
  AnyNode,
  AnyOP,
  Const,
  NumNode,
  OP,
  Read,
  ReRead,
  StrNode,
} from './type'

type NumTagFree = NumNode<Exclude<OP, 'tag' | 'dtag' | 'vtag'>>
type StrTagFree = StrNode<Exclude<OP, 'tag' | 'dtag' | 'vtag'>>
type AnyTagFree = AnyNode<Exclude<OP, 'tag' | 'dtag' | 'vtag'>>

export function detach(
  n: NumNode[],
  calc: Calculator,
  dynTags: TagMapSubsetValues<Read>
): NumTagFree[]
export function detach(
  n: StrNode[],
  calc: Calculator,
  dynTags: TagMapSubsetValues<Read>
): StrTagFree[]
export function detach(
  n: AnyNode[],
  calc: Calculator,
  dynTags: TagMapSubsetValues<Read>
): AnyTagFree[]
export function detach(
  n: AnyNode[],
  calc: Calculator,
  dynTags: TagMapSubsetValues<Read>
): AnyTagFree[] {
  const allDynTags = new Set(dynTags.allValues())

  function read(cache: TagMapSubsetCache<AnyNode | ReRead>): AnyTagFree[] {
    return [
      ...cache.subset().flatMap((n) => {
        if (n.op !== 'reread') return map(n, cache)
        cache = cache.with(n.tag)
        return read(cache).map((x) => map(x, cache))
      }),
      ...dynTags.subset(cache.id),
    ]
  }

  function map(
    n: NumNode,
    cache: TagMapSubsetCache<AnyNode | ReRead>
  ): NumTagFree
  function map(
    n: StrNode,
    cache: TagMapSubsetCache<AnyNode | ReRead>
  ): StrTagFree
  function map(
    n: AnyNode,
    cache: TagMapSubsetCache<AnyNode | ReRead>
  ): AnyTagFree
  function map(
    n: AnyNode,
    cache: TagMapSubsetCache<AnyNode | ReRead>
  ): AnyTagFree {
    if (allDynTags.has(n as Read)) return n as Read

    if (n.op === 'read') {
      const x = read(cache.with(n.tag))
      if (n.accu === undefined) return x[0] ?? constant(undefined as any)
      n = { op: n.accu, x: x as NumTagFree[], br: [] } as AnyNode<
        Exclude<AnyOP, 'read'>
      >
    }

    const { op } = n
    switch (op) {
      case 'const':
      case 'read':
        return n
      case 'sum':
      case 'prod':
      case 'min':
      case 'max':
      case 'sumfrac': {
        const x = n.x.map((x) => map(x, cache)) as Const<number>[]
        if (x.every((x) => x.op === 'const'))
          return constant(
            arithmetic[n.op](
              x.map((x) => x.ex),
              n.ex
            )
          )
        return { ...n, x }
      }
      case 'thres':
      case 'match':
      case 'lookup': {
        // We don't eagerly fold `x`. If all `br` can be folded,
        // we can short-circuit and fold only the chosen branch.
        const br = n.br.map((br) => map(br, cache)) as Const<string>[]
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
        cache = cache.with(
          Object.fromEntries(tags.map((tag, i) => [n.ex[i], tag.ex]))
        )
        return map(n.x[0]!, cache)
      }
      default:
        assertUnreachable(op)
    }
  }

  return n.map((n) => map(n, calc.nodes.cache(calc.keys)))
}

export function flatten(n: NumTagFree[]): NumTagFree[]
export function flatten(n: StrTagFree[]): StrTagFree[]
export function flatten(n: AnyTagFree[]): AnyTagFree[]
export function flatten(n: AnyTagFree[]): AnyTagFree[] {
  return transform(n, (n, map) => {
    const { op } = n
    let x = n.x.map(map) as NumTagFree[]
    switch (op) {
      case 'sum':
      case 'prod':
      case 'min':
      case 'max': {
        const constX = x.filter((x) => x.op === 'const') as Const<number>[]
        const sameX = x.filter((x) => x.op === op)
        const remaining = x.filter((x) => x.op !== 'const' && x.op !== op)
        if (constX.length > 1 || sameX.length > 0) {
          // We can either flatten constant values or nested nodes, so we try both
          const mergedConst = constX.length
            ? [
                constant(
                  arithmetic[op](
                    constX.map((n) => n.ex),
                    n.ex
                  )
                ),
              ]
            : []
          x = [...mergedConst, ...sameX.flatMap((x) => x.x), ...remaining]
        }
      }
    }
    return { ...n, x, br: n.br.map(map) } as AnyTagFree
  })
}

export function transform<I extends OP, O extends OP>(
  n: NumNode<I>[],
  map: (n: AnyNode<I>, map: (n: AnyNode<I>) => AnyNode<O>) => AnyNode<O>
): NumNode<O>[]
export function transform<I extends OP, O extends OP>(
  n: StrNode<I>[],
  map: (n: AnyNode<I>, map: (n: AnyNode<I>) => AnyNode<O>) => AnyNode<O>
): StrNode<O>[]
export function transform<I extends OP, O extends OP>(
  n: AnyNode<I>[],
  map: (n: AnyNode<I>, map: (n: AnyNode<I>) => AnyNode<O>) => AnyNode<O>
): AnyNode<O>[]
export function transform<I extends OP, O extends OP>(
  n: AnyNode<I>[],
  map: (n: AnyNode<I>, map: (n: AnyNode<I>) => AnyNode<O>) => AnyNode<O>
): AnyNode<O>[] {
  const cache = new Map<AnyNode<I>, AnyNode<O>>()

  function internal(n: AnyNode<I>): AnyNode<O> {
    const old = cache.get(n)
    if (old) return old

    // If they are the same, we can save on memory
    let result = map(n, internal)
    if (
      result.op === n.op &&
      result.ex === n.ex &&
      (result.x === n.x ||
        (result.x.length === n.x.length &&
          result.x.every((x, i) => n.x[i] === x))) &&
      (result.br === n.br ||
        (result.br.length === n.br.length &&
          result.br.every((br, i) => n.br[i] === br)))
    )
      result = n as AnyNode<O>

    cache.set(n, result)
    return result
  }

  const result = n.map(internal)
  return result.every((result, i) => n[i] === result)
    ? (n as AnyNode<O>[])
    : result
}

export function traverse<P extends OP>(
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

export function compile(
  n: NumTagFree[],
  dynTagCategory: string,
  slotCount: number,
  initial: Record<string, number>,
  defaultValue: number
): (_: Record<string, number>[]) => number[]
export function compile(
  n: StrTagFree[],
  dynTagCategory: string,
  slotCount: number,
  initial: Record<string, string>,
  defaultValue: string
): (_: Record<string, string>[]) => string[]
export function compile(
  n: AnyTagFree[],
  dynTagCategory: string,
  slotCount: number,
  initial: Record<string, any>,
  defaultValue: any
): (_: Record<string, any>[]) => any[]
export function compile(
  n: AnyTagFree[],
  dynTagCategory: string,
  slotCount: number,
  initial: Record<string, any>,
  defaultValue: any
): (_: Record<string, any>[]) => any[] {
  let i = 1,
    body = `'use strict'; const x0=0` // making sure `const` has at least one entry
  const names = new Map<AnyNode, string>()
  traverse(n, (n, visit) => {
    const name = `x${i++}`
    names.set(n, name)

    const { op, x, br } = n
    x.forEach(visit)
    br.forEach(visit)
    const argNames = x.map((x) => names.get(x)!),
      brNames = br.map((n) => names.get(n)!)

    switch (op) {
      case 'const':
        names.set(n, `(${n.ex})`)
        break
      case 'sum':
      case 'prod':
        body += `,${name}=${argNames.join(op == 'sum' ? '+' : '*')}`
        break
      case 'min':
      case 'max':
        body += `,${name}=Math.${op}(${argNames})`
        break
      case 'sumfrac':
        body += `,${name}=${argNames[0]}/(${argNames[0]} + ${argNames[1]})`
        break
      case 'match':
        body += `,${name}=${brNames[0]}>=${brNames[1]}?${argNames[0]}:${argNames[1]}`
        break
      case 'thres':
        body += `,${name}=${brNames[0]}===${brNames[1]}?${argNames[0]}:${argNames[1]}`
        break
      case 'lookup':
        throw new Error(`Unsupported operation: ${op}`) // TODO
      case 'subscript':
        body += `,${name}=[${n.ex}][${argNames[0]}]`
        break
      case 'read': {
        const key = n.tag[dynTagCategory]!
        let arr = [...new Array(slotCount)].map(
          (_, i) => `(b[${i}].values['${key}'] ?? ${defaultValue})`
        )
        if (initial[key]) arr = [initial[key]!.toString(), ...arr]
        body += `,${name}=${arr.join('+')}`
        break
      }
      default:
        assertUnreachable(op)
    }
  })
  body += `;return [${n.map((n) => names.get(n)!)}]`
  return new (Function as any)(`b`, body)
}
