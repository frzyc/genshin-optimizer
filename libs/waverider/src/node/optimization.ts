import type { Tag, TagMap } from '../tag'
import { assertUnreachable } from '../util'
import type { Calculator } from './calc'
import { constant, max, min, prod, sum } from './construction'
import { arithmetic, selectBranch } from './formula'
import type { AnyNode, Const, NumNode, OP, Read, StrNode } from './type'

type NumTagFree = NumNode<Exclude<OP, 'tag'>>
type StrTagFree = StrNode<Exclude<OP, 'tag'>>
type AnyTagFree = AnyNode<Exclude<OP, 'tag'>>

export function detach(n: NumNode[], calc: Calculator, dynTags: TagMap<Read>): NumTagFree[]
export function detach(n: StrNode[], calc: Calculator, dynTags: TagMap<Read>): StrTagFree[]
export function detach(n: AnyNode[], calc: Calculator, dynTags: TagMap<Read>): AnyTagFree[]
export function detach(n: AnyNode[], calc: Calculator, dynTags: TagMap<Read>): AnyTagFree[] {
  const allDynTags = new Set(dynTags.superset({}))

  function read(tag: Tag): AnyTagFree[] {
    return [...calc.nodes.subset(tag).flatMap(n => {
      if (n.op === 'reread') {
        const newTag = { ...tag, ...n.tag }
        return read(newTag).map(x => map(x, newTag))
      }
      return [map(n, tag)]
    }),
    ...dynTags.subset(tag)
    ]
  }
  function map(n: AnyNode, tag: Tag | undefined): AnyTagFree {
    if (allDynTags.has(n as Read)) return n as Read

    switch (n.op) {
      case 'read': {
        const readTag = { ...tag, ...n.tag }
        // Strictly speaking, `x`s are not `NumNode` yet, but it's easier to handle `accu` this way
        const x = read(readTag) as NumNode<Exclude<OP, 'tag'>>[]
        switch (n.accu) {
          case 'sum': return sum(...x) as AnyTagFree
          case 'prod': return prod(...x) as AnyTagFree
          case 'min': return min(...x) as AnyTagFree
          case 'max': return max(...x) as AnyTagFree
          case undefined: return x[0] ?? constant(undefined as any) as AnyTagFree
          default: assertUnreachable(n.accu)
        }
      }
      case 'tag': return map(n.x[0]!, { ...tag, ...n.tag })
    }
    let x = n.x.map(n => map(n, tag))
    let br = n.br.map(n => map(n, tag))
    if (x.every((x, i) => x === n.x[i])) x = n.x as AnyTagFree[]
    if (br.every((br, i) => br === n.br[i])) br = n.br as AnyTagFree[]

    return (x !== n.x || br != n.br) ? { ...n, x, br } as any : n
  }

  return n.map(n => map(n, undefined))
}

export function constantFold(n: NumTagFree[]): NumTagFree[]
export function constantFold(n: StrTagFree[]): StrTagFree[]
export function constantFold(n: AnyTagFree[]): AnyTagFree[]
export function constantFold(n: AnyTagFree[]): AnyTagFree[] {
  return transform(n, (n, map) => {
    const { op } = n
    switch (op) {
      case 'const': case 'read': return n
      case 'sum': case 'prod': case 'min': case 'max': case 'sumfrac': case 'subscript': {
        const x = n.x.map(map) as NumTagFree[]
        if (x.every(x => x.op === 'const'))
          return constant(arithmetic[op](x.map(x => (x as Const<number>).ex), n.ex))
        return { ...n, x, br: [] }
      }
      case 'thres': case 'match': case 'lookup': {
        // We don't eagerly fold `x`. If all `br` can be folded,
        // we can short-circuit and fold only the chosen branch.
        const br = n.br.map(map) as AnyTagFree[]
        let x = n.x as AnyTagFree[]
        if (br.every(n => n.op === 'const')) {
          const branchID = selectBranch[op](br.map(br => (br as Const<any>).ex), n.ex)
          return map(n.x[branchID]!)
        }
        return { ...n, x: x.map(map), br } as AnyTagFree
      }
      default: assertUnreachable(op)
    }
  })
}

export function flatten(n: NumTagFree[]): NumTagFree[]
export function flatten(n: StrTagFree[]): StrTagFree[]
export function flatten(n: AnyTagFree[]): AnyTagFree[]
export function flatten(n: AnyTagFree[]): AnyTagFree[] {
  return transform(n, (n, map) => {
    const { op } = n
    let x = n.x.map(map) as NumTagFree[]
    switch (op) {
      case 'sum': case 'prod': case 'min': case 'max': {
        let constX = x.filter(x => x.op === 'const') as Const<number>[]
        let sameX = x.filter(x => x.op === op)
        const remaining = x.filter(x => x.op !== 'const' && x.op !== op)
        if (constX.length > 1 || sameX.length > 0) {
          // We can either flatten constant values or nested nodes, so we try both
          let mergedConst = constX.length ? [constant(arithmetic[op](constX.map(n => n.ex), n.ex))] : []
          x = [...mergedConst, ...sameX.flatMap(x => x.x), ...remaining]
        }
      }
    }
    return { ...n, x, br: n.br.map(map) } as AnyTagFree
  })
}

