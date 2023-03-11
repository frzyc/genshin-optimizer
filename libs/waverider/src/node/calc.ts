import type {
  CompiledTagMapKeys,
  CompiledTagMapValues,
  Tag,
  TagMapSubsetCache,
} from '../tag'
import {
  mergeTagMapValues,
  TagMapExactValues,
  TagMapKeys,
  TagMapSubsetValues,
} from '../tag'
import { assertUnreachable, extract, tagString } from '../util'
import { arithmetic, branching } from './formula'
import type { AnyNode, AnyOP, NumNode, Read, ReRead, StrNode } from './type'

type TagCache = TagMapSubsetCache<AnyNode | ReRead>
type PreRead<M> = {
  pre: CalcResult<number | string, M>[]
  computed: Partial<
    Record<NonNullable<Read['accu']>, CalcResult<number | string, M>>
  >
}
const getV = <V, M>(n: CalcResult<V, M>[]) => extract(n, 'val')

export type CalcResult<V, M> = { val: V; meta: M }
export class Calculator<M = undefined> {
  keys: TagMapKeys
  nodes: TagMapSubsetValues<AnyNode | ReRead>
  calculated: TagMapExactValues<PreRead<M>>

  constructor(
    keys: CompiledTagMapKeys,
    ...values: CompiledTagMapValues<AnyNode | ReRead>[]
  ) {
    this.keys = new TagMapKeys(keys)
    this.nodes = new TagMapSubsetValues(keys.tagLen, mergeTagMapValues(values))
    this.calculated = new TagMapExactValues(keys.tagLen, {})
  }

  get<V extends number | string = number | string>(tag: Tag): CalcResult<V, M>[]
  get(tag: Tag): CalcResult<number | string, M>[] {
    return this._preread(this.nodes.cache(this.keys).with(tag)).pre
  }

  compute(n: NumNode): CalcResult<number, M>
  compute(n: StrNode): CalcResult<string, M>
  compute(n: AnyNode): CalcResult<number | string, M>
  compute(n: AnyNode): CalcResult<number | string, M> {
    return this._compute(n, this.nodes.cache(this.keys))
  }

  _preread(cache: TagCache): PreRead<M> {
    const result = this.calculated.refExact(cache.id)
    if (result.length) return result[0]!

    result.push({
      pre: cache
        .subset()
        .flatMap((n) =>
          n.op === 'reread'
            ? this._preread(cache.with(n.tag)).pre
            : [this._compute(n, cache)]
        ),
      computed: {},
    })
    return result[0]!
  }

  _compute(n: StrNode, cache: TagCache): CalcResult<string, M>
  _compute(n: NumNode, cache: TagCache): CalcResult<number, M>
  _compute(n: AnyNode, cache: TagCache): CalcResult<number | string, M>
  _compute(n: AnyNode, cache: TagCache): CalcResult<number | string, M> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this,
      result = internal(n)
    switch (n.op) {
      case 'tag':
      case 'dtag':
      case 'read':
        return result
      // Make sure top-level entries are properly tagged as the caller could be `reread`
      default:
        return meta('tag', cache.tag, result.val, [result], [])
    }

    function meta(
      op: Exclude<AnyOP, 'read'>,
      tag: Tag | undefined,
      val: any,
      x: (CalcResult<any, M> | undefined)[],
      br: CalcResult<any, M>[],
      ex?: any
    ): CalcResult<any, M> {
      return { val, meta: self.computeMeta(op, tag, val, x, br, ex) }
    }
    function internal(n: StrNode): CalcResult<string, M>
    function internal(n: NumNode): CalcResult<number, M>
    function internal(n: AnyNode): CalcResult<number | string, M>
    function internal(n: AnyNode): CalcResult<number | string, M> {
      const { op } = n
      switch (op) {
        case 'const':
          return meta(op, undefined, n.ex, [], [])
        case 'sum':
        case 'prod':
        case 'min':
        case 'max':
        case 'sumfrac': {
          const x = n.x.map((n) => internal(n)),
            ex = n.ex
          return meta(op, undefined, arithmetic[op](getV(x), ex), x, [], ex)
        }
        case 'thres':
        case 'match':
        case 'lookup': {
          const br = n.br.map((br) => internal(br)),
            branchID = branching[op](getV(br), n.ex)
          const x = [...Array(n.x.length)],
            result = internal(n.x[branchID]!)
          x[branchID] = result
          return meta(op, undefined, result.val, x, br, n.ex)
        }
        case 'subscript': {
          const index = internal(n.br[0]!)
          return meta(op, undefined, n.ex[index.val], [], [index], n.ex)
        }
        case 'tag': {
          const newCache = cache.with(n.tag)
          const result = self._compute(n.x[0]!, newCache)
          return meta(op, newCache.tag, result.val, [result], [])
        }
        case 'dtag': {
          const tags = n.br.map((br) => internal(br))
          const newCache = cache.with(
            Object.fromEntries(tags.map((tag, i) => [n.ex[i], tag.val]))
          )
          const result = self._compute(n.x[0]!, newCache)
          return meta(op, newCache.tag, result.val, [result], tags, n.ex)
        }
        case 'read': {
          const newCache = cache.with(n.tag)
          const { pre, computed } = self._preread(newCache),
            accu = n.accu

          switch (accu) {
            case undefined:
              if (pre.length !== 1) {
                const errorMsg = `Found ${
                  pre.length
                } nodes while reading tag ${tagString(
                  newCache.tag
                )} with no accumulator`
                if (process.env['NODE_ENV'] !== 'production')
                  throw new Error(errorMsg)
                else console.error(errorMsg)
              }
              return meta(
                'tag',
                newCache.tag,
                pre[0]?.val ?? undefined,
                pre,
                []
              )
            default: {
              if (computed[accu]) return computed[accu]!
              const val = arithmetic[accu](getV(pre) as number[], undefined)
              computed[accu] = meta(accu, newCache.tag, val, pre, [])
              return computed[accu]!
            }
          }
        }
        default:
          assertUnreachable(op)
      }
    }
  }

  computeMeta(
    _op: Exclude<AnyOP, 'read'>,
    _tag: Tag | undefined,
    _value: any,
    _x: (CalcResult<any, M> | undefined)[],
    _br: CalcResult<any, M>[],
    _ex: any
  ): M {
    return undefined as any
  }
}
