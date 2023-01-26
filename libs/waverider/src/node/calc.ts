import { CompiledTagMapKeys, CompiledTagMapValues, mergeTagMapValues, Tag, TagMapExactValues, TagMapKeys, TagMapSubsetCache, TagMapSubsetValues } from '../tag'
import { assertUnreachable, extract, tagString } from '../util'
import { arithmetic, selectBranch } from './formula'
import type { AnyNode, NumNode, ReRead, StrNode } from './type'

type TagCache = TagMapSubsetCache<AnyNode | ReRead>
const getV = <V, M>(n: CalcResult<V, M>[]) => extract(n, 'val')

export type CalcResult<V, M> = { val: V, meta: M }
export class Calculator<M = undefined> {
  keys: TagMapKeys
  nodes: TagMapSubsetValues<AnyNode | ReRead>
  calculated: TagMapExactValues<CalcResult<number | string, M>[]>

  constructor(keys: CompiledTagMapKeys, ...values: CompiledTagMapValues<AnyNode | ReRead>[]) {
    this.keys = new TagMapKeys(keys)
    this.nodes = new TagMapSubsetValues(keys.tagLen, mergeTagMapValues(values))
    this.calculated = new TagMapExactValues(keys.tagLen, {})
  }

  get<V extends number | string = number | string>(tag: Tag): CalcResult<V, M>[]
  get(tag: Tag): CalcResult<number | string, M>[] {
    return this._preread(this.nodes.cache(this.keys).with(tag))
  }

  compute(n: NumNode): CalcResult<number, M>
  compute(n: StrNode): CalcResult<string, M>
  compute(n: AnyNode): CalcResult<number | string, M>
  compute(n: AnyNode): CalcResult<number | string, M> {
    return this._compute(n, this.nodes.cache(this.keys))
  }

  _preread(cache: TagCache): CalcResult<number | string, M>[] {
    const result = this.calculated.refExact(cache.id)
    if (result.length) return result[0]!

    result.push(cache.subset().flatMap(n =>
      n.op === 'reread' ? this._preread(cache.with(n.tag)) : [this._compute(n, cache)]))
    return result[0]!
  }

  _compute(n: StrNode, cache: TagCache): CalcResult<string, M>
  _compute(n: NumNode, cache: TagCache): CalcResult<number, M>
  _compute(n: AnyNode, cache: TagCache): CalcResult<number | string, M>
  _compute(n: AnyNode, cache: TagCache): CalcResult<number | string, M> {
    const self = this
    return internal(n)

    function meta(op: AnyNode['op'], tag: Tag | undefined, val: any, x: (CalcResult<any, M> | undefined)[], br: CalcResult<any, M>[], ex?: any): CalcResult<any, M> {
      return { val, meta: self.computeMeta(op, tag, val, x, br, ex) }
    }
    function internal(n: StrNode): CalcResult<string, M>
    function internal(n: NumNode): CalcResult<number, M>
    function internal(n: AnyNode): CalcResult<number | string, M>
    function internal(n: AnyNode): CalcResult<number | string, M> {
      const { op } = n
      switch (op) {
        case 'const': return meta(op, undefined, n.ex, [], [])
        case 'sum': case 'prod': case 'min': case 'max':
        case 'sumfrac': {
          const x = n.x.map(n => internal(n)), ex = n.ex
          return meta(op, undefined, arithmetic[op](getV(x), ex), x, [], ex)
        }
        case 'thres': case 'match': case 'lookup': {
          const br = n.br.map(br => internal(br)), branchID = selectBranch[op](getV(br), n.ex)
          const x = [...Array(n.x.length)], result = internal(n.x[branchID]!)
          x[branchID] = result
          return meta(op, undefined, result.val, x, br, n.ex)
        }
        case 'subscript':
          const index = internal(n.br[0]!)
          return meta(op, undefined, n.ex[index.val], [], [index], n.ex)
        case 'tag': return self._compute(n.x[0]!, cache.with(n.tag))
        case 'read': {
          const computed = self._preread(cache.with(n.tag)), accu = n.accu

          switch (accu) {
            case undefined:
              if (computed.length !== 1) {
                const errorMsg = `Found ${computed.length} nodes while reading tag ${tagString(cache.tag)} with no accumulator`
                if (process.env['NODE_ENV'] !== 'production')
                  throw new Error(errorMsg)
                else console.error(errorMsg)
              }
              return computed[0] ?? meta(op, undefined, undefined, [], [])
            default:
              const val = arithmetic[accu](getV(computed) as number[], undefined)
              return meta(accu, cache.tag, val, computed, [])
          }
        }
        default: assertUnreachable(op)
      }
    }
  }

  computeMeta(_op: AnyNode['op'], _tag: Tag | undefined, _value: any, _x: (CalcResult<any, M> | undefined)[], _br: CalcResult<any, M>[], _ex: any): M {
    return undefined as any
  }
}
