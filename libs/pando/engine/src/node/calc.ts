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

export type TagCache = TagMapSubsetCache<AnyNode | ReRead>
export type PreRead<M> = Partial<
  Record<NonNullable<Read['ex']> | 'unique', CalcResult<number | string, M>>
> & { pre: CalcResult<number | string, M>[] }
const getV = <V, M>(n: CalcResult<V, M>[]) => extract(n, 'val')

export type CalcResult<V, M> = { val: V; meta: M }
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
    return this._gather(this.nodes.cache(this.keys).with(tag)).pre
  }

  compute(n: NumNode): CalcResult<number, M>
  compute(n: StrNode): CalcResult<string, M>
  compute(n: AnyNode): CalcResult<number | string, M>
  compute(n: AnyNode): CalcResult<number | string, M> {
    return this._compute(n, this.nodes.cache(this.keys))
  }

  _gather(cache: TagCache): PreRead<M> {
    const result = this.calculated.refExact(cache.id)
    if (result.length) return result[0]!

    result.push({
      pre: cache
        .subset()
        .flatMap((n) =>
          n.op === 'reread'
            ? this._gather(cache.with(n.tag)).pre
            : [this.markGathered(cache.tag, n, this._compute(n, cache))]
        ),
    })
    return result[0]!
  }

  _compute(n: StrNode, cache: TagCache): CalcResult<string, M>
  _compute(n: NumNode, cache: TagCache): CalcResult<number, M>
  _compute(n: AnyNode, cache: TagCache): CalcResult<number | string, M>
  _compute(n: AnyNode, cache: TagCache): CalcResult<number | string, M> {
    const finalize = (
      val: number | string,
      x: (CalcResult<number | string, M> | undefined)[],
      br: CalcResult<number | string, M>[],
      tag?: Tag
    ) => Object.freeze({ val, meta: this.computeMeta(n, val, x, br, tag) })

    const { op } = n
    switch (op) {
      case 'const':
        return finalize(n.ex, [], [])
      case 'sum':
      case 'prod':
      case 'min':
      case 'max':
      case 'sumfrac': {
        const x = n.x.map((n) => this._compute(n, cache))
        return finalize(arithmetic[op](getV(x), n.ex), x, [])
      }
      case 'thres':
      case 'match':
      case 'lookup': {
        const br = n.br.map((br) => this._compute(br, cache)),
          branchID = branching[op](getV(br), n.ex)
        const x = [...Array(n.x.length)],
          result = this._compute(n.x[branchID]!, cache)
        x[branchID] = result
        return finalize(result.val, x, br)
      }
      case 'subscript': {
        const index = this._compute(n.br[0]!, cache)
        return finalize(n.ex[index.val]!, [], [index])
      }
      case 'vtag':
        return finalize(cache.tag[n.ex] ?? '', [], [])
      case 'tag': {
        const newCache = cache.with(n.tag)
        const result = this._compute(n.x[0]!, newCache)
        return finalize(result.val, [result], [], newCache.tag)
      }
      case 'dtag': {
        const tags = n.br.map((br) => this._compute(br, cache))
        const newCache = cache.with(
          Object.fromEntries(tags.map((tag, i) => [n.ex[i], tag.val]))
        )
        const result = this._compute(n.x[0]!, newCache)
        return finalize(result.val, [result], tags, newCache.tag)
      }
      case 'read': {
        const newCache = cache.with(n.tag)
        const computed = this._gather(newCache)
        const { pre } = computed,
          ex = n.ex ?? 'unique'

        if (computed[ex]) return computed[ex]
        if (isDebug('calc') && ex === 'unique' && pre.length !== 1)
          throw new Error(`Ill-form read for ${tagString(newCache.tag)}`)
        const val = arithmetic[ex](getV(pre) as number[], undefined)
        computed[ex] = finalize(val, pre, [], newCache.tag)
        return computed[ex]
      }
      case 'custom': {
        const x = n.x.map((n) => this._compute(n, cache))
        return finalize(this.computeCustom(getV(x), n.ex), x, [])
      }
      default:
        assertUnreachable(op)
    }
  }

  markGathered(
    _tag: Tag,
    _n: AnyNode | undefined,
    result: CalcResult<number | string, M>
  ): CalcResult<number | string, M> {
    return result
  }
  computeCustom(_: (number | string)[], op: string): any {
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