export function transform<I extends OP, O extends OP>(n: NumNode<I>[], map: (n: AnyNode<I>, map: (n: AnyNode<I>) => AnyNode<O>) => AnyNode<O>): NumNode<O>[]
export function transform<I extends OP, O extends OP>(n: StrNode<I>[], map: (n: AnyNode<I>, map: (n: AnyNode<I>) => AnyNode<O>) => AnyNode<O>): StrNode<O>[]
export function transform<I extends OP, O extends OP>(n: AnyNode<I>[], map: (n: AnyNode<I>, map: (n: AnyNode<I>) => AnyNode<O>) => AnyNode<O>): AnyNode<O>[]
export function transform<I extends OP, O extends OP>(n: AnyNode<I>[], map: (n: AnyNode<I>, map: (n: AnyNode<I>) => AnyNode<O>) => AnyNode<O>): AnyNode<O>[] {
  const cache = new Map<AnyNode<I>, AnyNode<O>>()

  function internal(n: AnyNode<I>): AnyNode<O> {
    const old = cache.get(n)
    if (old) return old

    // If they are the same, we can save on memory
    let result = map(n, internal)
    if (result.op === n.op &&
      result.ex === n.ex &&
      result.x.every((x, i) => n.x[i] === x) &&
      result.br.every((br, i) => n.br[i] === br)
    )
      result = n as AnyNode<O>

    cache.set(n, result)
    return result
  }

  const result = n.map(internal)
  return result.every((result, i) => n[i] === result) ? n as AnyNode<O>[] : result
}

export function traverse<P extends OP>(n: AnyNode<P>[], visit: (n: AnyNode<P>, visit: (n: AnyNode<P>) => void) => void) {
  const visited = new Set<AnyNode<P>>()

  function internal(n: AnyNode<P>) {
    if (visited.has(n))
      return
    visit(n, internal)
    visited.add(n)
  }
  n.forEach(internal)
}

export function compile(n: NumTagFree[], dynTagCategory: string, slotCount: number, initial: Record<string, number>, defaultValue: number): (_: Record<string, number>[]) => number[]
export function compile(n: StrTagFree[], dynTagCategory: string, slotCount: number, initial: Record<string, string>, defaultValue: string): (_: Record<string, string>[]) => string[]
export function compile(n: AnyTagFree[], dynTagCategory: string, slotCount: number, initial: Record<string, any>, defaultValue: any): (_: Record<string, any>[]) => any[]
export function compile(n: AnyTagFree[], dynTagCategory: string, slotCount: number, initial: Record<string, any>, defaultValue: any): (_: Record<string, any>[]) => any[] {
  let i = 1, body = `'use strict'; const x0=0`; // making sure `const` has at least one entry
  const names = new Map<AnyNode, string>()
  traverse(n, (n, visit) => {
    const name = `x${i++}`
    names.set(n, name)

    const { op, x, br } = n
    x.forEach(visit)
    br.forEach(visit)
    const argNames = x.map(x => names.get(x)!), brNames = br.map(n => names.get(n)!)

    switch (op) {
      case 'const': names.set(n, `(${n.ex})`); break
      case 'sum': case 'prod': body += `,${name}=${argNames.join(op == 'sum' ? '+' : '*')}`; break
      case 'min': case 'max': body += `,${name}=Math.${op}(${argNames})`; break
      case 'sumfrac': body += `,${name}=${argNames[0]}/(${argNames[0]} + ${argNames[1]})`; break
      case 'match': body += `,${name}=${brNames[0]}>=${brNames[1]}?${argNames[0]}:${argNames[1]}`; break
      case 'thres': body += `,${name}=${brNames[0]}===${brNames[1]}?${argNames[0]}:${argNames[1]}`; break
      case 'lookup': throw new Error(`Unsupported operation: ${op}`) // TODO
      case 'subscript': body += `,${name}=[${n.ex}][${argNames[0]}]`; break
      case 'read': {
        const key = n.tag[dynTagCategory]!
        let arr = [...new Array(slotCount)].map((_, i) => `(b[${i}].values['${key}'] ?? ${defaultValue})`)
        if (initial[key]) arr = [initial[key]!.toString(), ...arr]
        body += `,${name}=${arr.join('+')}`
        break
      }
      default: assertUnreachable(op)
    }
  })
  body += `;return [${n.map(n => names.get(n)!)}]`
  return new (Function as any)(`b`, body)
}
