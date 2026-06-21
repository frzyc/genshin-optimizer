import { toDecimal } from '@genshin-optimizer/common/util'
import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  allSubstatKeys,
  artMaxLevel,
  artSlotMainKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { IArtifact } from '@genshin-optimizer/gi/good'
import type { DynStat } from '@genshin-optimizer/gi/solver'
import { getMainStatValue, getRollsRemaining } from '@genshin-optimizer/gi/util'

import { allMainStatProbs } from './consts'
import { expandRollsLevel } from './expandRolls'
import { expandSubstatLevel, makeSubstatNode } from './expandSubstat'
import { crawlSubstats } from './substatProbs'
import type { MarkovNode, SubstatLevelNode } from './upOpt.types'

export function expandNode(node: MarkovNode): { p: number; n: MarkovNode }[] {
  if (node.type === 'substat') return expandSubstatLevel(node)
  if (node.type === 'rolls') return expandRollsLevel(node)
  return [{ p: 1, n: node }]
}

export function expandNodes(
  nodes: { p: number; n: MarkovNode }[]
): { p: number; n: MarkovNode }[] {
  return nodes.flatMap(({ p, n }) =>
    expandNode(n).map(({ p: p2, n: n2 }) => ({ p: p * p2, n: n2 }))
  )
}

/**
 * Simulates leveling up an existing artifact to its max level.
 */
export function levelUpArtifact(
  art: ICachedArtifact,
  currentBuild: Build
): weightedNode[] {
  const base = toStats(currentBuild, art)
  const { subkeys, stats } = getSubkeys(art)
  Object.entries(stats).forEach(([k, v]) => (base[k] = (base[k] ?? 0) + v))
  const rollsLeft = getRollsRemaining(art.level, art.rarity)
  const { rarity } = art
  const info = {
    base,
    rarity,
    subkeys: subkeys.map((key) => ({ key, baseRolls: 0 })),
    rollsLeft,
  }

  // If 4 substats, no expansion needed.
  if (subkeys.length === 4) return [{ p: 1, n: makeSubstatNode(info) }]

  // Unactivated substats - Insert and remove a remaining roll.
  const anyUnactivated = art.unactivatedSubstats?.some(({ key }) => key !== '')
  if (art.unactivatedSubstats && anyUnactivated) {
    art.unactivatedSubstats.forEach(({ key, accurateValue }) => {
      if (key === '') return
      info.base[key] = (info.base[key] ?? 0) + toDecimal(accurateValue, key)
      info.subkeys.push({ key, baseRolls: 0 })
      info.rollsLeft -= 1
    })
    return [{ p: 1, n: makeSubstatNode(info) }]
  }

  // TODO: sum over possible 4th stat
  const subsToConsider = allSubstatKeys.filter(
    (s) => !subkeys.includes(s) && s !== art.mainStatKey
  )
  return crawlSubstats(subkeys, subsToConsider, false).map(({ p, subs }) => {
    const info2 = {
      ...info,
      subkeys: [...info.subkeys, ...subs.map((key) => ({ key, baseRolls: 1 }))],
      rollsLeft: info.rollsLeft - subs.length,
    }
    return {
      p,
      n: makeSubstatNode(info2),
    }
  })
}

/**
 * Simulates obtaining a fresh artifact from a Domain, Boss, or Strongbox then
 * leveling it to max level.
 */
export function freshArtifact(
  info: { sets: ArtifactSetKey[]; p3sub: number; rarity: ArtifactRarity },
  currentBuild: Build
): weightedNode[] {
  const { rarity, p3sub } = info
  const out: weightedNode[] = []
  allArtifactSlotKeys.forEach((slotKey) => {
    const pSlot = 1 / 5
    artSlotMainKeys[slotKey].forEach((mainStatKey) => {
      info.sets.forEach((setKey) => {
        const pSet = 1 / info.sets.length
        const pMain = allMainStatProbs[slotKey][mainStatKey] ?? 0
        const base = toStats(currentBuild, {
          slotKey,
          rarity,
          mainStatKey,
          setKey,
        })

        const subsToConsider = allSubstatKeys.filter((s) => s !== mainStatKey)
        crawlSubstats([], subsToConsider).forEach(({ p, subs }) => {
          const nodeInfo = {
            base,
            rarity,
            subkeys: subs.map((key) => ({ key, baseRolls: 1 })),
            rollsLeft: getRollsRemaining(0, rarity),
          }
          const n = makeSubstatNode(nodeInfo)
          out.push({ p: p * pMain * pSet * pSlot * (1 - p3sub), n })

          // 3-substat start just means we have one fewer total roll.
          nodeInfo.rollsLeft -= 1
          const n2 = makeSubstatNode(nodeInfo)
          out.push({ p: p * pMain * pSet * pSlot * p3sub, n: n2 })
        })
      })
    })
  })
  return out
}

