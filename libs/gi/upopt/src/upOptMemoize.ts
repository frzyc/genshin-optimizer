import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import { allSubstatKeys } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { DynStat } from '@genshin-optimizer/gi/solver'
import { getRollsRemaining } from '@genshin-optimizer/gi/util'
import { deduplicate } from './deduplicate'
import { makeSubstatNode } from './expandSubstat'
import type { Objective } from './markov-tree/markov.types'
import { crawlSubstats } from './substatProbs'
import { toStats } from './upOpt'
import type { SubstatLevelNode } from './upOpt.types'

/**
 * Memoized variant of `elixirDefinition()`. For a fixed (mainStatKey, affixes) pair the
 * substat crawl produces the same node list regardless of setKey/slotKey/build - only the
 * `base` stats differ. Two competing strategies, both drop-in replacements:
 *
 * - `elixirDefinitionMemoSimplified`: cache the nodes per (mainStatKey, affixes), but templates
 *   are stored post-`deduplicate(obj, ...)`: zero-derivative substats are stripped and combos
 *   that differ only in irrelevant substats are merged. Fewer & smaller nodes per entry,
 *   so the cache shrinks and every downstream stage (evaluation, expansion) does less work.
 *   Assumes all calls sharing a cache use the same objective.
 */

type Build = Record<ArtifactSlotKey, ICachedArtifact | undefined>
type WeightedNode = { p: number; n: SubstatLevelNode }
export type ElixirDefineQuery = {
  setKey: ArtifactSetKey | ''
  slotKey: ArtifactSlotKey
  mainStatKey: MainStatKey
  affixes: SubstatKey[]
  prob_4line: number
}

const rarity = 5 as const
const mintotal = 2 // Elixir guarantees at least 2 total rolls on the 2 chosen affixes.

function sortedAffixes(affixes: SubstatKey[]) {
  return [...affixes].sort((a, b) => a.localeCompare(b))
}

function affixPool(mainStatKey: MainStatKey, affixes: SubstatKey[]) {
  return allSubstatKeys.filter((s) => !affixes.includes(s) && s !== mainStatKey)
}

/**
 * Main stats that cannot appear as substats (elemental/physical dmg, heal_) all leave the
 * same substat pool, so their templates are identical; collapse them to one '' bucket.
 */
function mainStatCacheKey(mainStatKey: MainStatKey) {
  return (allSubstatKeys as readonly string[]).includes(mainStatKey)
    ? mainStatKey
    : ''
}

/**
 * Clone a cached template with the query's `base` stats. `deduplicate()` reassigns node
 * fields in place, so the node & subDistr wrappers must be fresh per retrieval; the inner
 * mu/cov/subkeys arrays are never mutated downstream and can be shared with the cache.
 */
function rebase(n: SubstatLevelNode, base: DynStat): SubstatLevelNode {
  return { ...n, base, subDistr: { ...n.subDistr, base } }
}

// ---------------------------------------------------------------------------
// Method A': objective-simplified node-list cache
// ---------------------------------------------------------------------------

/**
 * `${mainStatKey};${affixes.join('+')};${3|4}` -> deduplicated node list with empty
 * `base`. Non-substat main stats share the '' bucket (see `mainStatCacheKey`).
 * Entries are simplified against a specific objective, so all calls sharing a
 * cache MUST use the same objective; clear (or replace) the cache when it changes.
 */
export type ElixirSimplifiedCache = Map<string, WeightedNode[]>

function getSimplifiedTemplates(
  mainStatKey: MainStatKey,
  affixes: SubstatKey[], // sorted
  lines: 3 | 4,
  obj: Objective,
  cache: ElixirSimplifiedCache
): WeightedNode[] {
  const cacheKey = `${mainStatCacheKey(mainStatKey)};${affixes.join('+')};${lines}`
  const hit = cache.get(cacheKey)
  if (hit) return hit

  const rollsLeft = getRollsRemaining(0, rarity) - (4 - lines)
  // Build fresh raw nodes: deduplicate() mutates them in place, so they must not be
  // shared with the plain full-node cache.
  const raw = crawlSubstats(affixes, affixPool(mainStatKey, affixes)).map(
    ({ p, subs }) => ({
      p,
      n: makeSubstatNode({
        base: {},
        rarity,
        subkeys: subs.map((key) => ({ key, baseRolls: 1 })),
        rollsLeft,
        reshape: { affixes: [...affixes], mintotal },
      }),
    })
  )
  const templates = deduplicate(obj, raw) as WeightedNode[]
  cache.set(cacheKey, templates)
  return templates
}

/**
 * Returns the objective-simplified & merged node list, i.e. what `deduplicate(obj, elixirDefinition(info, build))`
 * would produce (up to float rounding in the merged probabilities). All calls sharing a cache must use the
 * same objective.
 */
export function elixirDefinitionMemoSimplified(
  info: ElixirDefineQuery,
  currentBuild: Build,
  obj: Objective,
  cache: ElixirSimplifiedCache
): WeightedNode[] {
  const base = toStats(currentBuild, { ...info, rarity })
  const affixes = sortedAffixes(info.affixes)
  // deduplicate() sorts 4-line (rollsLeft 5) nodes ahead of 3-line, so concatenating the
  // two template blocks reproduces its output ordering.
  const t4 = getSimplifiedTemplates(info.mainStatKey, affixes, 4, obj, cache)
  const t3 = getSimplifiedTemplates(info.mainStatKey, affixes, 3, obj, cache)
  return [
    ...t4.map(({ p, n }) => ({ p: p * info.prob_4line, n: rebase(n, base) })),
    ...t3.map(({ p, n }) => ({
      p: p * (1 - info.prob_4line),
      n: rebase(n, base),
    })),
  ]
}
