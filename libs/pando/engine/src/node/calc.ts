import type { DebugCalculator } from '../debug'
import type { DedupTag, RawTagMapKeys, RawTagMapValues, Tag } from '../tag'
import {
  DedupTags,
  mergeTagMapValues,
  TagMapKeys,
  TagMapSubsetValues,
} from '../tag'
import {
  assertUnreachable,
  customOps,
  extract,
  isDebug,
  tagString,
} from '../util'
import { arithmetic, branching } from './formula'
import type { AnyNode, BaseRead, NumNode, ReRead, StrNode } from './type'

export type TagCache<M> = DedupTag<PreRead<M>>
export type PreRead<M> = Partial<
  Record<NonNullable<BaseRead['ex']> | 'unique', CalcResult<number | string, M>>
> & { pre: CalcResult<number | string, M>[] }
const getV = <V, M>(n: CalcResult<V, M>[]) => extract(n, 'val')

export type CalcResult<V, M> = { val: V; meta: M }
export class Calculator<M = any> {
  nodes: TagMapSubsetValues<AnyNode | ReRead>
  cache: DedupTag<PreRead<M>>
  calc: DedupTag<this>

  constructor(
    rawKeys: RawTagMapKeys,
    ...values: RawTagMapValues<AnyNode | ReRead>[]
  ) {
    const keys = new TagMapKeys(rawKeys)
    this.nodes = new TagMapSubsetValues(keys.tagLen, mergeTagMapValues(values))
    this.cache = new DedupTags(keys).at({})
    this.calc = new DedupTags(keys).at({})
    this.calc.val = this
  }
  withTag(tag: Tag): this {
    const calc = this.calc.with(tag)
    return (calc.val ??= Object.assign(
      new (this.constructor as any)(this.cache.keys),
      this,
      { cache: this.cache.with(tag), calc }
    ))
  }

  gather<V extends number | string = number | string>(
    tag: Tag
  ): CalcResult<V, M>[]
  gather(tag: Tag): CalcResult<number | string, M>[] {
    return this._gather(this.cache.with(tag)).pre
  }

  compute(n: NumNode): CalcResult<number, M>
  compute(n: StrNode): CalcResult<string, M>
  compute(n: AnyNode): CalcResult<number | string, M>
  compute(n: AnyNode): CalcResult<number | string, M> {
    return this._compute(n, this.cache)
  }

  _gather(cache: TagCache<M>): PreRead<M> {
    if (cache.val) return cache.val
    const pre = this.nodes
      .entries(cache.id)
      .flatMap(({ tag, value: n }) =>
        n.op === 'reread'
          ? this._gather(cache.with(n.tag)).pre
          : [this.markGathered(cache.tag, tag, n, this._compute(n, cache))]
      )
    return (cache.val = { pre })
  }

  _compute(n: StrNode, cache: TagCache<M>): CalcResult<string, M>
  _compute(n: NumNode, cache: TagCache<M>): CalcResult<number, M>
  _compute(n: AnyNode, cache: TagCache<M>): CalcResult<number | string, M>
  _compute(n: AnyNode, cache: TagCache<M>): CalcResult<number | string, M> {
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
        const x = [...Array(n.x.length)]
        const result = (x[branchID] = this._compute(n.x[branchID]!, cache))
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
        const { pre } = computed
        const ex = n.ex ?? this.defaultAccu(newCache.tag) ?? 'unique'

        if (computed[ex]) return computed[ex]
        if (isDebug('calc') && ex === 'unique' && pre.length !== 1)
          throw new Error(`Ill-form read for ${tagString(newCache.tag)}`)
        const val = arithmetic[ex](getV(pre) as number[], undefined)
        return (computed[ex] = finalize(val, pre, [], newCache.tag))
      }
      case 'custom': {
        const x = n.x.map((n) => this._compute(n, cache))
        return finalize(customOps[n.ex].calc(getV(x)), x, [])
      }
      default:
        assertUnreachable(op)
    }
  }

  defaultAccu(_tag: Tag): BaseRead['ex'] {
    return
  }
  markGathered(
    _tag: Tag,
    _entryTag: Tag,
    _n: AnyNode | undefined,
    result: CalcResult<number | string, M>
  ): CalcResult<number | string, M> {
    return result
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

  toDebug(): DebugCalculator {
    throw new Error('not implemented')
  }
}
