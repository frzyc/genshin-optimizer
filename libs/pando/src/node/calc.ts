import type {
  RawTagMapKeys,
  RawTagMapValues,
  Tag,
  TagMapSubsetCache,
} from '../tag'
import {
  TagMapExactValues,
  TagMapKeys,
  TagMapSubsetValues,
  mergeTagMapValues,
} from '../tag'
import { assertUnreachable, extract, isDebug, tagString } from '../util'
import { arithmetic, branching } from './formula'
import type { AnyNode, NumNode, ReRead, Read, StrNode } from './type'

type TagCache = TagMapSubsetCache<AnyNode | ReRead>
type PreRead<M> = {
  pre: CalcResult<number | string, M>[]
  computed: Partial<
    Record<NonNullable<Read['ex']>, CalcResult<number | string, M>>
  >
}
const getV = <V, M>(n: CalcResult<V, M>[]) => extract(n, 'val')

export type CalcResult<V, M> = { val: V; meta: M; entryTag?: Tag[] }
export class Calculator<M = any> {
  keys: TagMapKeys
  nodes: TagMapSubsetValues<AnyNode | ReRead>
  calculated: TagMapExactValues<PreRead<M>>

  constructor(
    keys: RawTagMapKeys,
    ...values: RawTagMapValues<AnyNode | ReRead>[]
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

    if (!isDebug('calc'))
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
    else {
      // Slow, debug path
      const tags = cache.tags()
      result.push({
        pre: cache.subset().flatMap((n, i) =>
          n.op === 'reread'
            ? this._preread(cache.with(n.tag)).pre.map((x) =>
                // Must be a new object in case `reread` entry is shared with a regular `read`.
                // They would have the same `val` and `meta` but different `debugTag`.
                ({ ...x, entryTag: [tags[i]!, n.tag, ...(x.entryTag ?? [])] })
              )
            : [{ ...this._compute(n, cache), entryTag: [tags[i]!] }]
        ),
        computed: {},
      })
    }
    return result[0]!
  }

  _compute(n: StrNode, cache: TagCache): CalcResult<string, M>
  _compute(n: NumNode, cache: TagCache): CalcResult<number, M>
  _compute(n: AnyNode, cache: TagCache): CalcResult<number | string, M>
  _compute(n: AnyNode, cache: TagCache): CalcResult<number | string, M> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    return internal(n)

    function meta(
      n: AnyNode,
      val: number | string,
      x: (CalcResult<number | string, M> | undefined)[],
      br: CalcResult<number | string, M>[],
      tag?: Tag
    ): CalcResult<number | string, M> {
      return { val, meta: self.computeMeta(n, val, x, br, tag) }
    }
    function internal(n: StrNode): CalcResult<string, M>
    function internal(n: NumNode): CalcResult<number, M>
    function internal(n: AnyNode): CalcResult<number | string, M>
    function internal(n: AnyNode): CalcResult<number | string, M> {
      const { op } = n
      switch (op) {
        case 'const':
          return meta(n, n.ex, [], [])
        case 'sum':
        case 'prod':
        case 'min':
        case 'max':
        case 'sumfrac': {
          const x = n.x.map((n) => internal(n))
          return meta(n, arithmetic[op](getV(x), n.ex), x, [])
        }
        case 'thres':
        case 'match':
        case 'lookup': {
          const br = n.br.map((br) => internal(br)),
            branchID = branching[op](getV(br), n.ex)
          const x = [...Array(n.x.length)],
            result = internal(n.x[branchID]!)
          x[branchID] = result
          return meta(n, result.val, x, br)
        }
        case 'subscript': {
          const index = internal(n.br[0]!)
          return meta(n, n.ex[index.val]!, [], [index])
        }
        case 'vtag':
          return meta(n, cache.tag[n.ex] ?? '', [], [])
        case 'tag': {
          const newCache = cache.with(n.tag)
          const result = self._compute(n.x[0]!, newCache)
          return meta(n, result.val, [result], [], newCache.tag)
        }
        case 'dtag': {
          const tags = n.br.map((br) => internal(br))
          const newCache = cache.with(
            Object.fromEntries(tags.map((tag, i) => [n.ex[i], tag.val]))
          )
          const result = self._compute(n.x[0]!, newCache)
          return meta(n, result.val, [result], tags, newCache.tag)
        }
        case 'read': {
          const newCache = cache.with(n.tag)
          const { pre, computed } = self._preread(newCache),
            ex = n.ex

          switch (ex) {
            case undefined:
              if (pre.length !== 1) {
                const errorMsg = `Found ${
                  pre.length
                } nodes while reading tag ${tagString(
                  newCache.tag
                )} with no accumulator`
                if (isDebug('calc')) {
                  throw new Error(
                    errorMsg +
                      ': ' +
                      pre
                        .map((pre) => JSON.stringify(pre.entryTag![0]))
                        .join(', ')
                  )
                } else console.error(errorMsg)
              }
              return meta(n, pre[0]?.val ?? undefined!, pre, [], newCache.tag)
            default: {
              if (computed[ex]) return computed[ex]!
              const val = arithmetic[ex](getV(pre) as number[], undefined)
              computed[ex] = meta(n, val, pre, [], newCache.tag)
              return computed[ex]!
            }
          }
        }
        case 'custom': {
          const x = n.x.map((n) => internal(n)),
            ex = n.ex
          return meta(n, self.computeCustom(getV(x), ex), x, [])
        }
        default:
          assertUnreachable(op)
      }
    }
  }

  computeCustom(_: any[], op: string): any {
    throw new Error(`Unsupported custom node ${op} in Calculator`)
  }
  computeMeta(
    _n: AnyNode,
    _value: number | string,
    _x: (CalcResult<number | string, M> | undefined)[],
    _br: CalcResult<number | string, M>[],
    _tag: Tag | undefined
  ): M {
    return undefined as any
  }
}
