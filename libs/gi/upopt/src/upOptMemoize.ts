import type { MainSubStatKey } from '@genshin-optimizer/gi/consts'
import {
  type ArtifactSetKey,
  type ArtifactSlotKey,
  type MainStatKey,
  type SubstatKey,
  allSubstatKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { substatWeights } from './consts'
import { deduplicate } from './deduplicate'
import { evalMarkovNode } from './markov-tree/evaluation'
import type { Objective } from './markov-tree/markov.types'
import { elixirDefinition } from './upOpt'
import type { SubstatLevelNode } from './upOpt.types'

type CacheType = {
  tree: weightedNode[]
  subsFn: (
    mainStatKey: MainStatKey,
    affixes: SubstatKey[]
  ) => (key: MainSubStatKey) => MainSubStatKey
}

/**
 * Uses stat weight symmetry to memoize the results of elixirDefinition.
 * e.g. distribution of [ATK%, DEF] is the same as [DEF%, HP].
 * @param info
 * @param currentBuild
 * @param obj
 * @param cache
 */
export function elixirDefinitionMemoize(
  info: {
    setKey: ArtifactSetKey | ''
    slotKey: ArtifactSlotKey
    mainStatKey: MainStatKey
    affixes: SubstatKey[]
    prob_4line: number
  },
  currentBuild: Build,
  obj: Objective,
  cache: Record<string, weightedNode[]>
) {
  const { setKey, slotKey, mainStatKey, affixes, prob_4line } = info

  const mainStatWeight = allSubstatKeys.includes(mainStatKey as SubstatKey)
    ? substatWeights[mainStatKey as SubstatKey]
    : 0
  const affixWeights = affixes.map((a) => substatWeights[a]).sort()

  const cacheKey = `${mainStatWeight};${affixWeights.join('_')};${prob_4line}`
  console.log('cacheKey', cacheKey)

  if (cache[cacheKey]) {
    throw new Error('Cache hit for elixirDefinitionMemoize not implemented yet')
  }

  const substatNodes = elixirDefinition(info, currentBuild)

  // 1. Strip away any keys that are not in the objective's allReadKeys.
  // 2. Remove mainStat from base.
  substatNodes.forEach(({ n }) => {
    // n.base[mainStatKey] -= getMainStatValue(mainStatKey, 5, 20)
    n.base = Object.fromEntries(
      Object.entries(n.base).filter(
        ([k, v]) => obj.allReadKeys.includes(k) //&& v !== 0
      )
    )
  })
  const nodes = deduplicate(obj, substatNodes).map(({ p, n }) => ({
    p,
    n: evalMarkovNode(obj, n),
  }))
  console.log('nodes', nodes)
  console.log(nodes[0].n.base)
  console.log(nodes[0].n.subkeys)
  // console.log(nodes[1].n.base)
  // console.log(nodes[1].n.subkeys)
  // console.log(nodes[1].n.reshape)
}

type Build = Record<ArtifactSlotKey, ICachedArtifact | undefined>
type weightedNode = { p: number; n: SubstatLevelNode }
