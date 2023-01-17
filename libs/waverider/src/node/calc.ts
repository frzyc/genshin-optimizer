import type { Tag } from '../tag'
import { CompiledTagMapKeys, CompiledTagMapValues, TagMap, TagMapKeys, TagMapValues } from '../tag/map'
import { assertUnreachable, extract, tagString } from '../util'
import { arithmetic, selectBranch } from './formula'
import type { AnyNode, NumNode, Read, StrNode } from './type'

const getV = <V, M>(n: CalcResult<V, M>[]) => extract(n, 'val')

export type CalcResult<V, M> = { val: V, meta: M }
export class Calculator<M = undefined> {
  keys: TagMapKeys
  nodes: TagMap<AnyNode>
  tagged: TagMapValues<TaggedCalculator<M>>
  untagged: TaggedCalculator<M>

  constructor(keys: CompiledTagMapKeys, ...values: CompiledTagMapValues<AnyNode>[]) {
    this.keys = new TagMapKeys(keys)
    this.nodes = new TagMap(keys, ...values)
    this.tagged = new TagMapValues(this.keys.tagLen)
    this.untagged = this.withTag({})
  }

  get(tag: Tag): CalcResult<number | string, M>[] {
    return this.withTag(tag).getAll()
  }

  _compute(n: NumNode): CalcResult<number, M>
  _compute(n: StrNode): CalcResult<string, M>
  _compute(n: AnyNode): CalcResult<number | string, M> {
    return this.untagged.get(n)
  }

  withTag(tag: Tag): TaggedCalculator<M> {
    const tagID = this.keys.get(tag)
    let [cache] = this.tagged.exact(tagID)
    if (!cache) {
      const nodes = this.nodes.values.subset(tagID)
      cache = new TaggedCalculator(tag, nodes, this)
      this.tagged.add(tagID, cache)
    }
    return cache
  }

  computeMeta(_op: AnyNode['op'], _tag: Tag | undefined, _value: any, _x: (CalcResult<any, M> | undefined)[], _br: CalcResult<any, M>[], _ex: any): M {
    return undefined as any
  }
}

class TaggedCalculator<M> {
  tag: Tag
  nodes: AnyNode[]
  parent: Calculator<M>

  computed: CalcResult<number | string, M>[] | undefined

  constructor(tag: Tag, nodes: AnyNode[], parent: Calculator<M>) {
    this.tag = tag
    this.nodes = nodes
    this.parent = parent
  }

  getAll(): CalcResult<number | string, M>[] {
    this.computed = this.computed ?? this.nodes.map(n => this.get(n))
    return this.computed
  }

  get(n: NumNode): CalcResult<number, M>
  get(n: StrNode): CalcResult<string, M>
  get(n: AnyNode): CalcResult<number | string, M>
  get(n: AnyNode): CalcResult<number | string, M> {
    const { op } = n
    switch (op) {
      case 'const':
        return this._leaf('const', n.ex)
      case 'sum': case 'prod': case 'min': case 'max':
      case 'sumfrac': case 'subscript':
        return this._arithmetic(op, n.x, n.ex)
      case 'thres': case 'match': case 'lookup':
        return this._conditional(op, n.br, n.x, n.ex)
      case 'tag': return this._tag(n.x[0]!, n.tag)
      case 'read': return this._read(n.agg, n.tag)
      default: assertUnreachable(op)
    }
  }

  _meta(op: AnyNode['op'], tag: Tag | undefined, val: any, x: (CalcResult<any, M> | undefined)[], br: CalcResult<any, M>[], ex?: any): CalcResult<any, M> {
    return { val, meta: this.parent.computeMeta(op, tag, val, x, br, ex) }
  }

  _leaf<V extends number | string>(op: AnyNode['op'], val: V): CalcResult<V, M> {
    return this._meta(op, undefined, val, [], [])
  }
  _arithmetic(op: keyof typeof arithmetic, xIn: NumNode[], ex: any): CalcResult<number, M> {
    const x = xIn.map(n => this.get(n))
    return this._meta(op, undefined, arithmetic[op](getV(x), ex), x, [], ex)
  }
  _conditional(op: keyof typeof selectBranch, brIn: AnyNode[], xIn: AnyNode[], ex: any): CalcResult<number | string, M> {
    const br = brIn.map(br => this.get(br)), branchID = selectBranch[op](getV(br), ex)
    const x = [...Array(xIn.length)], result = this.get(xIn[branchID]!)
    x[branchID] = result
    return this._meta(op, undefined, result.val, x, br, ex)
  }

  withTag(tag: Tag): TaggedCalculator<M> {
    return this.parent.withTag({ ...this.tag, ...tag })
  }

  _tag(xIn: AnyNode, extraTag: Tag): CalcResult<number | string, M> {
    return this.withTag(extraTag).get(xIn)
  }
  _read(agg: Read['agg'], extraTag: Tag | undefined): CalcResult<number | string, M> {
    if (extraTag && Object.keys(extraTag).length)
      return this.parent.withTag({ ...this.tag, ...extraTag })._read(agg, undefined)

    const computed = this.getAll()

    let result: CalcResult<number | string, M>
    switch (agg) {
      case undefined:
        let errorMsg = undefined
        if (!computed.length) {
          errorMsg = `Found no nodes with no aggregation on tag ${tagString(this.tag)}`
          result = this._leaf('read', undefined as any)
        } else {
          if (computed.length > 1)
            errorMsg = `Found multiple nodes with no aggregation on tag ${tagString(this.tag)}`
          result = computed[0]!
        }
        if (errorMsg)
          if (process.env['NODE_ENV'] !== 'production')
            throw new Error(errorMsg)
          else console.error(errorMsg)
        break
      default:
        const val = arithmetic[agg](getV(computed) as number[], undefined)
        result = this._meta(agg, this.tag, val, computed, [])
    }
    return result
  }
}
