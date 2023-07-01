import type { Tag, TagMapSubsetCache } from '../tag'
import { assertUnreachable } from '../util'
import type { Calculator } from './calc'
import { constant, read } from './construction'
import { arithmetic, branching } from './formula'
import type { AnyNode, Const, NumNode, OP, ReRead, Read, StrNode } from './type'

type NumTagFree = NumNode<Exclude<OP, 'tag' | 'dtag' | 'vtag'>>
type StrTagFree = StrNode<Exclude<OP, 'tag' | 'dtag' | 'vtag'>>
type AnyTagFree = AnyNode<Exclude<OP, 'tag' | 'dtag' | 'vtag'>>

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
  function detachRead(
    cache: TagMapSubsetCache<AnyNode | ReRead>,
    accu: Read['accu'],
    dynNodes: Read[]
  ): AnyTagFree[] {
    const dyn = dynTag(cache.tag)
    if (dyn) dynNodes.push(read(dyn, accu))
    return cache.subset().flatMap((n) => {
      return n.op !== 'reread'
        ? map(n, cache)
        : detachRead(cache.with(n.tag), accu, dynNodes)
    })
  }
  function fold(
    x: NumTagFree[],
    accu: keyof typeof arithmetic,
    ex: any
  ): NumTagFree {
    if (x.every((x) => x.op === 'const'))
      return constant(
        arithmetic[accu](
          x.map((x) => x.ex),
          ex
        )
      )
    return { op: accu, x, br: [] }
  }

  type Cache = TagMapSubsetCache<AnyNode | ReRead>
  function map(n: NumNode, cache: Cache): NumTagFree
  function map(n: StrNode, cache: Cache): StrTagFree
  function map(n: AnyNode, cache: Cache): AnyTagFree
  function map(n: AnyNode, cache: Cache): AnyTagFree {
    const { op } = n
    switch (op) {
      case 'const':
        return n
      case 'read': {
        const dyn: Read[] = []
        const x = detachRead(cache.with(n.tag), n.accu, dyn)
        x.push(...dyn)
        if (n.accu === undefined) return x[0] ?? constant(undefined as any)
        return fold(x as NumTagFree[], n.accu, n.ex)
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

  const cache = calc.nodes.cache(calc.keys)
  return n.map((n) => map(n, cache))
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
          const mergedConst =
            constX.length > 1
              ? [
                  constant(
                    arithmetic[op](
                      constX.map((n) => n.ex),
                      n.ex
                    )
                  ),
                ]
              : constX
          x = [...mergedConst, ...sameX.flatMap((x) => x.x), ...remaining]
        }
        if (x.length === 1) return x[0] as AnyTagFree
        if (!x.length) return constant(arithmetic[op]([], n.ex))
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

    // If they are the same, we can save memory
    let result = map(n, internal)
    if (
      result.op === n.op &&
      result.ex === n.ex &&
      result.tag === n.tag &&
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
  header?: string
): (_: Record<string, number>[]) => number[]
export function compile(
  n: StrTagFree[],
  dynTagCategory: string,
  slotCount: number,
  initial: Record<string, string>,
  header?: string
): (_: Record<string, string>[]) => string[]
export function compile(
  n: AnyTagFree[],
  dynTagCategory: string,
  slotCount: number,
  initial: Record<string, any>,
  header?: string
): (_: Record<string, any>[]) => any[]
export function compile(
  n: AnyTagFree[],
  dynTagCategory: string,
  slotCount: number,
  initial: Record<string, any>,
  header = ''
): (_: Record<string, any>[]) => any[] {
  let i = 1,
    body = `'use strict';` + header + ';const x0=0' // making sure `const` has at least one entry
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
        body += `,${name}=`
        if (argNames.length) body += argNames.join(op == 'sum' ? '+' : '*')
        else body += op == 'sum' ? 0 : 1
        break
      case 'min':
      case 'max':
        body += `,${name}=Math.${op}(${argNames})`
        break
      case 'sumfrac':
        body += `,${name}=${argNames[0]}/(${argNames[0]} + ${argNames[1]})`
        break
      case 'match':
        body += `,${name}=${brNames[0]}===${brNames[1]}?${argNames[0]}:${argNames[1]}`
        break
      case 'thres':
        body += `,${name}=${brNames[0]}>=${brNames[1]}?${argNames[0]}:${argNames[1]}`
        break
      case 'lookup':
        throw new Error(`Unsupported operation: ${op}`) // TODO
      case 'subscript':
        body += `,${name}=[${n.ex}][${brNames[0]}]`
        break
      case 'read': {
        const key = n.tag[dynTagCategory]!
        let arr = [...new Array(slotCount)].map(
          (_, i) => `(b[${i}]['${key}'] ?? 0)`
        )
        if (initial[key]) arr = [initial[key]!.toString(), ...arr]
        body += `,${name}=${arr.join('+')}`
        break
      }
      case 'custom': {
        body += `,${name}=${n.ex}(${argNames})`
        break
      }
      default:
        assertUnreachable(op)
    }
  })
  body += `;return [${n.map((n) => names.get(n)!)}]`
  return new (Function as any)(`b`, body)
}
