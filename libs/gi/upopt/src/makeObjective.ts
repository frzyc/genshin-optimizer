import { allSubstatKeys } from '@genshin-optimizer/gi/consts'
import type { ArtifactBuildData, DynStat } from '@genshin-optimizer/gi/solver'
import {
  type OptNode,
  ddx,
  optimize,
  precompute,
  zero_deriv,
} from '@genshin-optimizer/gi/wr'

import type { Objective } from './upOpt.types'

export function makeObjective(
  nodes: OptNode[],
  threshold: number[]
): Objective {
  const nonzeroDerivs = nodes.map((n) =>
    allSubstatKeys.filter((s) => !zero_deriv(n, (f) => f.path[1], s))
  )

  // Jacobian of nodes w.r.t. all substats; rows: nodes, cols: substats
  const jac = nodes.map((n, i) =>
    nonzeroDerivs[i].map((sub) => ddx(n, (f) => f.path[1], sub))
  )
  const allNodes = optimize(
    [...nodes, ...jac.flat()],
    {},
    ({ path: [p] }) => p !== 'dyn'
  )
  const evalFn = precompute(allNodes, {}, (f) => f.path[1], 1)

  return {
    threshold,
    computeWithDerivs: (x: DynStat) => {
      const values = evalFn([{ id: '', values: x }] as ArtifactBuildData[] & {
        length: 1
      })
      const f = values.slice(0, nodes.length)
      let k = nodes.length
      const df = nonzeroDerivs.map((subs) =>
        Object.fromEntries(subs.map((s) => [s, values[k++]]))
      ) as DynStat[]
      return [f, df]
    },
    zeroDeriv: allSubstatKeys.filter((s) =>
      nonzeroDerivs.every((subs) => !subs.includes(s))
    ),
  }
}
