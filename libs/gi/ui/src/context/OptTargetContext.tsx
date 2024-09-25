import { objPathValue } from '@genshin-optimizer/common/util'
import { allMainStatKeys, allSubstatKeys } from '@genshin-optimizer/gi/consts'
import { TeamCharacterContext, useOptConfig } from '@genshin-optimizer/gi/db-ui'
import { dynamicData } from '@genshin-optimizer/gi/solver-tc'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import {
  constant,
  mapFormulas,
  mergeData,
  optimize,
  precompute,
} from '@genshin-optimizer/gi/wr'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { resolveInfo } from '../util'
import { DataContext } from './DataContext'
type OptTargetContextObj = {
  target: string[] | undefined
  scalesWith: string[]
}
const defOptTargetContextObj = {
  target: undefined,
  scalesWith: [],
} as OptTargetContextObj
export const OptTargetContext = createContext(defOptTargetContextObj)

export function OptTargetWrapper({ children }: { children: ReactNode }) {
  const {
    teamChar: { optConfigId, key: characterKey },
  } = useContext(TeamCharacterContext)

  const buildSetting = useOptConfig(optConfigId)!
  const dataContextValue = useContext(DataContext)
  const optTargetContextObj = useMemo((): OptTargetContextObj => {
    const { statFilters, optimizationTarget } = buildSetting
    if (!optimizationTarget) return defOptTargetContextObj

    const workerData = dataContextValue.teamData[characterKey]?.target.data![0]
    if (!workerData) return defOptTargetContextObj

    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic

    const unoptimizedOptimizationTargetNode = objPathValue(
      workerData.display ?? {},
      optimizationTarget
    ) as NumNode | undefined

    if (!unoptimizedOptimizationTargetNode) return defOptTargetContextObj

    const valueFilter: { value: NumNode; minimum: number }[] = Object.entries(
      statFilters
    )
      .flatMap(([pathStr, settings]) =>
        settings
          .filter((setting) => !setting.disabled)
          .map((setting) => {
            const filterNode: NumNode = objPathValue(
              workerData.display ?? {},
              JSON.parse(pathStr)
            )
            const infoResolved =
              filterNode?.info && resolveInfo(filterNode.info)
            const minimum =
              infoResolved?.unit === '%' ? setting.value / 100 : setting.value // TODO: Conversion
            return { value: filterNode, minimum: minimum }
          })
      )
      .filter((x) => x.value && x.minimum > -Infinity)

    const unoptimizedNodes = [
      ...valueFilter.map((x) => x.value),
      unoptimizedOptimizationTargetNode,
    ]

    let nodes = optimize(
      unoptimizedNodes,
      workerData,
      ({ path: [p] }) => p !== 'dyn'
    )
    const statKeys: readonly string[] = Array.from(
      new Set([...allSubstatKeys, ...allMainStatKeys] as const)
    )
    nodes = mapFormulas(
      nodes,
      (f) => {
        if (f.operation === 'read' && f.path[0] === 'dyn') {
          // const a = artSets[f.path[1]]
          // if (a) return constant(a)
          const stat = f.path[1]
          if (!statKeys.includes(stat)) return constant(0)
        }
        return f
      },
      (f) => f
    )
    nodes = optimize(nodes, {}, (_) => false)

    const scalesWith = new Set<string>()
    precompute(
      nodes,
      {},
      (f) => {
        const val = f.path[1]
        scalesWith.add(val)
        return val
      },
      1
    )

    return {
      target: optimizationTarget,
      scalesWith: [...scalesWith],
    }
  }, [buildSetting, characterKey, dataContextValue.teamData])

  if (!optTargetContextObj) return children
  console.log({ optTargetContextObj })
  return (
    <OptTargetContext.Provider value={optTargetContextObj}>
      {children}
    </OptTargetContext.Provider>
  )
}
