import type { ArtifactRarity, SubstatKey } from '@genshin-optimizer/gi/consts'
import type { DynStat } from '@genshin-optimizer/gi/solver'
import { getSubstatValue } from '@genshin-optimizer/gi/util'

import { crawlUpgrades, diag, rollCountProb, rollCountMuVar } from './mathUtil'
import type { RollsLevelNode, SubstatLevelNode } from './upOpt.types'

export function expandSubstatLevel(
  parent: SubstatLevelNode
): { p: number; n: RollsLevelNode }[] {
  const { rollsLeft, subkeys, reshape } = parent
  const reshapeIxs: number[] = getReshapeIxs(subkeys, reshape)

  const out: { p: number; n: RollsLevelNode }[] = []
  crawlUpgrades(rollsLeft).map((counts) => {
    const rollsObj = subkeys.map(({ key, baseRolls }, i) => ({
      key,
      rolls: counts[i] + baseRolls,
    }))
    const p = rollCountProb(
      counts,
      reshape && {
        min: reshape.mintotal,
        n: reshape.affixes.length,
        total: reshapeIxs.reduce((a, i) => a + counts[i], 0),
      }
    )

    if (p === 0) return // Impossible configuration under reshaping constraints
    out.push({ p, n: makeRollsNode(parent, rollsObj) })
  })
  return out
}

function getUniformSubstatValues(key: SubstatKey, rarity: ArtifactRarity) {
  if (rarity === 5 || rarity === 4 || rarity === 3) {
    return [0.7, 0.8, 0.9, 1].map(
      (x) => x * getSubstatValue(key, rarity, 'max', false)
    )
  }
  throw new Error('Invalid rarity')
}
// Memoized substat value variance lookup
const substatMuVarCache: Record<string, { mu: number; sig2: number }> = {}
function subMuVar(key: SubstatKey, rarity: ArtifactRarity) {
  const cacheKey = JSON.stringify({ key, rarity })
  if (substatMuVarCache[cacheKey]) return substatMuVarCache[cacheKey]

  const values = getUniformSubstatValues(key, rarity)
  const mu = values.reduce((a, b) => a + b, 0) / values.length
  const sig2 = values.reduce((a, b) => a + (b - mu) ** 2, 0) / values.length
  substatMuVarCache[cacheKey] = { mu, sig2 }
  return { mu, sig2 }
}

function getReshapeIxs(
  subkeys: { key: SubstatKey; baseRolls: number }[],
  reshape?: { affixes: SubstatKey[]; mintotal: number }
): number[] {
  if (!reshape) return []
  let subkLength = subkeys.length
  return reshape.affixes.map((a) => {
    const ix = subkeys.findIndex(({ key }) => key === a)
    if (ix === -1) {
      if (subkLength < 4) {
        subkLength += 1
        return subkLength - 1
      }
      throw new Error('Reshape affix missing and all substats present')
    }
    return ix
  })
}

/**
 * Given a list of indices, [i0, i2, ..., ik], return a list of swaps (i, j) that will
 * place a[0] at i0, a[1] at i1, ..., a[k] at ik.
 */
function ixsToSwaps(ixs: number[], nmax: number): number[][] {
  const tracker = Array.from({ length: nmax }, (_, i) => i)

  const out: number[][] = []
  ixs.forEach((i, j) => {
    if (i === tracker[j]) return
    out.push([i, tracker[j]])
    swap(tracker, i, j)
  })
  return out
}

function swap(arr: any[], i: number, j: number) {
  if (i === j) return
  const tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}

export function makeRollsNode(
  { base, rarity }: SubstatLevelNode,
  rolls: { key: SubstatKey; rolls: number }[]
): RollsLevelNode {
  return {
    type: 'rolls',
    base,
    rarity,
    subs: rolls,
    subDistr: {
      base,
      subs: rolls.map(({ key }) => key),
      mu: rolls.map(({ key, rolls }) => rolls * subMuVar(key, rarity).mu),
      cov: diag(
        rolls.map(({ key, rolls }) => rolls * subMuVar(key, rarity).sig2)
      ),
    },
  }
}

type SubstatLevelInfo = {
  base: DynStat
  rarity: ArtifactRarity
  subkeys: { key: SubstatKey; baseRolls: number }[]
  rollsLeft: number
  reshape?: { affixes: SubstatKey[]; mintotal: number } // Dust of enlightenment reshaping - warps rolls distributions.
}
export function makeSubstatNode(info: SubstatLevelInfo): SubstatLevelNode {
  const { rollsLeft, subkeys, reshape } = info
  subkeys.sort((a, b) => a.key.localeCompare(b.key)) // Ensure consistent ordering
  reshape?.affixes.sort((a, b) => a.localeCompare(b)) // Ensure consistent ordering
  const { mu: muRoll, cov: covRoll } = rollCountMuVar(
    rollsLeft,
    reshape
      ? { n: reshape.affixes.length, min: reshape.mintotal }
      : { n: 0, min: 0 }
  )
  // Reorder mu, cov so that reshaped affixes are where they should be.
  const reshapeIxs: number[] = getReshapeIxs(subkeys, reshape)
  ixsToSwaps(reshapeIxs, 4).forEach(([i, j]) => {
    swap(muRoll, i, j)
    swap(covRoll, i, j)
    covRoll.forEach((row) => swap(row, i, j))
  })

  // Increment muRoll by base rolls
  subkeys.forEach(({ baseRolls }, i) => {
    muRoll[i] = muRoll[i] + baseRolls
  })

  // Trim to only the subkeys present & scale by substat value mu, var
  const smv = subkeys.map(({ key }) => subMuVar(key, info.rarity))
  const mu = muRoll
    .filter((_, i) => i < subkeys.length)
    .map((v, i) => v * smv[i].mu)
  const cov = covRoll
    .filter((_, i) => i < subkeys.length)
    .map((row, i) =>
      row
        .filter((_, j) => j < subkeys.length)
        .map(
          (val, j) =>
            val * smv[i].mu * smv[j].mu +
            (i === j ? smv[i].sig2 * muRoll[i] : 0)
        )
    )

  return {
    type: 'substat',
    ...info,
    subDistr: {
      base: info.base,
      subs: info.subkeys.map(({ key }) => key),
      mu,
      cov,
    },
  }
}
