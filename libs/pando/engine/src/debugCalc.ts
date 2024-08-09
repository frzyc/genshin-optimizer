import type { AnyNode, CalcResult } from './node'
import { Calculator as BaseCalculator, map } from './node'
import type { Tag } from './tag'

const isRead = Symbol()
type TagStr = (tag: Tag, ex?: any) => string

export type DebugMeta = {
  entry?: string
  formula: string
  [isRead]: boolean
  deps: DebugMeta[]
}
export class DebugCalculator extends BaseCalculator<DebugMeta> {
  tagStr: TagStr
  custom: typeof this.computeCustom

  constructor(calc: BaseCalculator<any>, tagStr: TagStr) {
    super(calc.keys)
    this.nodes = calc.nodes
    this.tagStr = tagStr
    this.custom = calc.computeCustom
  }
  override computeMeta(
    n: AnyNode,
    val: number | string,
    x: (CalcResult<number | string, DebugMeta> | undefined)[],
    br: CalcResult<number | string, DebugMeta>[],
    tag: Tag | undefined
  ): DebugMeta {
    function valStr(val: number | string): string {
      if (typeof val !== 'number') return `"${val}"`
      if (Math.round(val) === val) return `${val}`
      return val.toFixed(2)
    }

    const result: DebugMeta = {
      formula: `[${valStr(val)}] ${this.nodeString(n)}`,
      [isRead]: n.op === 'read',
      deps: [
        ...x.map((x) => x?.meta as DebugMeta).filter((x) => x),
        ...br.map((br) => br.meta),
      ].flatMap((x) => (x[isRead] ? [x] : x.deps)),
    }
    if (n.op === 'read') {
      result.formula = `[${valStr(val)}] gather ${this.tagStr(
        Object.fromEntries(Object.entries(tag!).filter(([_, v]) => v))
      )} for read ${this.nodeString(n)}`
      result.deps = (x as CalcResult<number | string, DebugMeta>[]).map(
        ({ meta, rereadSeq }) => {
          if (rereadSeq) {
            let entry = ''
            rereadSeq.map((e, i) => {
              if (i) entry += i % 2 ? ' <= ' : ' <- '
              entry += this.tagStr(e)
            })
            return { entry, ...meta }
          }
          return meta
        }
      )
    }
    return result
  }

  override computeCustom(args: (number | string)[], op: string): any {
    return this.custom(args, op)
  }

  nodeString(node: AnyNode): string {
    return map([node], (node, map: (n: AnyNode) => string) => {
      const { op, tag, br, x } = node
      let { ex } = node
      if (op === 'const') return `${ex}`
      if (op === 'read') return this.tagStr(tag, ex)
      if (op === 'subscript') ex = undefined
      const args: string[] = []
      if (ex) args.push(JSON.stringify(ex))
      if (tag) args.push(this.tagStr(tag))
      args.push(...br.map(map), ...x.map(map))
      return `${op}(` + args.join(', ') + ')'
    })[0]
  }
}
