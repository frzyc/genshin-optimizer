import type {
  ArtifactRarity,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import {
  type ArtifactSlotKey,
  allMainStatKeys,
  allSubstatKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { substatWeights } from './consts'
import { elixirDefinition } from './upOpt'
import type { SubstatLevelNode } from './upOpt.types'

const emptyBuild = {
  flower: undefined,
  plume: undefined,
  sands: undefined,
  goblet: undefined,
  circlet: undefined,
}
export function stripInfo(nodes: weightedNode[]) {
  Object.keys(nodes[0].n.base).forEach((k) => {
    delete nodes[0].n.base[k]
  })
  return nodes
    .filter(({ p }) => p > 0)
    .map(({ p, n }) => ({
      p,
      n: {
        rarity: n.rarity,
        subkeys: n.subkeys,
        rollsLeft: n.rollsLeft,
        reshape: n.reshape,
      },
    }))
}

export function dothing() {
  const output: Record<string, weightedNode[]> = {}

  const mainStatWeights = new Set<number>()

  allMainStatKeys.forEach((mainStatKey) => {
    const mainStatWeight = substatWeights[mainStatKey as SubstatKey] ?? 0
    if (mainStatWeights.has(mainStatWeight)) return
    mainStatWeights.add(mainStatWeight)

    const subOptions = allSubstatKeys.filter((subKey) => subKey !== mainStatKey)
    for (let i = 0; i < subOptions.length; i++) {
      for (let j = i + 1; j < subOptions.length; j++) {
        const affixes = [subOptions[i], subOptions[j]]
        const affixWeights = affixes
          .map((subKey) => substatWeights[subKey])
          .sort((a, b) => a - b)

        // const cacheKey4 = `${mainStatKey};${affixes.join('+')};4`
        const cacheKey4 = `${mainStatWeight};${affixWeights.join('+')};4`
        const obj4 = elixirDefinition(
          {
            setKey: 'GladiatorsFinale',
            slotKey: 'flower',
            mainStatKey,
            affixes,
            prob_4line: 1,
          },
          emptyBuild
        )
        output[cacheKey4] = stripInfo(obj4)

        // const cacheKey3 = `${mainStatKey};${affixes.join('+')};3`
        const cacheKey3 = `${mainStatWeight};${affixWeights.join('+')};3`
        const obj3 = elixirDefinition(
          {
            setKey: 'GladiatorsFinale',
            slotKey: 'flower',
            mainStatKey,
            affixes,
            prob_4line: 1,
          },
          emptyBuild
        )
        output[cacheKey3] = stripInfo(obj3)
      }
    }
  })

  return output
}

export function dothing2(info: {
  rarity: ArtifactRarity
  mainStatWeight: number
  subkeys: { weight: number; baseRolls: number }[]
  rollsLeft: number
  reshape?: { affixes: number[]; mintotal: number }
}) {

}

type Build = Record<ArtifactSlotKey, ICachedArtifact | undefined>
type weightedNode = { p: number; n: SubstatLevelNode }