/**
 * Artifact reshaping / rerolling using Dust of Enlightenment. We select two affixes and reroll from
 * Level 0 (or 4) and guarantee that at least `mintotal` rolls go into those affixes.
 */
export function dustReshape(
  art: IArtifact,
  currentBuild: Build,
  affixes: SubstatKey[],
  mintotal: number
): weightedNode[] {
  const base = toStats(currentBuild, art)
  const { rarity } = art
  const subkeys = art.substats.flatMap(({ key, initialValue }) => {
    if (key === '') return []
    if (initialValue === undefined)
      throw new Error('Cannot reshape artifacts with `initialValue` undefined.')
    base[key] = (base[key] ?? 0) + toDecimal(initialValue, key)
    return [{ key, baseRolls: 0 }]
  })
  const totalRolls =
    art.totalRolls ?? subkeys.length + getRollsRemaining(0, art.rarity)
  const rollsLeft = Math.max(0, totalRolls - subkeys.length)
  return [
    {
      p: 1,
      n: makeSubstatNode({
        base,
        rarity,
        subkeys,
        rollsLeft,
        reshape: { affixes, mintotal },
      }),
    },
  ]
}

/**
 * Artifact definition using Sanctifying Elixir. Two affixes are guaranteed w/ two
 * reshape-style roll guarantees. Defined artifacts can start as either 3-line or 4-line.
 */
export function elixirDefinition(
  info: {
    setKey: ArtifactSetKey | ''
    slotKey: ArtifactSlotKey
    mainStatKey: MainStatKey
    affixes: SubstatKey[]
    prob_4line: number
  },
  currentBuild: Build
): weightedNode[] {
  const rarity = 5 as const
  const base = toStats(currentBuild, { ...info, rarity })
  const rollsLeft = getRollsRemaining(0, 5)

  const subsToConsider = allSubstatKeys.filter(
    (s) => !info.affixes.includes(s) && s !== info.mainStatKey
  )
  return crawlSubstats(info.affixes, subsToConsider).flatMap(({ p, subs }) => {
    const nodeInfo_4line = {
      base,
      rarity,
      subkeys: subs.map((key) => ({ key, baseRolls: 1 })),
      rollsLeft,
      reshape: { affixes: [...info.affixes], mintotal: 2 },
    }
    const nodeInfo_3line = { ...nodeInfo_4line, rollsLeft: rollsLeft - 1 }
    return [
      {
        p: p * info.prob_4line,
        n: makeSubstatNode(nodeInfo_4line),
      },
      {
        p: p * (1 - info.prob_4line),
        n: makeSubstatNode(nodeInfo_3line),
      },
    ]
  })
}

function artToStats(art: ICachedArtifact, mainStatMax = true) {
  const stats = {} as DynStat
  if (mainStatMax) {
    stats[art.mainStatKey] = getMainStatValue(
      art.mainStatKey,
      art.rarity,
      mainStatMax ? artMaxLevel[art.rarity] : art.level
    )
  } else {
    stats[art.mainStatKey] = toDecimal(art.mainStatVal, art.mainStatKey)
  }
  art.substats.forEach(({ key, accurateValue }) => {
    if (!key) return
    stats[key] = toDecimal(accurateValue, key)
  })
  stats[art.setKey] = 1
  return stats
}

function toStats(
  build: Build,
  {
    slotKey,
    mainStatKey,
    rarity,
    setKey,
  }: {
    slotKey: ArtifactSlotKey
    mainStatKey: MainStatKey
    rarity: ArtifactRarity
    setKey: ArtifactSetKey | ''
  }
) {
  const baseStats = allArtifactSlotKeys.reduce((acc, slot) => {
    if (slot === slotKey) return acc
    const art = build[slot]
    if (!art) return acc

    Object.entries(artToStats(art, false)).forEach(([k, v]) => {
      acc[k] = (acc[k] ?? 0) + v
    })
    return acc
  }, {} as DynStat)
  if (setKey !== '') baseStats[setKey] = (baseStats[setKey] ?? 0) + 1
  baseStats[mainStatKey] =
    (baseStats[mainStatKey] ?? 0) +
    getMainStatValue(mainStatKey, rarity, artMaxLevel[rarity])
  return baseStats
}

function getSubkeys(art: ICachedArtifact) {
  const subkeys = art.substats.map(({ key }) => key).filter((key) => key !== '') // Filter out empty substats
  const stats = art.substats.reduce((acc, { key, accurateValue }) => {
    if (key === '') return acc
    acc[key] = toDecimal(accurateValue, key)
    return acc
  }, {} as DynStat)
  return { subkeys, stats }
}

type Build = Record<ArtifactSlotKey, ICachedArtifact | undefined>
type weightedNode = { p: number; n: SubstatLevelNode }
