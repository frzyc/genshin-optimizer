import type { AnyNode, CalcResult, OP } from '@genshin-optimizer/pando/engine'
import {
  Calculator as BaseCalculator,
  map,
} from '@genshin-optimizer/pando/engine'
import { type Calculator } from './calculator'
import { tagStr, type Tag, type TagMapNodeEntry } from './data/util'

const opSym = Symbol('op')

export type DebugMeta = {
  entry?: string
  formula: string
  [opSym]: OP
  deps: DebugMeta[]
}
export class DebugCalculator extends BaseCalculator<DebugMeta> {
  constructor(calc: Calculator) {
    super(calc.keys)
    this.nodes = calc.nodes
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
      formula: `[${valStr(val)}] ${nodeString(n)}`,
      [opSym]: n.op,
      deps: [
        ...x.map((x) => x?.meta as DebugMeta).filter((x) => x),
        ...br.map((br) => br.meta),
      ].flatMap((x) => (x[opSym] != 'read' ? x.deps : [x])),
    }
    if (n.op === 'read') {
      result.formula = `[${valStr(val)}] match ${tagStr(
        tag!
      )} for read ${nodeString(n)}`
      result.deps = (x as CalcResult<number | string, DebugMeta>[]).map(
        ({ meta, rereadSeq }) => {
          if (rereadSeq) {
            let entry = ''
            rereadSeq.map((e, i) => {
              if (i) entry += i % 2 ? ' <= ' : ' <- '
              entry += tagStr(e)
            })
            return { entry, ...meta }
          }
          return meta
        }
      )
    }
    return result
  }
}

export function entryString(entry: TagMapNodeEntry): string {
  const tag = tagStr(entry.tag)
  if (entry.value.op == 'reread') return `${tag} <= ${tagStr(entry.value.tag)}`
  else return `${tag} <- ${nodeString(entry.value)}`
}

export function nodeString(node: AnyNode): string {
  return map([node], (node, map: (n: AnyNode) => string) => {
    const { op, tag, br, x } = node
    let { ex } = node
    if (op === 'const') return `${ex}`
    if (op === 'read') return tagStr(tag, ex)
    if (op === 'subscript') ex = undefined
    const args: string[] = []
    if (ex) args.push(JSON.stringify(ex))
    if (tag) args.push(tagStr(tag))
    args.push(...br.map(map), ...x.map(map))
    return `${op}(` + args.join(', ') + ')'
  })[0]
}
