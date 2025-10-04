import { type SubstatKey } from '@genshin-optimizer/gi/consts'
import { substatWeights } from './consts'

function combinations<T>(
  arr: readonly T[],
  k: number,
  prefix: T[] = []
): T[][] {
  if (k === 0) return [prefix]
  return arr.flatMap((v, i) =>
    combinations(arr.slice(i + 1), k - 1, [...prefix, v])
  )
}

/**
 * Returns the total probability of that `chosen` is a subset of the final substats for all
 * possible selections of N substats from `options`.
 *
 * Substats are encoded as their weight, e.g. [3, 4, 4, 6] for [Crit%, ATK%, DEF%, ATK].
 * IMPORTANT: We assume both `chosen` and `options` are sorted increasing.
 * Behavior is undefined if not sorted.
 *
 * @param chosen The set of selected substats.
 * @param options The set of available substats.
 * @param remaining How many more substats can be chosen.
 * @returns
 */
const substatProbCache: Record<string, number> = {}
function substatProb(
  chosen: readonly number[],
  options: readonly number[],
  remaining = 0
): number {
  if (chosen.length === 0) return 1
  if (chosen.length > remaining) return 0

  const key = JSON.stringify({ chosen, options, remaining })
  if (substatProbCache[key] !== undefined) return substatProbCache[key]

  const denom = options.reduce((a, subW) => a + subW, 0)
  let _c = -1
  const chosenIxs = chosen.map((c) => (_c = options.indexOf(c, _c + 1)))

  const p = options
    .map(
      (subW, i) =>
        (subW / denom) *
        substatProb(
          chosen.filter((_, j) => i !== chosenIxs[j]),
          options.filter((_, j) => i !== j),
          remaining - 1
        )
    )
    .reduce((a, b) => a + b, 0)
  substatProbCache[key] = p
  return p
}

export function crawlSubstats(
  prefix: readonly SubstatKey[],
  options: readonly SubstatKey[],
  insertPrefix = true
): { p: number; subs: SubstatKey[] }[] {
  const optW = options.map((k) => substatWeights[k]).sort((a, b) => a - b)
  return combinations(options, 4 - prefix.length)
    .map((combo) => {
      const comboW = combo.map((k) => substatWeights[k]).sort((a, b) => a - b)
      const p = substatProb(comboW, optW, 4 - prefix.length)
      if (insertPrefix) return { p, subs: [...prefix, ...combo] }
      return { p, subs: combo }
    })
    .filter(({ p }) => p > 0)
}
