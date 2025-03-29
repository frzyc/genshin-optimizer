import type { AnyTagFree } from '@genshin-optimizer/pando/engine'
import { DebugCalculator, mapBottomUp } from '@genshin-optimizer/pando/engine'
import {
  Calculator,
  compileTagMapKeys,
  compileTagMapValues,
  constant,
} from '@genshin-optimizer/pando/engine'
import type { Candidate } from './common'

export function debugMeta(
  nodes: AnyTagFree[],
  candidates: Candidate[][],
  ids: Candidate['id'][],
  dynTagCat: string
): ReturnType<DebugCalculator['compute']>['meta'][] {
  const build = candidates.map((cnds, i) => cnds.find((c) => c.id === ids[i])!)
  const missingId = build.findIndex((c) => !c)
  if (missingId !== -1)
    throw new Error(`no candidate with id ${ids[missingId]}`)

  const cats = new Set(build.flatMap((c) => Object.keys(c)))
  nodes = mapBottomUp(nodes, (n) => {
    if (n.op === 'read') {
      cats.add(n.tag[dynTagCat]!)
      return { ...n, ex: n.ex ?? 'sum' }
    }
    return n
  })
  const keys = compileTagMapKeys([{ category: dynTagCat, values: cats }])
  const calc = new Calculator(
    keys,
    compileTagMapValues(
      keys,
      build.flatMap((c) =>
        Object.entries(c).map(([cat, v]) => ({
          tag: { [dynTagCat]: cat },
          value: constant(v),
        }))
      )
    )
  )
  const debugCalc = new DebugCalculator(calc)
  return nodes.map((n) => debugCalc.compute(n).meta)
}
